import React from 'react';
import { OKX_COLORS } from '../theme/okx-colors.js';

/**
 * Landing Panel - 平台介绍和快速导航组件
 * 放置在 Market Tab 左侧
 */
export default function LandingPanel({
  cash,
  totalAssets,
  totalPnL,
  totalPnLPct,
  onStartTrading,
  onRequestAI
}) {
  // 格式化数字
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

  const features = [
    { icon: "📊", title: "实时行情", desc: "12 种主流加密货币" },
    { icon: "💱", title: "模拟交易", desc: "10 万美元初始资金" },
    { icon: "🤖", title: "AI 助手", desc: "OpenClaw 智能建议" },
    { icon: "📈", title: "投资组合", desc: "实时盈亏跟踪" }
  ];

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: 16,
      animation: "slideIn 0.4s ease-out"
    }}>
      {/* 欢迎卡片 */}
      <div style={{
        padding: "24px",
        background: OKX_COLORS.bg.card,
        border: `1px solid ${OKX_COLORS.border.default}`,
        borderRadius: "8px"
      }}>
        <h2 style={{
          margin: "0 0 8px 0",
          fontSize: "24px",
          fontWeight: "700",
          color: OKX_COLORS.text.primary,
          letterSpacing: "0.5px"
        }}>
          欢迎来到 ClawTrade 🚀
        </h2>
        <p style={{
          margin: 0,
          fontSize: "14px",
          color: OKX_COLORS.text.secondary,
          lineHeight: "1.6"
        }}>
          加密货币模拟交易平台
        </p>
      </div>

      {/* 资产总览卡片 */}
      <div style={{
        padding: "20px",
        background: OKX_COLORS.bg.card,
        border: `1px solid ${OKX_COLORS.border.default}`,
        borderRadius: "8px"
      }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: "12px", color: OKX_COLORS.text.secondary, marginBottom: 4 }}>
            总资产
          </div>
          <div style={{
            fontSize: "28px",
            fontWeight: "700",
            color: OKX_COLORS.text.primary,
            fontFamily: "'Orbitron', monospace"
          }}>
            {fmt(totalAssets)}
          </div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12
        }}>
          <div>
            <div style={{ fontSize: "11px", color: "#64748b", marginBottom: 4 }}>
              可用现金
            </div>
            <div style={{ fontSize: "14px", color: "#94a3b8", fontWeight: "600" }}>
              {fmt(cash)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "#64748b", marginBottom: 4 }}>
              总盈亏
            </div>
            <div style={{
              fontSize: "14px",
              color: totalPnL >= 0 ? "#00c853" : "#ff1744",
              fontWeight: "600"
            }}>
              {fmt(totalPnL)} ({fmtPct(totalPnLPct)})
            </div>
          </div>
        </div>
      </div>

      {/* 功能特色 */}
      <div style={{
        padding: "20px",
        background: "rgba(13,19,32,0.8)",
        border: "1px solid rgba(0,240,255,0.08)",
        borderRadius: "8px",
        backdropFilter: "blur(12px)"
      }}>
        <h3 style={{
          margin: "0 0 16px 0",
          fontSize: "14px",
          fontWeight: "600",
          color: "#e2e8f0"
        }}>
          平台特色
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {features.map((feature, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "12px",
                background: "rgba(0,240,255,0.02)",
                border: "1px solid rgba(0,240,255,0.05)",
                borderRadius: "6px",
                transition: "all 0.2s"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(0,240,255,0.05)";
                e.currentTarget.style.borderColor = "rgba(0,240,255,0.15)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(0,240,255,0.02)";
                e.currentTarget.style.borderColor = "rgba(0,240,255,0.05)";
              }}
            >
              <div style={{ fontSize: "24px", lineHeight: 1 }}>
                {feature.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#e2e8f0",
                  marginBottom: 2
                }}>
                  {feature.title}
                </div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>
                  {feature.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 快速操作按钮 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <button
          onClick={onStartTrading}
          style={{
            padding: "14px 20px",
            background: OKX_COLORS.success,
            border: "none",
            borderRadius: "8px",
            color: "#fff",
            fontSize: "14px",
            fontWeight: "700",
            cursor: "pointer",
            transition: "all 0.2s",
            letterSpacing: "0.5px",
            boxShadow: "0 4px 16px rgba(0,200,83,0.3)"
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,200,83,0.4)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,200,83,0.3)";
          }}
        >
          开始交易 →
        </button>

        <button
          onClick={onRequestAI}
          style={{
            padding: "12px 20px",
            background: OKX_COLORS.primary,
            border: "none",
            borderRadius: "8px",
            color: "#fff",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s",
            letterSpacing: "0.5px",
            boxShadow: "0 4px 16px rgba(139,92,246,0.3)"
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 24px rgba(139,92,246,0.4)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(139,92,246,0.3)";
          }}
        >
          🤖 AI 智能建议
        </button>
      </div>

      {/* 新手提示 */}
      <div style={{
        padding: "14px 16px",
        background: "rgba(59,130,246,0.1)",
        border: "1px solid rgba(59,130,246,0.2)",
        borderRadius: "6px",
        fontSize: "11px",
        color: "#94a3b8",
        lineHeight: "1.6"
      }}>
        💡 <span style={{ color: "#60a5fa" }}>新手提示：</span>
        这是一个模拟交易平台，您可以零风险体验加密货币交易。所有交易都是虚拟的，不会涉及真实资金。
      </div>
    </div>
  );
}
