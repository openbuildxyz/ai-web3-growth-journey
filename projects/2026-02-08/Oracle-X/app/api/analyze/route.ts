/**
 * POST /api/analyze
 * 加密货币交易风险评估 API
 */

import { NextRequest } from 'next/server';
import { validateAnalyzeRequest } from '@/lib/validators';
import { calculateAllIndicators } from '@/lib/indicators';
import { compressKlinesMulti } from '@/lib/kline-processor';
import { getTwitterSentiment } from '@/lib/twitter';
import { buildSystemPrompt, buildUserPrompt } from '@/lib/prompt-builder';
import { getAIConfig, callAIStream, transformToSSE } from '@/lib/ai-client';
import { ProxyAgent, fetch as proxyFetch } from 'undici';

// 使用 Node.js Runtime
export const runtime = 'nodejs';

// HTTP 代理配置 - 端口 7892
const proxyAgent = new ProxyAgent('http://127.0.0.1:7892');

export async function POST(request: NextRequest) {
  try {
    // 1. 解析请求体
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid parameters', detail: 'Invalid JSON body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. 参数校验
    const validation = validateAnalyzeRequest(body);
    if (!validation.valid) {
      return new Response(
        JSON.stringify(validation.error),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { data: requestData } = validation;

    // 3. 自动获取 K 线数据（如果 Extension 未提供）- 增强版：多周期 + 更多数据
    let klines = requestData.marketData.klines || [];
    let klines4h: typeof klines = [];
    let klines1d: typeof klines = [];
    
    if (klines.length === 0) {
      // 并行拉取多周期 K线数据
      const symbol = requestData.symbol;
      const urls = {
        '1h': `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=200`,
        '4h': `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=4h&limit=100`,
        '1d': `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1d&limit=30`,
      };
      
      const parseKlines = (rawKlines: [number, string, string, string, string, string, ...unknown[]][]) => 
        rawKlines.map((k) => ({
          openTime: k[0],
          time: Math.floor(k[0] / 1000),
          open: k[1],
          high: k[2],
          low: k[3],
          close: k[4],
          volume: k[5],
        }));

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20秒超时
        
        console.log(`[INFO] Fetching multi-timeframe klines from Binance via proxy (7892)...`);
        
        // 并行请求
        const [res1h, res4h, res1d] = await Promise.allSettled([
          proxyFetch(urls['1h'], { signal: controller.signal, dispatcher: proxyAgent }),
          proxyFetch(urls['4h'], { signal: controller.signal, dispatcher: proxyAgent }),
          proxyFetch(urls['1d'], { signal: controller.signal, dispatcher: proxyAgent }),
        ]);
        clearTimeout(timeoutId);
        
        // 解析 1h 数据
        if (res1h.status === 'fulfilled' && res1h.value.ok) {
          const raw = await res1h.value.json() as [number, string, string, string, string, string, ...unknown[]][];
          klines = parseKlines(raw);
          console.log(`[SUCCESS] Fetched ${klines.length} 1h klines`);
        }
        
        // 解析 4h 数据
        if (res4h.status === 'fulfilled' && res4h.value.ok) {
          const raw = await res4h.value.json() as [number, string, string, string, string, string, ...unknown[]][];
          klines4h = parseKlines(raw);
          console.log(`[SUCCESS] Fetched ${klines4h.length} 4h klines`);
        }
        
        // 解析 1d 数据
        if (res1d.status === 'fulfilled' && res1d.value.ok) {
          const raw = await res1d.value.json() as [number, string, string, string, string, string, ...unknown[]][];
          klines1d = parseKlines(raw);
          console.log(`[SUCCESS] Fetched ${klines1d.length} 1d klines`);
        }
        
      } catch (error) {
        console.warn(`[WARN] Failed to fetch klines:`, error instanceof Error ? error.message : error);
        console.log(`[INFO] Proceeding with available data`);
      }
    }

    // 4. 数据预处理
    const currentPrice = parseFloat(requestData.marketData.price) || 
      (klines.length > 0 ? parseFloat(klines[klines.length - 1].close as string) : 0);
    
    console.log(`[DEBUG] Klines count: ${klines.length}`);
    console.log(`[DEBUG] Current price: ${currentPrice}`);
    if (klines.length > 0) {
      console.log(`[DEBUG] Sample kline:`, klines[0]);
    }
    
    // K线压缩 (多周期) 与 Twitter 情绪获取
    const [klineSummary, twitterSentiment] = await Promise.all([
      klines.length > 0 ? compressKlinesMulti(klines, klines4h, klines1d) : null,
      getTwitterSentiment(requestData.symbol)
    ]);
    
    console.log(`[DEBUG] Kline summary:`, klineSummary);
    console.log(`[DEBUG] Twitter sentiment:`, twitterSentiment?.overallSentiment);
    
    // 注入 Twitter 数据到 marketData
    requestData.marketData.twitterSentiment = twitterSentiment;
    
    // 技术指标计算 (基于 1h 数据)
    const indicators = calculateAllIndicators(klines, currentPrice);
    console.log(`[DEBUG] Indicators calculated:`, indicators);

    // 5. Prompt 构造
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(requestData, klineSummary, indicators);

    // 6. 调用 AI API
    const config = getAIConfig();
    
    if (!config.apiKey) {
      return new Response(
        JSON.stringify({ error: 'AI service unavailable', detail: 'API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let aiResponse: Response;
    try {
      aiResponse = await callAIStream(systemPrompt, userPrompt, config);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return new Response(
        JSON.stringify({ error: 'AI service unavailable', detail: message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 7. 流式透传
    const sseStream = transformToSSE(aiResponse);

    return new Response(sseStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
    
  } catch (error) {
    console.error('Analyze API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// 只允许 POST 方法
export async function GET() {
  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { status: 405, headers: { 'Content-Type': 'application/json' } }
  );
}
