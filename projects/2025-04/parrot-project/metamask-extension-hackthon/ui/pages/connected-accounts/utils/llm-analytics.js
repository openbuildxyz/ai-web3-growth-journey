export const formatConnectionRequestForLLM = (origin) => {
  const prompt = `您是一位区块链安全专家。请从用户的角度分析以下网站连接请求，并提供一个简短、易于理解的中文摘要。这是一个'连接钱包'的请求，不是一笔交易。这意味着该网站在连接后将能够读取您的钱包地址并向您发起交易请求，但无法在未经您进一步批准的情况下转移您的资产。

请重点关注该网站的已知安全风险、信誉和历史记录。

请求连接的网站源(origin):
${origin}

您的分析应包括：
1.  对此网站功能的极简摘要 (例如: "一个知名的NFT市场", "一个DeFi协议", "一个未知的网站")。
2.  清晰的风险评估 (low, medium, 或 high)，基于该网站的信誉和历史。
3.  一句话解释与此网站连接的最大潜在风险 (例如: "该网站曾有钓鱼攻击历史，请警惕它发起的交易请求", "这是一个信誉良好的网站，连接风险较低，但仍需仔细审查后续交易")。

请将您的回复格式化为一个JSON对象，包含两个键："analysis" (一个包含您的摘要和风险解释的字符串) 和 "riskLevel" (一个字符串: "low", "medium", 或 "high")。
您的整个回复必须是一个JSON对象。不要包含任何其他文本或格式。
"analysis" 字段的内容必须是中文。`;

  // For simplicity, we'll return the prompt string directly.
  // The calling service will package it into the final API request.
  return prompt;
};