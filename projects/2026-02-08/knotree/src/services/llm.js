// LLM API calls via proxy → ModelScope (OpenAI-compatible)

const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/+$/, "");
const apiUrl = (path) => (API_BASE ? `${API_BASE}${path}` : path);

async function callLLM(prompt) {
  try {
    const response = await fetch(apiUrl("/api/llm"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content:
              "你是一个知识拆解助手。你的输出必须严格是纯 JSON，不要包含任何其他文字、解释、markdown 代码块标记(```)。",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    const data = await response.json();
    if (data.error) {
      console.error("LLM API error:", data.error);
      return null;
    }

    return data.text || null;
  } catch (err) {
    console.error("LLM API request failed:", err);
    return null;
  }
}

function parseJSON(text) {
  if (!text) return null;
  try {
    // 去掉可能的 markdown 代码块标记
    const clean = text.replace(/```json\s*|```\s*/g, "").trim();
    return JSON.parse(clean);
  } catch {
    // 尝试提取 JSON 数组
    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function generateSubtopics(topic, parentPath = "") {
  const context = parentPath
    ? `\n该话题的上层路径是: ${parentPath}`
    : "";

  const prompt = `请将以下主题拆分为 4-5 个最重要的子话题。${context}

主题: "${topic}"

请严格按照以下 JSON 格式返回:
[{"label": "子话题名称", "summary": "一句话描述"}]`;

  const text = await callLLM(prompt);
  return parseJSON(text);
}

// 注意：ModelScope 模型没有内置 web search，
// 资料搜索统一走 Tavily，此函数作为 fallback
export async function searchWithLLM(topic) {
  const prompt = `关于"${topic}"，请推荐 3-5 个最值得学习的方向或关键概念。

请严格按以下 JSON 格式返回:
[{"title": "概念名称", "url": "", "snippet": "一句话描述"}]`;

  const text = await callLLM(prompt);
  return parseJSON(text);
}
