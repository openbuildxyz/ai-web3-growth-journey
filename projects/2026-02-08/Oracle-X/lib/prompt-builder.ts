/**
 * Prompt 构建模块
 */

import { AnalyzeRequest, Direction, KlineSummary, IndicatorsResult } from '@/types/analyze';
import { formatIndicators } from './indicators';

/**
 * 构建 System Prompt
 */
export function buildSystemPrompt(): string {
  return `你是 Oracle-X，一个专业的加密货币交易风险评估引擎。你的职责是在用户执行交易前，基于当前市场数据进行多维度分析，帮助用户做出更明智的决策。

你的分析原则：
1. 客观中立：基于数据说话，不带情绪偏见
2. 风险优先：宁可错过机会，不可忽视风险
3. 简洁专业：每个维度2-3句话，不说废话
4. 明确结论：必须给出三级建议之一

输出格式要求：
- 使用以下固定结构输出
- 每个维度用【】标记标题
- 最终结论必须包含且仅包含以下三个emoji标记之一：🟢、🟡、🔴

输出结构：
【趋势分析】...
【波动性评估】...
【量价关系】...
【市场情绪】...（如有FGI数据）
【风险评估】...

---
最终建议：
🟢 建议执行 / 🟡 建议观望 / 🔴 高风险警告
（一句话总结理由）`;
}

/**
 * 解析交易对显示名称
 */
function parseSymbolDisplay(symbol: string): string {
  // ETHUSDT -> ETH/USDT
  if (symbol.endsWith('USDT')) {
    const base = symbol.slice(0, -4);
    return `${base}/USDT`;
  }
  return symbol;
}

/**
 * 方向映射
 */
function getDirectionCN(direction: Direction): string {
  return direction === 'LONG' ? '做多' : '做空';
}

/**
 * 构建 User Prompt
 */
export function buildUserPrompt(
  request: AnalyzeRequest,
  klineSummary: KlineSummary | null,
  indicators: IndicatorsResult
): string {
  const { symbol, direction, marketData } = request;
  const symbolDisplay = parseSymbolDisplay(symbol);
  const directionCN = getDirectionCN(direction);
  
  // 基础市场数据
  let prompt = `用户即将对 ${symbolDisplay} 执行【${directionCN}】操作。

当前市场数据快照：
- 当前价格: $${marketData.price}
- 24h涨跌: ${marketData.change24h}%
- 24h成交量: ${marketData.volume}
- 24h最高/最低: $${marketData.high24h} / $${marketData.low24h}`;

  // FGI 段落
  if (marketData.fearGreedIndex !== null && marketData.fearGreedLabel !== null) {
    prompt += `\n- 市场恐惧贪婪指数: ${marketData.fearGreedIndex}/100 (${marketData.fearGreedLabel})`;
  }

  // Twitter 情绪段落
  if (marketData.twitterSentiment) {
    const ts = marketData.twitterSentiment;
    const sentimentEmoji = ts.overallSentiment === 'BULLISH' ? '🟢' : ts.overallSentiment === 'BEARISH' ? '🔴' : '⚪';
    prompt += `\n- Twitter 社交情绪: ${sentimentEmoji} ${ts.overallSentiment} (${ts.confidencePercent}% 置信度)`;
    prompt += `\n  (基于 ${ts.totalCount} 条推文: 👍${ts.positive} / 👎${ts.negative} / 😐${ts.neutral})`;
    
    // 摘录几条热门推文
    if (ts.tweets.length > 0) {
      const topTweets = ts.tweets.slice(0, 3).map(t => `  - "${t.text.slice(0, 50)}..." (${t.sentiment})`).join('\n');
      prompt += `\n  热门推文摘要:\n${topTweets}`;
    }
  }

  // K线摘要段落 (增强版)
  if (klineSummary) {
    prompt += `\n\nK线及趋势摘要：\n${klineSummary.text}`;
  } else {
    prompt += `\n\n注意：K线数据暂时不可用，请基于现有数据进行分析。`;
  }

  // 技术指标段落 (已通过 formatIndicators 更新)
  const indicatorsText = formatIndicators(indicators);
  prompt += `\n\n${indicatorsText}`;

  prompt += '\n\n请基于以上数据进行全方位分析（趋势、情绪、指标）。';

  return prompt;
}
