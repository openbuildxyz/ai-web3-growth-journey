/**
 * AI 客户端模块
 * 封装阶跃星辰 API 调用
 */

export interface AIClientConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
  temperature: number;
  maxTokens: number;
}

/**
 * 获取 AI 配置
 */
export function getAIConfig(): AIClientConfig {
  return {
    apiKey: process.env.STEP_API_KEY || '',
    model: process.env.AI_MODEL || 'step-1-8k',
    baseUrl: process.env.AI_BASE_URL || 'https://api.stepfun.com/v1',
    temperature: parseFloat(process.env.AI_TEMPERATURE || '0.3'),
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || '1000', 10)
  };
}

/**
 * 调用 AI API（流式）
 */
export async function callAIStream(
  systemPrompt: string,
  userPrompt: string,
  config: AIClientConfig
): Promise<Response> {
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      stream: true
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI API error: ${response.status} - ${errorText}`);
  }

  return response;
}

/**
 * 将 AI 流转换为 SSE 格式的 ReadableStream
 */
export function transformToSSE(aiResponse: Response): ReadableStream {
  const reader = aiResponse.body?.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      if (!reader) {
        controller.enqueue(encoder.encode('data: {"error": "No response body"}\n\n'));
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
        return;
      }

      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data:')) continue;
            
            const data = trimmed.slice(5).trim();
            
            if (data === '[DONE]') {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              
              if (content) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                );
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
        
        // 发送结束标记
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch (error) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`)
        );
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } finally {
        controller.close();
      }
    }
  });
}

/**
 * 获取视觉模型配置
 */
export function getVisionConfig(): AIClientConfig {
  return {
    apiKey: process.env.STEP_API_KEY || '',
    model: process.env.AI_VISION_MODEL || 'step-1o-turbo-vision',
    baseUrl: process.env.AI_BASE_URL || 'https://api.stepfun.com/v1',
    temperature: 0.2, // 识别任务使用更低温度
    maxTokens: 500
  };
}

/**
 * 调用视觉 AI API（非流式，用于截图识别）
 */
export async function callVisionAI(
  imageBase64: string,
  prompt: string,
  config: AIClientConfig
): Promise<string> {
  // 确保 base64 格式正确
  const imageUrl = imageBase64.startsWith('data:') 
    ? imageBase64 
    : `data:image/png;base64,${imageBase64}`;

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: imageUrl }
            },
            {
              type: 'text',
              text: prompt
            }
          ]
        }
      ],
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      stream: false
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Vision AI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}
