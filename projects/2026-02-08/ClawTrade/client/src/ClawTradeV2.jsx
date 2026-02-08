import { useState, useEffect, useCallback, useRef } from "react";
import * as recharts from "recharts";
import * as api from './api.js';
import { getUserIdSync, getUserDisplayName } from './userSession.js';

const { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } = recharts;

// ============================================================
// CONFIG
// ============================================================
const COINS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", icon: "₿" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", icon: "Ξ" },
  { id: "solana", symbol: "SOL", name: "Solana", icon: "◎" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin", icon: "Ð" },
  { id: "cardano", symbol: "ADA", name: "Cardano", icon: "₳" },
  { id: "ripple", symbol: "XRP", name: "XRP", icon: "✕" },
  { id: "chainlink", symbol: "LINK", name: "Chainlink", icon: "⬡" },
  { id: "avalanche-2", symbol: "AVAX", name: "Avalanche", icon: "▲" },
  { id: "polkadot", symbol: "DOT", name: "Polkadot", icon: "●" },
  { id: "uniswap", symbol: "UNI", name: "Uniswap", icon: "🦄" },
  { id: "litecoin", symbol: "LTC", name: "Litecoin", icon: "Ł" },
  { id: "matic-network", symbol: "MATIC", name: "Polygon", icon: "⬟" },
];

const INITIAL_CASH = 100000;
const PIE_COLORS = ["#00f0ff","#f59e0b","#8b5cf6","#ec4899","#10b981","#3b82f6","#ef4444","#06b6d4","#f97316","#a78bfa","#6ee7b7","#fb923c"];

// ============================================================
// HELPERS
// ============================================================
const fmt = (n, d = 2) => {
  if (n === undefined || n === null || isNaN(n)) return "--";
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (Math.abs(n) >= 1e4) return `$${n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })}`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })}`;
};

const fmtPct = (n) => {
  if (n === undefined || n === null || isNaN(n)) return "--";
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
};

const fmtQty = (n) => {
  if (n === undefined || n === null) return "--";
  if (n >= 1) return n.toFixed(4);
  if (n >= 0.001) return n.toFixed(6);
  return n.toFixed(8);
};

function genSparkline(base, volatility = 0.02, pts = 24) {
  let price = base;
  return Array.from({ length: pts }, (_, i) => {
    price *= 1 + (Math.random() - 0.48) * volatility;
    return { t: i, p: price };
  });
}

// ============================================================
// MAIN APP (V2 - 连接后端 API)
// ============================================================
export default function ClawTradeV2() {
  // ------ STATE ------
  const [prices, setPrices] = useState({});
  const [sparklines, setSparklines] = useState({});
  const [cash, setCash] = useState(INITIAL_CASH);
  const [positions, setPositions] = useState({});
  const [history, setHistory] = useState([]);
  const [signals, setSignals] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(COINS[0]);
  const [tradeType, setTradeType] = useState("buy");
  const [tradeAmount, setTradeAmount] = useState("");
  const [activeTab, setActiveTab] = useState("market");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tradeSuccess, setTradeSuccess] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [userId, setUserId] = useState(null);

  // ------ 从后端获取价格 ------
  const fetchPrices = useCallback(async () => {
    try {
      const data = await api.fetchMarketPrices();
      setPrices(data);
      setLoading(false);
      setError(null);
      generateSignals(data);
    } catch (e) {
      console.error("价格获取失败:", e);
      setError("行情更新失败，使用缓存数据");
      if (Object.keys(prices).length === 0) {
        setLoading(false);
      }
    }
  }, []);

  // ------ 从后端获取持仓 ------
  const loadPortfolio = useCallback(async () => {
    try {
      const data = await api.fetchPortfolio();
      setCash(data.cash);

      // 转换持仓格式（后端格式 → 前端格式）
      const posMap = {};
      data.positions.forEach(pos => {
        posMap[pos.symbol] = {
          symbol: pos.symbol,
          coinId: pos.coinId,
          icon: pos.icon,
          name: pos.name,
          amount: pos.amount,
          avgCost: pos.avgCost,
          totalCost: pos.totalCost
        };
      });
      setPositions(posMap);
    } catch (e) {
      console.error("持仓加载失败:", e);
    }
  }, []);

  // ------ 从后端获取交易历史 ------
  const loadHistory = useCallback(async () => {
    try {
      const trades = await api.fetchTradeHistory();
      setHistory(trades);
    } catch (e) {
      console.error("历史记录加载失败:", e);
    }
  }, []);

  // ------ 生成信号 ------
  const generateSignals = (data) => {
    const newSignals = [];
    COINS.forEach((coin) => {
      const d = data[coin.id];
      if (!d) return;
      const change = d.usd_24h_change || 0;
      if (Math.abs(change) > 3) {
        newSignals.push({
          id: `${coin.symbol}_${Date.now()}`,
          symbol: coin.symbol,
          icon: coin.icon,
          type: change > 0 ? "bullish" : "bearish",
          message: change > 0
            ? `${coin.symbol} 强势上涨 ${change.toFixed(1)}%，关注突破机会`
            : `${coin.symbol} 大幅下跌 ${Math.abs(change).toFixed(1)}%，注意风险`,
          price: d.usd,
          change: change,
          time: new Date().toLocaleString("zh-CN", { hour12: false }),
          strength: Math.abs(change) > 7 ? "强" : "中",
        });
      }
    });
    if (newSignals.length > 0) {
      setSignals((prev) => [...newSignals, ...prev].slice(0, 20));
    }
  };

  // ------ EFFECTS ------
  useEffect(() => {
    // 获取用户ID
    const id = getUserIdSync();
    setUserId(id);

    fetchPrices();
    loadPortfolio();
    loadHistory();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, [fetchPrices, loadPortfolio, loadHistory]);

  // ------ 交易执行（调用后端 API）------
  const executeTrade = async () => {
    const amount = parseFloat(tradeAmount);
    if (!amount || amount <= 0) return;

    try {
      if (tradeType === "buy") {
        const result = await api.buyTrade({
          coin_id: selectedCoin.id,
          symbol: selectedCoin.symbol,
          name: selectedCoin.name,
          icon: selectedCoin.icon,
          amount_usd: amount,
          source: 'WEB'
        });

        setTradeSuccess({ ok: true, msg: result.message });
        setCash(result.new_balance);
      } else {
        const result = await api.sellTrade({
          coin_id: selectedCoin.id,
          symbol: selectedCoin.symbol,
          amount_usd: amount,
          source: 'WEB'
        });

        setTradeSuccess({ ok: true, msg: result.message });
        setCash(result.new_balance);
      }

      setTradeAmount("");
      loadPortfolio();
      loadHistory();
      setTimeout(() => setTradeSuccess(null), 3000);
    } catch (error) {
      setTradeSuccess({ ok: false, msg: error.message });
      setTimeout(() => setTradeSuccess(null), 2000);
    }
  };

  // ------ 获取 AI 建议 ------
  const getAiSuggestion = async () => {
    try {
      setShowAiPanel(true);
      setAiSuggestion({ loading: true });

      const suggestion = await api.getOpenClawSuggestion({
        coin_id: selectedCoin.id,
        symbol: selectedCoin.symbol,
        current_price: prices[selectedCoin.id]?.usd,
        user_cash: cash,
        user_positions: positions
      });

      setAiSuggestion(suggestion);
    } catch (error) {
      setAiSuggestion({ error: error.message });
    }
  };

  // ------ PORTFOLIO CALCULATIONS ------
  const totalPositionValue = Object.values(positions).reduce((sum, pos) => {
    const p = prices[pos.coinId]?.usd || pos.avgCost;
    return sum + pos.amount * p;
  }, 0);
  const totalAssets = cash + totalPositionValue;
  const totalPnL = totalAssets - INITIAL_CASH;
  const totalPnLPct = ((totalAssets / INITIAL_CASH) - 1) * 100;

  // Pie chart data
  const pieData = Object.values(positions).map((pos, i) => ({
    name: pos.symbol,
    value: pos.amount * (prices[pos.coinId]?.usd || pos.avgCost),
    color: PIE_COLORS[i % PIE_COLORS.length],
  }));
  if (cash > 0) pieData.push({ name: "现金", value: cash, color: "#334155" });

  const quickAmounts = [100, 500, 1000, 5000];

  // ------ LOADING ------
  if (loading && Object.keys(prices).length === 0) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0e17", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16, animation: "pulse 1.5s infinite" }}>📊</div>
          <div style={{ color: "#64748b", fontFamily: "'JetBrains Mono', monospace", fontSize: 14 }}>正在连接后端服务器...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #0a0e17 0%, #0d1320 50%, #0a0e17 100%)",
      color: "#e2e8f0",
      fontFamily: "'JetBrains Mono', 'Noto Sans SC', monospace",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;700&family=Orbitron:wght@400;500;600;700;800;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0e17; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 2px; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes glow { 0%,100% { box-shadow: 0 0 5px rgba(0,240,255,0.1); } 50% { box-shadow: 0 0 20px rgba(0,240,255,0.15); } }
        .grid-bg {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(0,240,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,240,255,0.02) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .card {
          background: rgba(13,19,32,0.8);
          border: 1px solid rgba(0,240,255,0.08);
          border-radius: 8px;
          backdrop-filter: blur(12px);
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .card:hover { border-color: rgba(0,240,255,0.2); box-shadow: 0 0 20px rgba(0,240,255,0.05); }
        .coin-row {
          display: grid;
          grid-template-columns: 200px 120px 100px 1fr 100px;
          align-items: center;
          padding: 12px 16px;
          cursor: pointer;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          transition: background 0.2s;
        }
        .coin-row:hover { background: rgba(0,240,255,0.03); }
        .coin-row.selected { background: rgba(0,240,255,0.06); border-left: 2px solid #00f0ff; }
        .btn {
          padding: 8px 16px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-family: inherit;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.2s;
          letter-spacing: 0.5px;
        }
        .btn-buy { background: #00c853; color: #000; }
        .btn-buy:hover { background: #00e676; box-shadow: 0 0 20px rgba(0,200,83,0.3); }
        .btn-sell { background: #ff1744; color: #fff; }
        .btn-sell:hover { background: #ff5252; box-shadow: 0 0 20px rgba(255,23,68,0.3); }
        .btn-ai { background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: #fff; }
        .btn-ai:hover { box-shadow: 0 0 20px rgba(139,92,246,0.3); }
        .btn-ghost { background: transparent; color: #64748b; border: 1px solid #1e293b; }
        .btn-ghost:hover { color: #e2e8f0; border-color: #334155; }
        .btn-ghost.active { color: #00f0ff; border-color: #00f0ff; background: rgba(0,240,255,0.05); }
        .tab { padding: 10px 20px; border: none; background: transparent; color: #64748b; cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 500; border-bottom: 2px solid transparent; transition: all 0.2s; }
        .tab:hover { color: #94a3b8; }
        .tab.active { color: #00f0ff; border-bottom-color: #00f0ff; }
        input[type="number"] {
          background: rgba(15,23,42,0.8);
          border: 1px solid #1e293b;
          color: #e2e8f0;
          padding: 10px 14px;
          border-radius: 6px;
          font-family: inherit;
          font-size: 14px;
          width: 100%;
          outline: none;
          transition: border-color 0.2s;
        }
        input[type="number"]:focus { border-color: #00f0ff; }
        input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; }
        .toast {
          position: fixed; top: 20px; right: 20px; z-index: 100;
          padding: 14px 24px; border-radius: 8px;
          font-size: 14px; font-weight: 500;
          animation: slideIn 0.3s ease-out;
          backdrop-filter: blur(12px);
        }
      `}</style>

      <div className="grid-bg" />

      {/* Toast */}
      {tradeSuccess && (
        <div className="toast" style={{
          background: tradeSuccess.ok ? "rgba(0,200,83,0.15)" : "rgba(255,23,68,0.15)",
          border: `1px solid ${tradeSuccess.ok ? "rgba(0,200,83,0.3)" : "rgba(255,23,68,0.3)"}`,
          color: tradeSuccess.ok ? "#00e676" : "#ff5252",
        }}>
          {tradeSuccess.msg}
        </div>
      )}

      {/* AI Suggestion Panel */}
      {showAiPanel && aiSuggestion && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(8px)",
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20
        }} onClick={() => setShowAiPanel(false)}>
          <div className="card" style={{ padding: 24, maxWidth: 500, width: "100%", animation: "slideIn 0.3s" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 28 }}>🤖</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#8b5cf6" }}>OpenClaw AI 建议</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{selectedCoin.symbol} 分析</div>
                </div>
              </div>
              <button className="btn-ghost" style={{ padding: "4px 12px" }} onClick={() => setShowAiPanel(false)}>✕</button>
            </div>

            {aiSuggestion.loading ? (
              <div style={{ textAlign: "center", padding: 40 }}>
                <div style={{ fontSize: 36, marginBottom: 12, animation: "pulse 1.5s infinite" }}>🧠</div>
                <div style={{ color: "#64748b" }}>AI 正在分析...</div>
              </div>
            ) : aiSuggestion.error ? (
              <div style={{ textAlign: "center", padding: 40, color: "#ff5252" }}>
                ❌ {aiSuggestion.error}
              </div>
            ) : (
              <div>
                <div style={{
                  padding: 16,
                  borderRadius: 8,
                  background: aiSuggestion.action === 'BUY' ? 'rgba(0,200,83,0.1)' : aiSuggestion.action === 'SELL' ? 'rgba(255,23,68,0.1)' : 'rgba(100,116,139,0.1)',
                  border: `1px solid ${aiSuggestion.action === 'BUY' ? 'rgba(0,200,83,0.3)' : aiSuggestion.action === 'SELL' ? 'rgba(255,23,68,0.3)' : 'rgba(100,116,139,0.3)'}`,
                  marginBottom: 16
                }}>
                  <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 8 }}>建议操作</div>
                  <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Orbitron', sans-serif", marginBottom: 12 }}>
                    {aiSuggestion.action === 'BUY' ? '🟢 买入' : aiSuggestion.action === 'SELL' ? '🔴 卖出' : '⚪ 观望'}
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.6, color: "#cbd5e1" }}>
                    {aiSuggestion.reason}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  <div style={{ padding: 12, background: "rgba(15,23,42,0.5)", borderRadius: 6 }}>
                    <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>信心度</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#00f0ff" }}>
                      {(aiSuggestion.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div style={{ padding: 12, background: "rgba(15,23,42,0.5)", borderRadius: 6 }}>
                    <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>风险等级</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: aiSuggestion.risk_level === 'HIGH' ? '#ff5252' : aiSuggestion.risk_level === 'LOW' ? '#00c853' : '#f59e0b' }}>
                      {aiSuggestion.risk_level}
                    </div>
                  </div>
                </div>

                {aiSuggestion.suggested_amount > 0 && (
                  <div style={{ padding: 12, background: "rgba(0,240,255,0.05)", borderRadius: 6, marginBottom: 16 }}>
                    <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>建议金额</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#00f0ff" }}>
                      ${aiSuggestion.suggested_amount.toFixed(2)}
                    </div>
                  </div>
                )}

                {aiSuggestion.action === 'BUY' && (
                  <button
                    className="btn btn-buy"
                    style={{ width: "100%", padding: 12 }}
                    onClick={() => {
                      setTradeType('buy');
                      setTradeAmount(String(aiSuggestion.suggested_amount || 1000));
                      setShowAiPanel(false);
                      setActiveTab('trade');
                    }}
                  >
                    采纳建议，立即买入
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* HEADER */}
      <header style={{
        position: "relative", zIndex: 10,
        padding: "16px 24px",
        borderBottom: "1px solid rgba(0,240,255,0.08)",
        background: "rgba(10,14,23,0.9)",
        backdropFilter: "blur(20px)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: "linear-gradient(135deg, #00f0ff 0%, #0066ff 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 800,
          }}>⚡</div>
          <div>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 16, fontWeight: 700, color: "#00f0ff", letterSpacing: 2 }}>
              CLAW TRADE V2
            </div>
            <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1 }}>模拟交易平台 · 后端版本</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1 }}>用户ID</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#00f0ff", fontFamily: "'JetBrains Mono', monospace" }}>
              {userId || '---'}
            </div>
          </div>
          <div style={{ width: 1, height: 32, background: "#1e293b" }} />
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1 }}>总资产</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: totalPnL >= 0 ? "#00e676" : "#ff5252", fontFamily: "'Orbitron', sans-serif" }}>
              {fmt(totalAssets)}
            </div>
          </div>
          <div style={{ width: 1, height: 32, background: "#1e293b" }} />
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1 }}>盈亏</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: totalPnL >= 0 ? "#00e676" : "#ff5252" }}>
              {totalPnL >= 0 ? "+" : ""}{fmt(totalPnL)} ({fmtPct(totalPnLPct)})
            </div>
          </div>
          <div style={{
            padding: "4px 10px", borderRadius: 4, fontSize: 10, fontWeight: 600, letterSpacing: 1,
            background: "rgba(0,240,255,0.1)", color: "#00f0ff", border: "1px solid rgba(0,240,255,0.2)",
          }}>
            {error ? "⚠ 离线" : "● 实时"}
          </div>
        </div>
      </header>

      {/* NAV TABS */}
      <nav style={{
        position: "relative", zIndex: 10,
        display: "flex", gap: 0,
        padding: "0 24px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "rgba(10,14,23,0.6)",
      }}>
        {[
          { key: "market", label: "行情", icon: "📊" },
          { key: "trade", label: "交易", icon: "💱" },
          { key: "portfolio", label: "持仓", icon: "💼" },
          { key: "signals", label: "信号", icon: "🔔" },
          { key: "history", label: "记录", icon: "📋" },
        ].map((t) => (
          <button
            key={t.key}
            className={`tab ${activeTab === t.key ? "active" : ""}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </nav>

      {/* CONTENT */}
      <main style={{ position: "relative", zIndex: 10, padding: 24, maxWidth: 1400, margin: "0 auto" }}>

        {/* ========== MARKET TAB ========== */}
        {activeTab === "market" && (
          <div style={{ animation: "fadeIn 0.3s" }}>
            <div className="card" style={{ overflow: "hidden" }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "200px 120px 100px 1fr 100px",
                padding: "10px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                fontSize: 11, color: "#475569", fontWeight: 500, letterSpacing: 1,
              }}>
                <div>币种</div>
                <div style={{ textAlign: "right" }}>价格</div>
                <div style={{ textAlign: "right" }}>24H</div>
                <div style={{ textAlign: "center" }}>7D 走势</div>
                <div style={{ textAlign: "center" }}>操作</div>
              </div>

              {COINS.map((coin) => {
                const d = prices[coin.id];
                if (!d) return null;
                const change = d.usd_24h_change || 0;
                const sparkData = genSparkline(d.usd);
                const sparkColor = change >= 0 ? "#00c853" : "#ff1744";
                const isSelected = selectedCoin.id === coin.id;

                return (
                  <div
                    key={coin.id}
                    className={`coin-row ${isSelected ? "selected" : ""}`}
                    onClick={() => { setSelectedCoin(coin); setActiveTab("trade"); }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: `linear-gradient(135deg, ${sparkColor}22, ${sparkColor}08)`,
                        border: `1px solid ${sparkColor}33`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16,
                      }}>
                        {coin.icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{coin.symbol}</div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>{coin.name}</div>
                      </div>
                    </div>

                    <div style={{ textAlign: "right", fontWeight: 600, fontSize: 14 }}>
                      {fmt(d.usd, d.usd < 1 ? 4 : 2)}
                    </div>

                    <div style={{
                      textAlign: "right", fontWeight: 600, fontSize: 13,
                      color: change >= 0 ? "#00c853" : "#ff1744",
                    }}>
                      {fmtPct(change)}
                    </div>

                    <div style={{ padding: "0 16px", height: 36 }}>
                      <ResponsiveContainer width="100%" height={36}>
                        <AreaChart data={sparkData}>
                          <defs>
                            <linearGradient id={`g_${coin.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={sparkColor} stopOpacity={0.3} />
                              <stop offset="100%" stopColor={sparkColor} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="p" stroke={sparkColor} strokeWidth={1.5} fill={`url(#g_${coin.id})`} dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <button
                        className="btn btn-buy"
                        style={{ padding: "4px 14px", fontSize: 11 }}
                        onClick={(e) => { e.stopPropagation(); setSelectedCoin(coin); setTradeType("buy"); setActiveTab("trade"); }}
                      >
                        交易
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========== TRADE TAB ========== */}
        {activeTab === "trade" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20, animation: "fadeIn 0.3s" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: "50%",
                    background: "linear-gradient(135deg, #00f0ff22, #0066ff11)",
                    border: "1px solid #00f0ff33",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22,
                  }}>
                    {selectedCoin.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Orbitron', sans-serif" }}>
                      {selectedCoin.symbol}/USD
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{selectedCoin.name}</div>
                  </div>
                  <div style={{ marginLeft: "auto", textAlign: "right" }}>
                    <div style={{
                      fontSize: 28, fontWeight: 700,
                      fontFamily: "'Orbitron', sans-serif",
                      color: (prices[selectedCoin.id]?.usd_24h_change || 0) >= 0 ? "#00e676" : "#ff5252",
                    }}>
                      {fmt(prices[selectedCoin.id]?.usd, prices[selectedCoin.id]?.usd < 1 ? 4 : 2)}
                    </div>
                    <div style={{
                      fontSize: 14, fontWeight: 600,
                      color: (prices[selectedCoin.id]?.usd_24h_change || 0) >= 0 ? "#00c853" : "#ff1744",
                    }}>
                      {fmtPct(prices[selectedCoin.id]?.usd_24h_change)}
                    </div>
                  </div>
                </div>

                <div style={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={genSparkline(prices[selectedCoin.id]?.usd || 100)}>
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00f0ff" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="#00f0ff" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="t" hide />
                      <YAxis hide domain={["auto", "auto"]} />
                      <Tooltip
                        contentStyle={{ background: "#0d1320", border: "1px solid #1e293b", borderRadius: 6, fontSize: 12 }}
                        labelStyle={{ display: "none" }}
                        formatter={(v) => [fmt(v), "价格"]}
                      />
                      <Area type="monotone" dataKey="p" stroke="#00f0ff" strokeWidth={2} fill="url(#chartGrad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card" style={{ padding: 16 }}>
                <div style={{ fontSize: 12, color: "#475569", marginBottom: 12, fontWeight: 600, letterSpacing: 1 }}>市场数据</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  {[
                    { label: "24H 成交量", value: fmt(prices[selectedCoin.id]?.usd_24h_vol) },
                    { label: "市值", value: fmt(prices[selectedCoin.id]?.usd_market_cap) },
                    { label: "24H 涨跌", value: fmtPct(prices[selectedCoin.id]?.usd_24h_change) },
                  ].map((s, i) => (
                    <div key={i} style={{ padding: 12, background: "rgba(15,23,42,0.5)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.03)" }}>
                      <div style={{ fontSize: 10, color: "#475569", marginBottom: 4, letterSpacing: 0.5 }}>{s.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: s.label.includes("涨跌") ? ((prices[selectedCoin.id]?.usd_24h_change || 0) >= 0 ? "#00c853" : "#ff1744") : "#e2e8f0" }}>
                        {s.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Trade Panel */}
            <div>
              <div className="card" style={{ padding: 20, animation: "glow 3s infinite" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 1 }}>下单面板</div>
                  <button className="btn btn-ai" style={{ padding: "6px 12px", fontSize: 11 }} onClick={getAiSuggestion}>
                    🤖 AI 建议
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
                  <button
                    className={`btn ${tradeType === "buy" ? "btn-buy" : "btn-ghost"}`}
                    style={{ padding: 10, fontSize: 14 }}
                    onClick={() => setTradeType("buy")}
                  >
                    买入
                  </button>
                  <button
                    className={`btn ${tradeType === "sell" ? "btn-sell" : "btn-ghost"}`}
                    style={{ padding: 10, fontSize: 14 }}
                    onClick={() => setTradeType("sell")}
                  >
                    卖出
                  </button>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: "#475569", marginBottom: 6, letterSpacing: 0.5 }}>
                    金额 (USD)
                  </div>
                  <input
                    type="number"
                    placeholder="输入金额..."
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && executeTrade()}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 16 }}>
                  {quickAmounts.map((a) => (
                    <button
                      key={a}
                      className="btn btn-ghost"
                      style={{ padding: "6px 0", fontSize: 11 }}
                      onClick={() => setTradeAmount(String(a))}
                    >
                      ${a.toLocaleString()}
                    </button>
                  ))}
                </div>

                {tradeType === "sell" && positions[selectedCoin.symbol] && (
                  <button
                    className="btn btn-ghost"
                    style={{ width: "100%", marginBottom: 16, fontSize: 11 }}
                    onClick={() => {
                      const pos = positions[selectedCoin.symbol];
                      const val = pos.amount * (prices[selectedCoin.id]?.usd || 0);
                      setTradeAmount(String(Math.floor(val)));
                    }}
                  >
                    全部卖出 ({fmtQty(positions[selectedCoin.symbol]?.amount)} {selectedCoin.symbol})
                  </button>
                )}

                <div style={{
                  padding: 14, borderRadius: 6, marginBottom: 16,
                  background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.03)",
                }}>
                  <div style={{ fontSize: 11, color: "#475569", marginBottom: 8, letterSpacing: 0.5 }}>订单预览</div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: "#64748b" }}>币种</span>
                    <span>{selectedCoin.icon} {selectedCoin.symbol}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: "#64748b" }}>当前价格</span>
                    <span>{fmt(prices[selectedCoin.id]?.usd, prices[selectedCoin.id]?.usd < 1 ? 4 : 2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: "#64748b" }}>数量</span>
                    <span>{tradeAmount && prices[selectedCoin.id]?.usd ? fmtQty(parseFloat(tradeAmount) / prices[selectedCoin.id].usd) : "--"} {selectedCoin.symbol}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span style={{ color: "#64748b" }}>可用余额</span>
                    <span style={{ color: "#00f0ff" }}>{fmt(cash)}</span>
                  </div>
                </div>

                <button
                  className={`btn ${tradeType === "buy" ? "btn-buy" : "btn-sell"}`}
                  style={{ width: "100%", padding: 14, fontSize: 15, letterSpacing: 1 }}
                  onClick={executeTrade}
                >
                  {tradeType === "buy" ? `买入 ${selectedCoin.symbol}` : `卖出 ${selectedCoin.symbol}`}
                </button>

                {positions[selectedCoin.symbol] && (
                  <div style={{
                    marginTop: 16, padding: 14, borderRadius: 6,
                    background: "rgba(0,240,255,0.03)", border: "1px solid rgba(0,240,255,0.1)",
                  }}>
                    <div style={{ fontSize: 11, color: "#00f0ff", marginBottom: 8, fontWeight: 600 }}>当前持仓</div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: "#64748b" }}>持有数量</span>
                      <span>{fmtQty(positions[selectedCoin.symbol].amount)} {selectedCoin.symbol}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: "#64748b" }}>平均成本</span>
                      <span>{fmt(positions[selectedCoin.symbol].avgCost)}</span>
                    </div>
                    {(() => {
                      const pos = positions[selectedCoin.symbol];
                      const curPrice = prices[pos.coinId]?.usd || pos.avgCost;
                      const pnl = (curPrice - pos.avgCost) * pos.amount;
                      const pnlPct = ((curPrice / pos.avgCost) - 1) * 100;
                      return (
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                          <span style={{ color: "#64748b" }}>浮动盈亏</span>
                          <span style={{ color: pnl >= 0 ? "#00c853" : "#ff1744", fontWeight: 600 }}>
                            {pnl >= 0 ? "+" : ""}{fmt(pnl)} ({fmtPct(pnlPct)})
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========== PORTFOLIO TAB ========== */}
        {activeTab === "portfolio" && (
          <div style={{ animation: "fadeIn 0.3s" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
              {[
                { label: "总资产", value: fmt(totalAssets), color: "#00f0ff" },
                { label: "可用现金", value: fmt(cash), color: "#f59e0b" },
                { label: "持仓价值", value: fmt(totalPositionValue), color: "#8b5cf6" },
                { label: "总盈亏", value: `${totalPnL >= 0 ? "+" : ""}${fmt(totalPnL)} (${fmtPct(totalPnLPct)})`, color: totalPnL >= 0 ? "#00c853" : "#ff1744" },
              ].map((s, i) => (
                <div key={i} className="card" style={{ padding: 20 }}>
                  <div style={{ fontSize: 11, color: "#475569", marginBottom: 8, letterSpacing: 1 }}>{s.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: s.color, fontFamily: "'Orbitron', sans-serif" }}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
              <div className="card" style={{ padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, letterSpacing: 1 }}>持仓明细</div>
                {Object.keys(positions).length === 0 ? (
                  <div style={{ textAlign: "center", padding: 40, color: "#475569" }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                    暂无持仓，去交易页面买入吧
                  </div>
                ) : (
                  <div>
                    <div style={{
                      display: "grid", gridTemplateColumns: "140px repeat(5, 1fr)",
                      padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)",
                      fontSize: 10, color: "#475569", fontWeight: 500, letterSpacing: 0.5,
                    }}>
                      <div>币种</div>
                      <div style={{ textAlign: "right" }}>数量</div>
                      <div style={{ textAlign: "right" }}>成本</div>
                      <div style={{ textAlign: "right" }}>现价</div>
                      <div style={{ textAlign: "right" }}>市值</div>
                      <div style={{ textAlign: "right" }}>盈亏</div>
                    </div>
                    {Object.values(positions).map((pos) => {
                      const curPrice = prices[pos.coinId]?.usd || pos.avgCost;
                      const curValue = pos.amount * curPrice;
                      const pnl = curValue - pos.totalCost;
                      const pnlPct = ((curPrice / pos.avgCost) - 1) * 100;
                      return (
                        <div
                          key={pos.symbol}
                          style={{
                            display: "grid", gridTemplateColumns: "140px repeat(5, 1fr)",
                            padding: "12px 0",
                            borderBottom: "1px solid rgba(255,255,255,0.03)",
                            alignItems: "center", fontSize: 13,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 16 }}>{pos.icon}</span>
                            <div>
                              <div style={{ fontWeight: 600 }}>{pos.symbol}</div>
                              <div style={{ fontSize: 10, color: "#64748b" }}>{pos.name}</div>
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>{fmtQty(pos.amount)}</div>
                          <div style={{ textAlign: "right" }}>{fmt(pos.avgCost)}</div>
                          <div style={{ textAlign: "right" }}>{fmt(curPrice)}</div>
                          <div style={{ textAlign: "right" }}>{fmt(curValue)}</div>
                          <div style={{ textAlign: "right", fontWeight: 600, color: pnl >= 0 ? "#00c853" : "#ff1744" }}>
                            {pnl >= 0 ? "+" : ""}{fmt(pnl)}
                            <div style={{ fontSize: 10 }}>{fmtPct(pnlPct)}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="card" style={{ padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, letterSpacing: 1 }}>资产分布</div>
                {pieData.length > 0 ? (
                  <>
                    <div style={{ height: 200 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" strokeWidth={0}>
                            {pieData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ background: "#0d1320", border: "1px solid #1e293b", borderRadius: 6, fontSize: 12 }}
                            formatter={(v) => [fmt(v), ""]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      {pieData.map((d, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0", fontSize: 12 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                            <span style={{ color: "#94a3b8" }}>{d.name}</span>
                          </div>
                          <span style={{ fontWeight: 500 }}>{((d.value / totalAssets) * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: 40, color: "#475569", fontSize: 12 }}>
                    100% 现金
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========== SIGNALS TAB ========== */}
        {activeTab === "signals" && (
          <div style={{ animation: "fadeIn 0.3s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 1 }}>AI 交易信号</div>
              <div style={{ fontSize: 11, color: "#475569" }}>基于 24H 涨跌幅自动生成 · 每 30 秒刷新</div>
            </div>

            {signals.length === 0 ? (
              <div className="card" style={{ padding: 60, textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
                <div style={{ color: "#64748b", fontSize: 14 }}>暂无信号，市场平稳</div>
                <div style={{ color: "#475569", fontSize: 12, marginTop: 4 }}>当币种 24H 涨跌超过 3% 时会自动触发信号</div>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {signals.map((sig) => (
                  <div
                    key={sig.id}
                    className="card"
                    style={{
                      padding: 16,
                      borderLeft: `3px solid ${sig.type === "bullish" ? "#00c853" : "#ff1744"}`,
                      cursor: "pointer",
                      animation: "slideIn 0.4s"
                    }}
                    onClick={() => {
                      const coin = COINS.find(c => c.symbol === sig.symbol);
                      if (coin) { setSelectedCoin(coin); setActiveTab("trade"); }
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 8,
                          background: sig.type === "bullish" ? "rgba(0,200,83,0.1)" : "rgba(255,23,68,0.1)",
                          border: `1px solid ${sig.type === "bullish" ? "rgba(0,200,83,0.3)" : "rgba(255,23,68,0.3)"}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 18,
                        }}>
                          {sig.type === "bullish" ? "📈" : "📉"}
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontWeight: 700, fontSize: 14 }}>{sig.icon} {sig.symbol}</span>
                            <span style={{
                              fontSize: 10, padding: "2px 8px", borderRadius: 4, fontWeight: 600,
                              background: sig.type === "bullish" ? "rgba(0,200,83,0.15)" : "rgba(255,23,68,0.15)",
                              color: sig.type === "bullish" ? "#00e676" : "#ff5252",
                            }}>
                              {sig.type === "bullish" ? "看涨" : "看跌"} · {sig.strength}
                            </span>
                          </div>
                          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{sig.message}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{fmt(sig.price)}</div>
                        <div style={{ fontSize: 11, color: sig.change >= 0 ? "#00c853" : "#ff1744" }}>{fmtPct(sig.change)}</div>
                        <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>{sig.time}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========== HISTORY TAB ========== */}
        {activeTab === "history" && (
          <div style={{ animation: "fadeIn 0.3s" }}>
            <div className="card" style={{ overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 14, fontWeight: 700, letterSpacing: 1 }}>
                交易记录 <span style={{ color: "#475569", fontWeight: 400, fontSize: 12 }}>({history.length} 笔)</span>
              </div>

              {history.length === 0 ? (
                <div style={{ padding: 60, textAlign: "center" }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>📝</div>
                  <div style={{ color: "#64748b", fontSize: 14 }}>暂无交易记录</div>
                </div>
              ) : (
                <div>
                  <div style={{
                    display: "grid", gridTemplateColumns: "60px 120px 120px 120px 120px 1fr",
                    padding: "10px 20px",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    fontSize: 10, color: "#475569", fontWeight: 500, letterSpacing: 0.5,
                  }}>
                    <div>方向</div>
                    <div>币种</div>
                    <div style={{ textAlign: "right" }}>数量</div>
                    <div style={{ textAlign: "right" }}>价格</div>
                    <div style={{ textAlign: "right" }}>金额</div>
                    <div style={{ textAlign: "right" }}>时间</div>
                  </div>
                  {history.map((h) => (
                    <div
                      key={h.id}
                      style={{
                        display: "grid", gridTemplateColumns: "60px 120px 120px 120px 120px 1fr",
                        padding: "12px 20px",
                        borderBottom: "1px solid rgba(255,255,255,0.03)",
                        fontSize: 13, alignItems: "center",
                      }}
                    >
                      <div>
                        <span style={{
                          fontSize: 10, padding: "3px 8px", borderRadius: 4, fontWeight: 700,
                          background: h.type === "buy" ? "rgba(0,200,83,0.15)" : "rgba(255,23,68,0.15)",
                          color: h.type === "buy" ? "#00e676" : "#ff5252",
                        }}>
                          {h.type === "buy" ? "买入" : "卖出"}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span>{h.icon}</span>
                        <span style={{ fontWeight: 600 }}>{h.symbol}</span>
                      </div>
                      <div style={{ textAlign: "right" }}>{fmtQty(h.amount)}</div>
                      <div style={{ textAlign: "right" }}>{fmt(h.price)}</div>
                      <div style={{ textAlign: "right", fontWeight: 600 }}>{fmt(h.total)}</div>
                      <div style={{ textAlign: "right", color: "#64748b", fontSize: 11 }}>{h.time}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer style={{
        position: "relative", zIndex: 10,
        padding: "16px 24px", marginTop: 24,
        borderTop: "1px solid rgba(255,255,255,0.03)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: 10, color: "#334155",
      }}>
        <div>CLAW TRADE V2 · 模拟交易平台 · 仅供学习使用，不构成投资建议</div>
        <div>行情数据来源: CoinGecko API (后端缓存) · 30秒刷新</div>
      </footer>
    </div>
  );
}
