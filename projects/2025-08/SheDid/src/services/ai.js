// Metaso AI 服务集成
import { crypto } from '../utils/crypto';

class MetasoAI {
  constructor() {
    this.apiKey = crypto.getSecureApiKey();
    this.baseURL = import.meta.env.VITE_METASO_API_URL || 'https://metaso.cn/api/mcp';
    // 备选端点（基于文档链接）
    this.modelScopeURL = 'https://www.modelscope.cn/mcp/servers/metasota/metaso-search';
  }

  /**
   * 内容质量检查
   * @param {Object} content - 要检查的内容
   * @param {string} content.title - 标题
   * @param {string} content.body - 正文
   * @param {string} content.category - 分类
   * @returns {Promise<Object>} 检查结果
   */
  async checkContent(content) {
    // 基础验证
    if (!content.title || !content.body) {
      throw new Error('标题和内容不能为空');
    }

    console.log('开始 AI 内容检查...');
    console.log('API Key 状态:', this.apiKey ? '已配置' : '未配置');
    console.log('API Key 前缀:', this.apiKey ? this.apiKey.substring(0, 6) + '...' : 'N/A');
    console.log('API Key 是否以 mk- 开头:', this.apiKey ? this.apiKey.startsWith('mk-') : false);
    console.log('API URL:', this.baseURL);

    // 暂时跳过 MCP API 调用，直接使用本地检查
    // TODO: 需要进一步研究 Metaso MCP 的正确使用方式
    console.log('暂时使用本地检查（MCP 集成待完善）');
    return this.fallbackCheck(content);

    // 尝试调用 Metaso MCP API
    console.log('尝试调用 Metaso MCP API...');
    try {
      // 先尝试列出可用工具
      await this.listMCPTools();
      return await this.callMetasoMCP(content);
    } catch (error) {
      console.log('MCP API 调用失败，使用本地检查:', error.message);
      return this.fallbackCheck(content);
    }

    // 如果没有 API Key，直接使用本地检查
    if (!this.apiKey) {
      console.log('未配置 API Key，使用本地检查');
      return this.fallbackCheck(content);
    }

    try {
      // 构建请求数据
      const requestData = {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `你是一个专业的内容质量评估助手。请对以下提案内容进行评估，从以下维度给出评分（0-1）：
1. 内容质量 (content_quality): 内容是否详细、有逻辑
2. 语言质量 (language_quality): 语言表达是否清晰、准确
3. 主题相关性 (topic_relevance): 是否符合DAO提案主题
4. 原创性 (originality): 内容是否原创、有价值

请以JSON格式返回结果：
{
  "passed": boolean,
  "score": number,
  "feedback": "string",
  "content_quality": number,
  "language_quality": number,
  "topic_relevance": number,
  "originality": number,
  "suggestions": ["string"],
  "flags": ["string"]
}`
          },
          {
            role: 'user',
            content: `请评估以下提案：
标题：${content.title}
分类：${content.category}
内容：${content.body}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      };

      console.log('发送 API 请求...');

      // 设置超时
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

      // 调用 Metaso API
      const response = await fetch(`${this.baseURL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('API 响应状态:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API 错误响应:', errorText);
        throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('API 响应成功:', result);

      // 标准化返回格式
      return this.normalizeResponse(result);

    } catch (error) {
      console.error('Metaso AI 检查失败:', error);

      // 根据错误类型提供不同的处理
      if (error.name === 'AbortError') {
        console.log('API 请求超时，使用本地检查');
      } else if (error.message.includes('Failed to fetch')) {
        console.log('网络连接失败，使用本地检查');
      } else {
        console.log('API 调用失败，使用本地检查');
      }

      // 如果 API 失败，返回本地检查结果
      return this.fallbackCheck(content);
    }
  }

  /**
   * 列出 MCP 服务器的可用工具
   */
  async listMCPTools() {
    const listToolsRequest = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/list',
      params: {}
    };

    console.log('请求 MCP 工具列表:', listToolsRequest);

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(listToolsRequest)
      });

      console.log('工具列表响应状态:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('MCP 可用工具:', result);
        return result;
      } else {
        const errorText = await response.text();
        console.log('无法获取工具列表，状态码:', response.status);
        console.log('工具列表错误详情:', errorText);
      }
    } catch (error) {
      console.log('获取工具列表失败:', error.message);
    }
  }

  /**
   * 调用 Metaso MCP API
   */
  async callMetasoMCP(content) {
    if (!this.apiKey) {
      throw new Error('未配置 API Key');
    }

    // 尝试不同的 MCP 方法，基于 Metaso 搜索服务器
    const mcpRequest = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: {
        name: 'metaso_search',
        arguments: {
          query: `请分析以下内容的质量：标题：${content.title}，内容：${content.body}`,
          type: 'content_analysis'
        }
      }
    };

    console.log('发送 MCP 请求:', mcpRequest);

    // 设置超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒超时

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
          'User-Agent': 'ProposalDAO/1.0'
        },
        body: JSON.stringify(mcpRequest),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('MCP API 响应状态:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('MCP API 错误响应 (状态码:', response.status, ')');
        console.error('错误详情:', errorText);
        
        // 尝试解析错误响应
        try {
          const errorJson = JSON.parse(errorText);
          console.error('解析后的错误:', errorJson);
        } catch (e) {
          console.error('无法解析错误响应为 JSON');
        }
        
        throw new Error(`MCP API 请求失败: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('MCP API 响应成功:', result);

      // 处理 MCP 响应格式
      return this.normalizeMCPResponse(result);

    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('MCP API 请求超时');
      } else if (error.message.includes('Failed to fetch')) {
        throw new Error('无法连接到 MCP 服务器');
      } else {
        throw error;
      }
    }
  }

  /**
   * 标准化 MCP 响应格式
   */
  normalizeMCPResponse(mcpResponse) {
    try {
      // 检查 JSON-RPC 响应格式
      if (mcpResponse.error) {
        throw new Error(`MCP 错误: ${mcpResponse.error.message}`);
      }

      const result = mcpResponse.result;
      if (!result) {
        throw new Error('MCP 响应格式不正确');
      }

      // 根据 Metaso MCP 的实际响应格式调整
      return {
        passed: result.passed || result.quality_passed || false,
        score: result.score || result.quality_score || 0,
        feedback: result.feedback || result.message || '检查完成',
        details: {
          contentQuality: result.content_quality || result.details?.content_quality || 0,
          languageQuality: result.language_quality || result.details?.language_quality || 0,
          topicRelevance: result.topic_relevance || result.details?.topic_relevance || 0,
          originalityScore: result.originality || result.details?.originality || 0
        },
        suggestions: result.suggestions || result.recommendations || [],
        flags: result.flags || result.warnings || []
      };
    } catch (error) {
      console.error('解析 MCP 响应失败:', error);
      throw new Error(`MCP 响应解析失败: ${error.message}`);
    }
  }

  /**
   * 标准化 API 响应格式
   */
  normalizeResponse(apiResponse) {
    try {
      // Metaso API 返回 OpenAI 兼容格式
      const content = apiResponse.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('API 响应格式不正确');
      }

      // 解析 JSON 响应
      const aiResult = JSON.parse(content);

      return {
        passed: aiResult.passed || false,
        score: aiResult.score || 0,
        feedback: aiResult.feedback || '检查完成',
        details: {
          contentQuality: aiResult.content_quality || 0,
          languageQuality: aiResult.language_quality || 0,
          topicRelevance: aiResult.topic_relevance || 0,
          originalityScore: aiResult.originality || 0
        },
        suggestions: aiResult.suggestions || [],
        flags: aiResult.flags || []
      };
    } catch (error) {
      console.error('解析 AI 响应失败:', error);
      // 如果解析失败，返回默认格式
      return {
        passed: false,
        score: 0.5,
        feedback: 'AI 响应解析失败，使用默认评估',
        details: {
          contentQuality: 0.5,
          languageQuality: 0.5,
          topicRelevance: 0.5,
          originalityScore: 0.5
        },
        suggestions: ['请检查网络连接后重试'],
        flags: ['API_ERROR']
      };
    }
  }

  /**
   * 本地备用检查（当 API 不可用时）
   */
  fallbackCheck(content) {
    console.log('使用本地备用检查');

    const checks = {
      titleLength: content.title.length >= 5 && content.title.length <= 100,
      contentLength: content.body.length >= 50,
      noSpam: !this.containsSpam(content.title + ' ' + content.body),
      hasStructure: this.hasGoodStructure(content.body),
      languageQuality: this.checkLanguageQuality(content.body)
    };

    const scores = {
      titleLength: checks.titleLength ? 0.2 : 0,
      contentLength: checks.contentLength ? 0.2 : 0,
      noSpam: checks.noSpam ? 0.2 : 0,
      hasStructure: checks.hasStructure ? 0.2 : 0,
      languageQuality: checks.languageQuality ? 0.2 : 0
    };

    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const passed = totalScore >= 0.6;

    const feedback = this.generateFeedback(checks, totalScore);

    return {
      passed,
      score: totalScore.toFixed(2),
      feedback,
      details: {
        contentQuality: scores.contentLength + scores.hasStructure,
        languageQuality: scores.languageQuality,
        topicRelevance: scores.noSpam,
        originalityScore: 0.8 // 默认值
      },
      suggestions: this.generateSuggestions(checks),
      flags: []
    };
  }

  /**
   * 检查是否包含垃圾内容
   */
  containsSpam(text) {
    const spamKeywords = [
      'spam', '垃圾', '广告', '推广', '刷单',
      '免费', '赚钱', '投资', '理财', '贷款'
    ];

    const lowerText = text.toLowerCase();
    return spamKeywords.some(keyword => lowerText.includes(keyword));
  }

  /**
   * 检查内容结构
   */
  hasGoodStructure(content) {
    // 检查是否有段落分隔
    const paragraphs = content.split('\n').filter(p => p.trim().length > 0);

    // 检查是否有标点符号
    const hasPunctuation = /[。！？；，]/.test(content);

    return paragraphs.length >= 2 && hasPunctuation;
  }

  /**
   * 检查语言质量
   */
  checkLanguageQuality(content) {
    // 简单的语言质量检查
    const hasRepeatedChars = !/(.)\1{4,}/.test(content); // 没有连续5个相同字符
    const hasVariedLength = content.split('').length > content.split(' ').length * 2; // 中文内容检查

    return hasRepeatedChars && hasVariedLength;
  }

  /**
   * 生成反馈信息
   */
  generateFeedback(checks, score) {
    if (score >= 0.8) {
      return '内容质量优秀，符合社区标准！';
    } else if (score >= 0.6) {
      return '内容质量良好，建议稍作改进。';
    } else {
      const issues = [];
      if (!checks.titleLength) issues.push('标题长度不合适');
      if (!checks.contentLength) issues.push('内容太短');
      if (!checks.noSpam) issues.push('可能包含不当内容');
      if (!checks.hasStructure) issues.push('内容结构需要改进');
      if (!checks.languageQuality) issues.push('语言表达需要优化');

      return `内容需要改进：${issues.join('、')}。`;
    }
  }

  /**
   * 生成改进建议
   */
  generateSuggestions(checks) {
    const suggestions = [];

    if (!checks.titleLength) {
      suggestions.push('标题应该在5-100字符之间，简洁明确');
    }
    if (!checks.contentLength) {
      suggestions.push('内容至少需要50个字符，详细说明你的想法');
    }
    if (!checks.hasStructure) {
      suggestions.push('建议分段落组织内容，使用适当的标点符号');
    }
    if (!checks.languageQuality) {
      suggestions.push('注意语言表达的准确性和流畅性');
    }

    return suggestions;
  }
}

// 创建单例实例
const metasoAI = new MetasoAI();

// 导出主要方法
export const checkContent = (content) => metasoAI.checkContent(content);

export default metasoAI;