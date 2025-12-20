import { formatConnectionRequestForLLM } from './llm-analytics';

describe('LLM Analytics Util for Connection Requests', () => {
  describe('formatConnectionRequestForLLM', () => {
    it('should return a correctly formatted prompt for a given origin', () => {
      const origin = 'https://app.uniswap.org';
      const resultPrompt = formatConnectionRequestForLLM(origin);

      // Check for key phrases from the new template
      expect(resultPrompt).toContain('您是一位区块链安全专家');
      expect(resultPrompt).toContain(
        "这是一个'连接钱包'的请求，不是一笔交易。",
      );
      expect(resultPrompt).toContain(
        '请重点关注该网站的已知安全风险、信誉和历史记录。',
      );

      // Check if the origin is correctly embedded
      expect(resultPrompt).toContain(
        `请求连接的网站源(origin):\n${origin}`,
      );

      // Check for the required JSON output format instructions
      expect(resultPrompt).toContain(
        '请将您的回复格式化为一个JSON对象，包含两个键："analysis" (一个包含您的摘要和风险解释的字符串) 和 "riskLevel" (一个字符串: "low", "medium", 或 "high")',
      );
      expect(resultPrompt).toContain('"analysis" 字段的内容必须是中文。');
    });
  });
});