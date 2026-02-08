'use client';

import type { IndicatorsResult } from '../hooks/useTechnicalIndicators';
import styles from './IndicatorPanel.module.css';

interface IndicatorPanelProps {
  indicators: IndicatorsResult;
  userProfile: {
    type: string;
    longWinRate: number;
    shortWinRate: number;
    risk: string;
    txCount: number;
  };
  fearGreedIndex: number;
  fearGreedLabel: string;
}

export default function IndicatorPanel({
  indicators,
  userProfile,
  fearGreedIndex,
  fearGreedLabel,
}: IndicatorPanelProps) {
  const { rsi, macd, bollingerBands, atr } = indicators;

  return (
    <div className={styles.panel}>
      {/* Technical Indicators */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>📊 Technical Indicators</h3>
        <div className={styles.cardGrid}>
          {/* RSI */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>RSI (14)</div>
            <div className={styles.cardValue}>
              {rsi ? rsi.value.toFixed(1) : '-'}
            </div>
            <div className={`${styles.cardSignal} ${rsi ? styles[rsi.signal.toLowerCase()] : ''}`}>
              ● {rsi?.label || '-'}
            </div>
          </div>

          {/* MACD */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>MACD</div>
            <div className={styles.cardValue}>
              {macd ? (macd.trend === 'BULLISH' ? '▲' : '▼') : '-'} {macd?.crossover || '-'}
            </div>
            <div className={`${styles.cardSignal} ${macd ? styles[macd.trend.toLowerCase()] : ''}`}>
              {macd?.trend || '-'}
            </div>
          </div>

          {/* BB */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>BB %B</div>
            <div className={styles.cardValue}>
              {bollingerBands ? `${bollingerBands.percentB.toFixed(0)}%` : '-'}
            </div>
            <div className={`${styles.cardSignal} ${bollingerBands ? styles[bollingerBands.signal.toLowerCase()] : ''}`}>
              ● {bollingerBands?.label || '-'}
            </div>
          </div>

          {/* ATR */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>ATR (14)</div>
            <div className={styles.cardValue}>
              {atr ? atr.value.toFixed(2) : '-'}
            </div>
            <div className={styles.cardSignal}>
              {atr?.volatilityLevel || '-'}波动
            </div>
          </div>
        </div>
      </section>

      {/* User Profile */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>👤 Trading Profile</h3>
        <div className={styles.profileCard}>
          <div className={styles.profileType}>{userProfile.type}</div>
          <div className={styles.profileStats}>
            <span className={styles.positive}>L{userProfile.longWinRate}%</span>
            <span className={styles.separator}>·</span>
            <span className={styles.negative}>S{userProfile.shortWinRate}%</span>
          </div>
          <div className={styles.profileMeta}>
            Risk: {userProfile.risk} · {userProfile.txCount} txns
          </div>
        </div>
      </section>

      {/* Market Sentiment */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>🌡️ Market Sentiment</h3>
        <div className={styles.sentimentCard}>
          <div className={styles.sentimentHeader}>
            <span>Fear & Greed Index</span>
            <span className={styles.sentimentValue}>{fearGreedIndex}</span>
          </div>
          <div className={styles.sentimentBar}>
            <div 
              className={styles.sentimentFill}
              style={{ width: `${fearGreedIndex}%` }}
            />
          </div>
          <div className={styles.sentimentLabel}>{fearGreedLabel}</div>
        </div>
      </section>
    </div>
  );
}
