/**
 * POST /api/recognize
 * 交易截图视觉识别 API
 * 使用 step-1o-turbo-vision 模型识别交易平台和交易对
 */

import { NextRequest } from 'next/server';
import { getVisionConfig, callVisionAI } from '@/lib/ai-client';

export const runtime = 'edge';

// 识别结果类型
interface RecognizeResult {
  platform: string | null;
  pair: string | null;
  trade_type: 'spot' | 'perpetual' | 'futures' | null;
  direction_hint: 'long' | 'short' | null;
  confidence: number;
}

// 视觉识别 Prompt
const RECOGNIZE_PROMPT = `你是一个专业的交易界面识别专家。请分析这张交易平台截图，提取以下信息：

1. **平台** (platform): 识别交易平台名称，如 Binance、OKX、Bybit、Coinbase、Uniswap 等
2. **交易对** (pair): 识别正在查看的交易对，如 BTC/USDT、ETH/USDT 等
3. **交易类型** (trade_type): 判断是现货(spot)、永续合约(perpetual)还是交割合约(futures)
4. **方向提示** (direction_hint): 如果界面上有明显的做多/做空按钮被选中或价格走势暗示，给出方向提示

请严格按以下 JSON 格式输出（不要添加任何其他文字）：
{
  "platform": "平台名称",
  "pair": "交易对（格式：BASE/QUOTE）",
  "trade_type": "spot|perpetual|futures",
  "direction_hint": "long|short|null",
  "confidence": 0-100之间的置信度
}

如果无法识别某个字段，使用 null。`;

export async function POST(request: NextRequest) {
  try {
    // 1. 解析请求体
    let body: { image?: string };
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid parameters', detail: 'Invalid JSON body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. 验证图片数据
    if (!body.image || typeof body.image !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid parameters', detail: 'Missing or invalid image field' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 限制图片大小（约 10MB base64）
    if (body.image.length > 15 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: 'Invalid parameters', detail: 'Image too large (max 10MB)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. 获取配置并调用视觉 AI
    const config = getVisionConfig();
    
    if (!config.apiKey) {
      return new Response(
        JSON.stringify({ error: 'AI service unavailable', detail: 'API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let aiResponse: string;
    try {
      aiResponse = await callVisionAI(body.image, RECOGNIZE_PROMPT, config);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return new Response(
        JSON.stringify({ error: 'AI service unavailable', detail: message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. 解析 AI 响应
    let result: RecognizeResult;
    try {
      // 尝试从响应中提取 JSON
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch {
      // 解析失败时返回默认结果
      result = {
        platform: null,
        pair: null,
        trade_type: null,
        direction_hint: null,
        confidence: 0
      };
    }

    // 5. 返回识别结果
    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        } 
      }
    );

  } catch (error) {
    console.error('Recognize API error:', error);
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
