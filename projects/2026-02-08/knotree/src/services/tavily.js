// Tavily search API calls via proxy

const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/+$/, "");
const apiUrl = (path) => (API_BASE ? `${API_BASE}${path}` : path);

export async function searchWithTavily(query, maxResults = 5) {
  try {
    const response = await fetch(apiUrl("/api/tavily"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        search_depth: "basic",
        max_results: maxResults,
        include_answer: false,
      }),
    });

    const data = await response.json();
    if (data.error) {
      console.error("Tavily API error:", data.error);
      return null;
    }

    // Transform Tavily results to our format
    if (data.results && data.results.length > 0) {
      return data.results.map((r) => ({
        title: r.title || "Untitled",
        url: r.url || "",
        snippet: r.content?.slice(0, 120) || "",
        score: r.score || 0,
      }));
    }
    return null;
  } catch (err) {
    console.error("Tavily request failed:", err);
    return null;
  }
}
