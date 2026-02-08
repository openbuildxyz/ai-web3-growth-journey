import { useState, useEffect, useRef } from 'react';
import { getOpenClawSuggestion } from '../api.js';
import { OKX_COLORS } from '../theme/okx-colors.js';

/**
 * AI Assistant - 智能客服组件
 * 固定在右下角，支持展开/收起
 */
export default function AIAssistant({ prices, cash, positions, coins, onTrade }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const messagesEndRef = useRef(null);

  // 初始化：从 localStorage 加载历史记录
  useEffect(() => {
    const saved = localStorage.getItem('ai-chat-history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // 限制最多 50 条历史记录
        setMessages(parsed.slice(-50));
      } catch (e) {
        console.error('Failed to load chat history:', e);
      }
    } else {
      // 首次打开，添加欢迎消息
      setMessages([{
        type: 'ai',
        content: {
          text: '您好！我是 OpenClaw AI 助手 🤖\n\n我可以帮您分析加密货币市场，提供智能交易建议。\n\n请选择一个币种，我会为您分析当前市场情况。'
        },
        timestamp: Date.now()
      }]);
    }
  }, []);

  // 保存聊天历史
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('ai-chat-history', JSON.stringify(messages));
    }
  }, [messages]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 获取 AI 建议
  const handleGetSuggestion = async (coinId, symbol) => {
    setLoading(true);
    setSelectedCoin({ id: coinId, symbol });

    // 添加用户消息
    setMessages(prev => [...prev, {
      type: 'user',
      content: { text: `分析 ${symbol}` },
      timestamp: Date.now()
    }]);

    try {
      const coinPrice = prices[coinId]?.usd;
      if (!coinPrice) {
        throw new Error('无法获取价格数据');
      }

      const suggestion = await getOpenClawSuggestion({
        coin_id: coinId,
        symbol: symbol,
        current_price: coinPrice,
        user_cash: cash,
        user_positions: positions
      });

      // 添加 AI 响应
      setMessages(prev => [...prev, {
        type: 'ai',
        content: suggestion,
        coinId: coinId,
        symbol: symbol,
        timestamp: Date.now()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'ai',
        content: {
          text: `抱歉，获取建议失败：${error.message}\n\n请稍后再试。`
        },
        timestamp: Date.now()
      }]);
    } finally {
      setLoading(false);
    }
  };

  // 发送消息
  const handleSendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    // 简单的币种识别
    const coinKeywords = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'SOL': 'solana',
      'DOGE': 'dogecoin',
      'ADA': 'cardano',
      'XRP': 'ripple',
      'LINK': 'chainlink',
      'AVAX': 'avalanche-2',
      'DOT': 'polkadot',
      'UNI': 'uniswap',
      'LTC': 'litecoin',
      'MATIC': 'matic-network'
    };

    const upperInput = trimmed.toUpperCase();
    for (const [symbol, coinId] of Object.entries(coinKeywords)) {
      if (upperInput.includes(symbol)) {
        setInput("");
        handleGetSuggestion(coinId, symbol);
        return;
      }
    }

    // 如果没有匹配到币种，显示帮助信息
    setMessages(prev => [...prev,
      {
        type: 'user',
        content: { text: trimmed },
        timestamp: Date.now()
      },
      {
        type: 'ai',
        content: {
          text: '请告诉我您想分析哪个币种？\n\n支持的币种：\nBTC, ETH, SOL, DOGE, ADA, XRP, LINK, AVAX, DOT, UNI, LTC, MATIC\n\n例如：输入 "BTC" 或 "分析 BTC"'
        },
        timestamp: Date.now()
      }
    ]);
    setInput("");
  };

  // 执行交易
  const handleExecuteTrade = (msg) => {
    if (msg.content.action && msg.coinId && msg.symbol) {
      const amount = msg.content.amount || 1000;
      onTrade(msg.content.action, msg.coinId, msg.symbol, amount);
      setIsOpen(false);
    }
  };

  // 清空历史
  const handleClearHistory = () => {
    setMessages([{
      type: 'ai',
      content: {
        text: '聊天记录已清空。\n\n请选择一个币种，我会为您分析当前市场情况。'
      },
      timestamp: Date.now()
    }]);
    localStorage.removeItem('ai-chat-history');
  };

  if (!isOpen) {
    // 最小化状态 - 圆形按钮
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
          border: "none",
          fontSize: "28px",
          cursor: "pointer",
          boxShadow: "0 8px 32px rgba(139,92,246,0.4)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s",
          animation: "pulse 2s infinite"
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow = "0 12px 40px rgba(139,92,246,0.6)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 8px 32px rgba(139,92,246,0.4)";
        }}
      >
        🤖
      </button>
    );
  }

  // 展开状态 - 聊天窗口
  return (
    <div style={{
      position: "fixed",
      bottom: "24px",
      right: "24px",
      width: "360px",
      height: "500px",
      background: "rgba(13,19,32,0.95)",
      border: "1px solid rgba(0,240,255,0.15)",
      borderRadius: "16px",
      backdropFilter: "blur(20px)",
      boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
      zIndex: 1000,
      display: "flex",
      flexDirection: "column",
      animation: "slideUp 0.3s ease-out"
    }}>
      {/* 头部 */}
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid rgba(0,240,255,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(236,72,153,0.1))"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: "24px" }}>🤖</span>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#e2e8f0" }}>
              AI 助手
            </div>
            <div style={{ fontSize: "11px", color: "#64748b" }}>
              {loading ? "思考中..." : "在线"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleClearHistory}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "6px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#94a3b8",
              fontSize: "16px",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
            title="清空历史"
          >
            🗑️
          </button>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "6px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#94a3b8",
              fontSize: "18px",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
          >
            −
          </button>
        </div>
      </div>

      {/* 消息列表 */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: 12
      }}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: msg.type === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            {msg.type === 'user' ? (
              // 用户消息
              <div style={{
                maxWidth: "70%",
                padding: "10px 14px",
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                borderRadius: "12px 12px 4px 12px",
                fontSize: "13px",
                color: "#fff",
                lineHeight: "1.6"
              }}>
                {msg.content.text}
              </div>
            ) : (
              // AI 消息
              <div style={{
                maxWidth: "85%",
                padding: "12px 16px",
                background: "rgba(0,240,255,0.05)",
                border: "1px solid rgba(0,240,255,0.1)",
                borderRadius: "12px 12px 12px 4px",
                fontSize: "13px",
                color: "#e2e8f0",
                lineHeight: "1.6"
              }}>
                {msg.content.text && (
                  <div style={{ whiteSpace: "pre-line", marginBottom: msg.content.action ? 12 : 0 }}>
                    {msg.content.text}
                  </div>
                )}

                {/* AI 建议卡片 */}
                {msg.content.action && (
                  <div style={{
                    padding: "12px",
                    background: "rgba(0,0,0,0.3)",
                    border: `1px solid ${msg.content.action === 'buy' ? 'rgba(0,200,83,0.3)' : 'rgba(255,23,68,0.3)'}`,
                    borderRadius: "8px",
                    marginTop: 8
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: "12px", fontWeight: "700", color: "#94a3b8" }}>
                        交易建议
                      </span>
                      <span style={{
                        fontSize: "14px",
                        fontWeight: "700",
                        color: msg.content.action === 'buy' ? '#00c853' : '#ff1744'
                      }}>
                        {msg.symbol} {msg.content.action === 'buy' ? '买入' : '卖出'}
                      </span>
                    </div>

                    {msg.content.amount && (
                      <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: 8 }}>
                        建议金额：<span style={{ color: "#e2e8f0", fontWeight: "600" }}>
                          ${msg.content.amount.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {msg.content.reason && (
                      <div style={{ fontSize: "11px", color: "#64748b", marginBottom: 12, lineHeight: "1.5" }}>
                        {msg.content.reason}
                      </div>
                    )}

                    <button
                      onClick={() => handleExecuteTrade(msg)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        background: msg.content.action === 'buy'
                          ? 'linear-gradient(135deg, #00c853, #00e676)'
                          : 'linear-gradient(135deg, #ff1744, #ff5252)',
                        border: "none",
                        borderRadius: "6px",
                        color: "#fff",
                        fontSize: "12px",
                        fontWeight: "700",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                    >
                      立即执行 →
                    </button>
                  </div>
                )}
              </div>
            )}

            <div style={{ fontSize: "10px", color: "#475569", marginTop: 4 }}>
              {new Date(msg.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 16px",
            background: "rgba(0,240,255,0.05)",
            border: "1px solid rgba(0,240,255,0.1)",
            borderRadius: "12px 12px 12px 4px",
            fontSize: "13px",
            color: "#94a3b8"
          }}>
            <div className="loading-dots" style={{ display: "flex", gap: 4 }}>
              <div style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#00f0ff",
                animation: "pulse 1.4s infinite ease-in-out both",
                animationDelay: "-0.32s"
              }} />
              <div style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#00f0ff",
                animation: "pulse 1.4s infinite ease-in-out both",
                animationDelay: "-0.16s"
              }} />
              <div style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#00f0ff",
                animation: "pulse 1.4s infinite ease-in-out both"
              }} />
            </div>
            AI 正在分析...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入区 */}
      <div style={{
        padding: "16px",
        borderTop: "1px solid rgba(0,240,255,0.1)",
        background: "rgba(0,0,0,0.2)"
      }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
            placeholder="输入币种代码，如: BTC"
            disabled={loading}
            style={{
              flex: 1,
              padding: "10px 14px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(0,240,255,0.15)",
              borderRadius: "8px",
              color: "#e2e8f0",
              fontSize: "13px",
              outline: "none",
              transition: "all 0.2s"
            }}
            onFocus={e => e.target.style.borderColor = "rgba(0,240,255,0.4)"}
            onBlur={e => e.target.style.borderColor = "rgba(0,240,255,0.15)"}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || loading}
            style={{
              padding: "10px 16px",
              background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "13px",
              fontWeight: "700",
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              opacity: loading || !input.trim() ? 0.5 : 1,
              transition: "all 0.2s"
            }}
            onMouseEnter={e => {
              if (!loading && input.trim()) {
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}
