import { TwitterSentimentResult } from '@/types/analyze';

// 交易对到搜索关键词的映射
function mapSymbolToQuery(symbol: string): string {
  const mapping: Record<string, string> = {
    BTCUSDT: 'bitcoin OR btc price trend',
    ETHUSDT: 'ethereum OR eth price trend',
    SOLUSDT: 'solana OR sol crypto trend',
  };
  return mapping[symbol] || `${symbol} crypto trend`;
}

// 简单情绪分类（基于关键词）
function classifySentiment(text: string): 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' {
  const lowerText = text.toLowerCase();
  
  const positiveKeywords = [
    'bullish', 'pump', 'moon', 'buy', 'long', 'breakout', 'surge', 'rally',
    'higher', 'up', 'gain', 'profit', 'bull', 'green', 'ath', 'strong',
    '🚀', '📈', '💎', '🔥', '💪', '🟢'
  ];
  
  const negativeKeywords = [
    'bearish', 'dump', 'crash', 'sell', 'short', 'breakdown', 'drop', 'fall',
    'lower', 'down', 'loss', 'bear', 'red', 'weak', 'fear', 'scam',
    '📉', '🔴', '💀', '⚠️'
  ];
  
  let positiveScore = 0;
  let negativeScore = 0;
  
  for (const keyword of positiveKeywords) {
    if (lowerText.includes(keyword)) positiveScore++;
  }
  
  for (const keyword of negativeKeywords) {
    if (lowerText.includes(keyword)) negativeScore++;
  }
  
  if (positiveScore > negativeScore) return 'POSITIVE';
  if (negativeScore > positiveScore) return 'NEGATIVE';
  return 'NEUTRAL';
}

// 时间格式化
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  return 'just now';
}

/**
 * 获取 Twitter 情绪数据
 */
export async function getTwitterSentiment(symbol: string): Promise<TwitterSentimentResult | null> {
  const query = mapSymbolToQuery(symbol);
  
  const rapidApiKey = process.env.RAPIDAPI_KEY;
  
  if (!rapidApiKey) {
    console.error('[Twitter Service] RapidAPI key not configured');
    return null;
  }

  try {
    console.log(`[Twitter Service] Searching for: ${query}`);
    
    const response = await fetch(
      `https://twitter241.p.rapidapi.com/search?type=Top&count=20&query=${encodeURIComponent(query)}`,
      {
        headers: {
          'x-rapidapi-host': 'twitter241.p.rapidapi.com',
          'x-rapidapi-key': rapidApiKey,
        },
      }
    );

    if (!response.ok) {
      console.error(`[Twitter Service] API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    // 解析推文数据
    const tweets: TwitterSentimentResult['tweets'] = [];

    // 处理 twitter241 API 返回格式
    const entries = data?.result?.timeline?.instructions?.[0]?.entries || [];
    
    for (const entry of entries) {
      const tweetResult = entry?.content?.itemContent?.tweet_results?.result;
      if (!tweetResult) continue;
      
      const legacy = tweetResult.legacy;
      const userLegacy = tweetResult.core?.user_results?.result?.legacy;
      
      if (!legacy || !userLegacy) continue;
      
      const text = legacy.full_text || '';
      const sentiment = classifySentiment(text);
      
      tweets.push({
        id: legacy.id_str || entry.entryId,
        text: text.slice(0, 280), // 截断过长文本
        author: userLegacy.name || 'Unknown',
        // authorHandle: userLegacy.screen_name, // twitter241 may not return logic simply
        createdAt: legacy.created_at || new Date().toISOString(),
        // timeAgo: formatTimeAgo... // TweetData interface updates needed if we want timeAgo
        sentiment,
      });
    }

    // 统计情绪
    const positive = tweets.filter(t => t.sentiment === 'POSITIVE').length;
    const negative = tweets.filter(t => t.sentiment === 'NEGATIVE').length;
    const neutral = tweets.filter(t => t.sentiment === 'NEUTRAL').length;
    const total = tweets.length;

    let overallSentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
    let confidencePercent = 50;

    if (total > 0) {
      const positiveRatio = positive / total;
      const negativeRatio = negative / total;
      
      if (positiveRatio > 0.5) {
        overallSentiment = 'BULLISH';
        confidencePercent = Math.round(positiveRatio * 100);
      } else if (negativeRatio > 0.5) {
        overallSentiment = 'BEARISH';
        confidencePercent = Math.round(negativeRatio * 100);
      } else {
        confidencePercent = Math.round(Math.max(positiveRatio, negativeRatio) * 100);
      }
    }

    return {
      query,
      totalCount: total,
      positive,
      negative,
      neutral,
      overallSentiment,
      confidencePercent,
      tweets: tweets.slice(0, 10),
    };

  } catch (error) {
    console.error('[Twitter Service] Error:', error);
    return null;
  }
}
