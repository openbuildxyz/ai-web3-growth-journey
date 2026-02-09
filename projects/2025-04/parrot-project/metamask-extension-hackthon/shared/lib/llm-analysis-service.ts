import {
  ApiKeyError,
  NetworkError,
  ServerError,
  TimeoutError,
  BadResponseError,
} from './errors';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-2.5-pro';
const REQUEST_TIMEOUT_MS = 30000; // 30 seconds

/**
 * A service for analyzing MetaMask transactions using an LLM via OpenRouter.
 */
// Define a more specific type for the expected LLM API response
type LlmApiResponse = {
  choices?: {
    message?: {
      content?: string;
    };
  }[];
};

export class LlmTransactionAnalysisService {
  private model: string;
  private apiUrl: string;

  constructor(model: string = MODEL, apiUrl: string = OPENROUTER_API_URL) {
    this.model = model;
    this.apiUrl = apiUrl;
  }

  private async getApiKey(): Promise<string> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['openRouterApiKey'], (result) => {
        if (chrome.runtime.lastError) {
          // Use a generic server error if chrome storage fails
          reject(new ServerError('Failed to retrieve API key from storage.'));
        } else if (result.openRouterApiKey) {
          resolve(result.openRouterApiKey);
        } else {
          // Use the specific ApiKeyError when the key is not found
          reject(new ApiKeyError());
        }
      });
    });
  }

  /**
   * Analyzes the given transaction data by sending it to an LLM.
   *
   * @param transactionData - The formatted transaction data from
   * formatTransactionForLLM.
   * @returns An object containing the analysis result.
   * @throws {ApiKeyError | NetworkError | ServerError | TimeoutError | BadResponseError}
   */
  async analyzeTransaction(transactionData: Record<string, unknown>) {
    if (!transactionData) {
      // This is a developer error, a simple error is fine.
      throw new Error('Invalid transaction data provided.');
    }

    // This will throw if the key is not found, which is handled by the caller.
    const apiKey = await this.getApiKey();

    const prompt = this.buildPrompt(transactionData);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new ApiKeyError();
        }
        if (response.status >= 500) {
          throw new ServerError();
        }
        // For other non-ok statuses, throw a generic server error for now.
        throw new ServerError(
          `API request failed with status ${response.status}`,
        );
      }

      const result = await response.json();
      return this.parseResponse(result);
    } catch (error) {
      clearTimeout(timeoutId);

      // Re-throw custom errors
      if (
        error instanceof ApiKeyError ||
        error instanceof ServerError ||
        error instanceof BadResponseError
      ) {
        throw error;
      }

      // Handle timeout
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new TimeoutError();
      }

      // Handle network errors (e.g., failed to fetch)
      if (error instanceof TypeError) {
        throw new NetworkError();
      }

      // Fallback for any other unexpected errors
      console.error(
        'An unexpected error occurred in analyzeTransaction:',
        error,
      );
      throw new Error(
        'An unexpected error occurred during transaction analysis.',
      );
    }
  }

  /**
   * Builds the prompt to be sent to the LLM.
   *
   * @param data - The transaction or connection data.
   * @returns The prompt string.
   */
  buildPrompt(data: Record<string, unknown>) {
    // Check if it's a connection request
    if (data.origin && typeof data.origin === 'string') {
      return `
      您是一位区块链安全专家。请从用户的角度分析以下网站连接请求，
      并提供一个简短、易于理解的中文摘要。请重点关注该网站的已知安全风险。

      请求连接的网站源:
      ${data.origin}

      您的分析应包括：
      1.  对此网站功能的极简摘要 (例如: "一个知名的NFT市场", "一个DeFi协议", "一个未知的网站")。
      2.  清晰的风险评估 (low, medium, 或 high)。
      3.  一句话解释与此网站连接的最大潜在风险 (例如: "该网站曾有钓鱼攻击历史", "这是一个信誉良好的网站，风险较低")。

      请将您的回复格式化为
      一个JSON对象，包含两个键："analysis" (一个包含您的摘要和风险解释的字符串)
      和 "riskLevel" (一个字符串: "low", "medium", 或 "high")。
      您的整个回复必须是一个JSON对象。不要包含任何其他文本或格式。
      "analysis" 字段的内容必须是中文。
      `;
    }

    // Default to transaction analysis
    const txJson = JSON.stringify(data, null, 2);
    return `
      您是一位区块链安全专家。请从用户的角度分析以下以太坊交易或签名请求，
      并提供一个简短、易于理解的中文摘要。请重点关注潜在风险。

      交易详情:
      ${txJson}

      您的分析应包括：
      1.  对此请求功能的极简摘要 (例如: "发送 ETH", "授权代币消费", "请求您签署一条消息")。
      2.  清晰的风险评估 (low, medium, 或 high)。
      3.  一句话解释最大的潜在风险。

      请将您的回复格式化为
      一个JSON对象，包含两个键："analysis" (一个包含您的摘要和风险解释的字符串)
      和 "riskLevel" (一个字符串: "low", "medium", 或 "high")。
      您的整个回复必须是一个JSON对象。不要包含任何其他文本或格式。
      "analysis" 字段的内容必须是中文。
    `;
  }

  /**
   * Parses the JSON response from the LLM.
   *
   * @param llmResponse - The raw response object from the OpenRouter API.
   * @returns An object with "analysis" and "riskLevel" keys.
   */
  parseResponse(llmResponse: LlmApiResponse) {
    try {
      const { choices } = llmResponse;
      const content = choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('No content in LLM response');
      }

      // The LLM may return the JSON wrapped in a markdown code block.
      // We need to extract the raw JSON string.
      const jsonRegex = /```json\s*([\s\S]*?)\s*```/u;
      const match = content.match(jsonRegex);

      const jsonString = match?.[1] ?? content;

      return JSON.parse(jsonString);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.error('Failed to parse LLM response content:', errorMessage);
      // Use the custom error type for better handling in the UI
      throw new BadResponseError(
        `Could not parse content from LLM response: ${errorMessage}`,
      );
    }
  }
}