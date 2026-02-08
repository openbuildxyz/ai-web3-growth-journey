'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useBinanceKlines } from './hooks/useBinanceKlines';
import { useTechnicalIndicators } from './hooks/useTechnicalIndicators';
import TimeframeSelector from './components/TimeframeSelector';
import IndicatorPanel from './components/IndicatorPanel';
// import SentimentPanel from './components/SentimentPanel';
import styles from './page.module.css';

// 动态导入 K 线图（避免 SSR 问题）
const KlineChart = dynamic(() => import('./components/KlineChart'), { ssr: false });

// ============ 类型定义 ============
type Direction = 'LONG' | 'SHORT';
type PageStatus = 'idle' | 'analyzing' | 'result';
type RiskLevel = 'low' | 'medium' | 'high';

interface ConclusionData {
  riskLevel: RiskLevel;
  confidence: number;
  title: string;
  description: string;
}

// ============ 常量 ============
const SYMBOLS = ['ETHUSDT', 'BTCUSDT', 'SOLUSDT'] as const;
const SYMBOL_DISPLAY: Record<string, string> = {
  ETHUSDT: 'ETH/USDT',
  BTCUSDT: 'BTC/USDT',
  SOLUSDT: 'SOL/USDT',
};

// 用户画像（硬编码）
const USER_PROFILE = {
  type: 'Swing Trader',
  longWinRate: 62,
  shortWinRate: 41,
  risk: 'Medium',
  txCount: 147,
};

// FGI（硬编码，可以用 API 替换）
const FEAR_GREED = { value: 25, label: '极度恐惧' };

// ============ 主组件 ============
export default function Home() {
  const [status, setStatus] = useState<PageStatus>('idle');
  const [symbol, setSymbol] = useState<typeof SYMBOLS[number]>('ETHUSDT');
  const [interval, setInterval] = useState('1h');
  const [direction, setDirection] = useState<Direction | null>(null);
  const [streamText, setStreamText] = useState('');
  const [analysisPhase, setAnalysisPhase] = useState(0);
  const [conclusion, setConclusion] = useState<ConclusionData | null>(null);
  const [showToast, setShowToast] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  // Hooks
  const { klines, stats, loading, connected, usingMock } = useBinanceKlines(symbol, interval);
  const indicators = useTechnicalIndicators(klines);

  const isNegative = parseFloat(stats.change24h) < 0;

  // 自动滚动到底部
  useEffect(() => {
    if (textRef.current) {
      textRef.current.scrollTop = textRef.current.scrollHeight;
    }
  }, [streamText]);

  // 检测关键词推进进度条
  useEffect(() => {
    if (streamText.includes('趋势分析') || streamText.includes('技术面')) {
      setAnalysisPhase(prev => Math.max(prev, 1));
    }
    if (streamText.includes('市场情绪') || streamText.includes('情绪分析')) {
      setAnalysisPhase(prev => Math.max(prev, 2));
    }
    if (streamText.includes('个人风险') || streamText.includes('风险提示')) {
      setAnalysisPhase(prev => Math.max(prev, 3));
    }
  }, [streamText]);

  // 开始分析
  const startAnalysis = useCallback(async (dir: Direction) => {
    setDirection(dir);
    setStatus('analyzing');
    setStreamText('');
    setAnalysisPhase(0);
    setConclusion(null);

    // 构建 K 线数据发送给后端
    const klinesForApi = klines.slice(-48).map(k => ({
      openTime: k.time * 1000,
      open: k.open.toString(),
      high: k.high.toString(),
      low: k.low.toString(),
      close: k.close.toString(),
      volume: k.volume.toString(),
    }));

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          direction: dir,
          marketData: {
            price: stats.price,
            change24h: stats.change24h,
            volume: stats.volume24h,
            high24h: stats.high24h,
            low24h: stats.low24h,
            fearGreedIndex: FEAR_GREED.value,
            fearGreedLabel: FEAR_GREED.label,
            klines: klinesForApi,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const data = line.slice(5).trim();
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              fullText += parsed.content;
              setStreamText(fullText);
            }
          } catch {
            // 忽略解析错误
          }
        }
      }

      // 解析结论
      const conclusionData = parseConclusion(fullText, dir);
      setConclusion(conclusionData);
      setStatus('result');
      setAnalysisPhase(3);

    } catch (error) {
      console.error('Analysis error:', error);
      setStreamText('分析过程中出现错误，请重试。');
      setStatus('result');
    }
  }, [symbol, stats, klines]);

  // 解析结论
  const parseConclusion = (text: string, dir: Direction): ConclusionData => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('高风险') || lowerText.includes('high risk') || lowerText.includes('谨慎') || lowerText.includes('不建议')) {
      return {
        riskLevel: 'high',
        confidence: 78,
        title: '🔴 HIGH RISK WARNING',
        description: `Market conditions and your profile suggest caution for ${dir}.`,
      };
    } else if (lowerText.includes('中等风险') || lowerText.includes('moderate') || lowerText.includes('观望')) {
      return {
        riskLevel: 'medium',
        confidence: 65,
        title: '🟡 MODERATE RISK',
        description: `Mixed signals detected. Consider position sizing carefully.`,
      };
    } else {
      return {
        riskLevel: 'low',
        confidence: 72,
        title: '🟢 FAVORABLE OPPORTUNITY',
        description: `Technical and sentiment indicators align with your ${dir} decision.`,
      };
    }
  };

  // 重置状态
  const handleBack = () => {
    setStatus('idle');
    setDirection(null);
    setStreamText('');
    setAnalysisPhase(0);
    setConclusion(null);
  };

  // 模拟执行
  const handleExecute = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      handleBack();
    }, 2000);
  };

  return (
    <main className={styles.main}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🔮</span>
          <span className={styles.logoText}>Oracle-X</span>
        </div>
        <div className={styles.headerRight}>
          <select
            className={styles.symbolSelect}
            value={symbol}
            onChange={(e) => setSymbol(e.target.value as typeof SYMBOLS[number])}
          >
            {SYMBOLS.map((s) => (
              <option key={s} value={s}>{SYMBOL_DISPLAY[s]}</option>
            ))}
          </select>
          <div className={styles.priceDisplay}>
            <span className={styles.priceValue}>${stats.price}</span>
            <span className={`${styles.priceChange} ${isNegative ? styles.negative : styles.positive}`}>
              {isNegative ? '▼' : '▲'} {stats.change24h}%
            </span>
          </div>

          <div className={`${styles.connectionStatus} ${connected ? styles.connected : ''}`}>
            {usingMock ? '⚠️ MOCK DATA' : (connected ? '● LIVE' : '○ OFFLINE')}
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className={styles.layout}>
        {/* Left: Chart */}
        <div className={styles.chartSection}>
          <div className={styles.chartHeader}>
            <TimeframeSelector value={interval} onChange={setInterval} />
          </div>
          <div className={styles.chartContainer}>
            <KlineChart klines={klines} loading={loading} />
          </div>
        </div>

        {/* Right: Panel */}
        <div className={styles.panelSection}>
          {/* Twitter Sentiment */}
          <SentimentPanel symbol={symbol} />
          
          <IndicatorPanel
            indicators={indicators}
            userProfile={USER_PROFILE}
            fearGreedIndex={FEAR_GREED.value}
            fearGreedLabel={FEAR_GREED.label}
          />

          {/* Trade Buttons */}
          <div className={styles.tradeButtons}>
            <button
              className={`btn btn-long ${styles.tradeBtn}`}
              onClick={() => startAnalysis('LONG')}
              disabled={status !== 'idle'}
            >
              🟢 LONG
            </button>
            <button
              className={`btn btn-short ${styles.tradeBtn}`}
              onClick={() => startAnalysis('SHORT')}
              disabled={status !== 'idle'}
            >
              🔴 SHORT
            </button>
          </div>
          <p className={styles.tradeTip}>Oracle-X will analyze before execution</p>
        </div>
      </div>

      {/* Analysis Modal */}
      {(status === 'analyzing' || status === 'result') && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div className={styles.modalTitle}>
                <span className={styles.modalDot}>◉</span>
                Oracle-X Analysis
              </div>
              <button className={styles.closeBtn} onClick={handleBack}>✕</button>
            </div>
            <div className={styles.modalSubtitle}>
              {SYMBOL_DISPLAY[symbol]} · {direction} · ${stats.price}
            </div>

            <div className="modal-body">
              {/* Progress Bars */}
              <div className={styles.progressSection}>
                <div className={styles.progressTitle}>⏱ Analyzing 3 dimensions...</div>
                {['Technical', 'Market Sentiment', 'Personal Risk'].map((label, i) => (
                  <div key={label} className={styles.progressItem}>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill} 
                        style={{ 
                          width: analysisPhase > i ? '100%' : 
                                 analysisPhase === i ? '50%' : '0%' 
                        }}
                      />
                    </div>
                    <span>{label} {analysisPhase > i ? '✓' : analysisPhase === i ? '●' : '○'}</span>
                  </div>
                ))}
              </div>

              {/* Stream Text */}
              <div className={styles.streamText} ref={textRef}>
                {streamText}
                {status === 'analyzing' && <span className="cursor-blink">▊</span>}
              </div>

              {/* Conclusion Badge */}
              {status === 'result' && conclusion && (
                <div className={`${styles.conclusionBadge} ${styles[conclusion.riskLevel]} badge-animate`}>
                  <div className={styles.conclusionTitle}>{conclusion.title}</div>
                  <div className={styles.conclusionDesc}>{conclusion.description}</div>
                  <div className={styles.conclusionConfidence}>Confidence: {conclusion.confidence}%</div>
                </div>
              )}
            </div>

            {status === 'result' && (
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={handleBack}>← Back to Panel</button>
                <button className="btn btn-long" onClick={handleExecute}>✅ Execute Anyway</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && <div className="toast">✅ Order Submitted</div>}
    </main>
  );
}
