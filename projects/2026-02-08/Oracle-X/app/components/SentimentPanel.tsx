'use client';

import { useState, useEffect } from 'react';
import styles from './SentimentPanel.module.css';

interface TweetData {
  id: string;
  text: string;
  author: string;
  authorHandle: string;
  timeAgo: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  metrics: {
    likes: number;
    retweets: number;
    replies: number;
  };
}

interface TwitterSentiment {
  symbol: string;
  query: string;
  totalCount: number;
  positive: number;
  negative: number;
  neutral: number;
  overallSentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidencePercent: number;
  tweets: TweetData[];
  fetchedAt: string;
}

interface SentimentPanelProps {
  symbol: string;
}

const SENTIMENT_COLORS = {
  BULLISH: '#00c853',
  BEARISH: '#ff1744',
  NEUTRAL: '#9e9e9e',
};

const SENTIMENT_EMOJI = {
  POSITIVE: '🟢',
  NEGATIVE: '🔴',
  NEUTRAL: '⚪',
};

export default function SentimentPanel({ symbol }: SentimentPanelProps) {
  const [data, setData] = useState<TwitterSentiment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchSentiment = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/twitter?symbol=${symbol}`);
        if (!response.ok) {
          throw new Error('Failed to fetch sentiment data');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Sentiment fetch error:', err);
        setError('Unable to load Twitter sentiment');
      } finally {
        setLoading(false);
      }
    };

    fetchSentiment();
    
    // 每5分钟刷新一次
    const interval = setInterval(fetchSentiment, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [symbol]);

  if (loading) {
    return (
      <div className={styles.panel}>
        <div className={styles.header}>
          <span className={styles.icon}>🐦</span>
          <span className={styles.title}>Twitter Sentiment</span>
        </div>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <span>Loading tweets...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.panel}>
        <div className={styles.header}>
          <span className={styles.icon}>🐦</span>
          <span className={styles.title}>Twitter Sentiment</span>
        </div>
        <div className={styles.error}>
          <span>⚠️ {error || 'No data available'}</span>
        </div>
      </div>
    );
  }

  const { totalCount, positive, negative, neutral, overallSentiment, confidencePercent, tweets } = data;
  const positivePercent = totalCount > 0 ? Math.round((positive / totalCount) * 100) : 0;
  const negativePercent = totalCount > 0 ? Math.round((negative / totalCount) * 100) : 0;
  const neutralPercent = totalCount > 0 ? Math.round((neutral / totalCount) * 100) : 0;

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.icon}>🐦</span>
        <span className={styles.title}>Twitter Sentiment</span>
        <button 
          className={styles.refreshBtn}
          onClick={() => window.location.reload()}
          title="Refresh"
        >
          🔄
        </button>
      </div>

      {/* Overall Sentiment */}
      <div 
        className={styles.overall}
        style={{ borderColor: SENTIMENT_COLORS[overallSentiment] }}
      >
        <div className={styles.overallLabel}>Overall</div>
        <div 
          className={styles.overallValue}
          style={{ color: SENTIMENT_COLORS[overallSentiment] }}
        >
          {overallSentiment === 'BULLISH' ? '🟢' : overallSentiment === 'BEARISH' ? '🔴' : '⚪'}{' '}
          {overallSentiment} ({confidencePercent}%)
        </div>
      </div>

      {/* Sentiment Bar */}
      <div className={styles.barContainer}>
        <div className={styles.bar}>
          <div 
            className={styles.barPositive}
            style={{ width: `${positivePercent}%` }}
          />
          <div 
            className={styles.barNeutral}
            style={{ width: `${neutralPercent}%` }}
          />
          <div 
            className={styles.barNegative}
            style={{ width: `${negativePercent}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statDot} style={{ background: '#00c853' }}></span>
          <span className={styles.statLabel}>Positive</span>
          <span className={styles.statValue}>{positive} ({positivePercent}%)</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statDot} style={{ background: '#9e9e9e' }}></span>
          <span className={styles.statLabel}>Neutral</span>
          <span className={styles.statValue}>{neutral} ({neutralPercent}%)</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statDot} style={{ background: '#ff1744' }}></span>
          <span className={styles.statLabel}>Negative</span>
          <span className={styles.statValue}>{negative} ({negativePercent}%)</span>
        </div>
      </div>

      {/* Toggle Tweets */}
      <button 
        className={styles.toggleBtn}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? '▲ Hide Tweets' : '▼ Show Tweets'}
      </button>

      {/* Tweets List */}
      {expanded && (
        <div className={styles.tweetsList}>
          {tweets.length === 0 ? (
            <div className={styles.noTweets}>No tweets found</div>
          ) : (
            tweets.map((tweet) => (
              <div key={tweet.id} className={styles.tweetCard}>
                <div className={styles.tweetHeader}>
                  <span className={styles.tweetAuthor}>@{tweet.authorHandle}</span>
                  <span className={styles.tweetTime}>{tweet.timeAgo}</span>
                </div>
                <div className={styles.tweetText}>{tweet.text}</div>
                <div className={styles.tweetFooter}>
                  <span className={styles.tweetSentiment}>
                    {SENTIMENT_EMOJI[tweet.sentiment]} {tweet.sentiment}
                  </span>
                  <span className={styles.tweetMetrics}>
                    ❤️ {tweet.metrics.likes} · 🔁 {tweet.metrics.retweets}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Footer */}
      <div className={styles.footer}>
        Based on {totalCount} tweets
      </div>
    </div>
  );
}
