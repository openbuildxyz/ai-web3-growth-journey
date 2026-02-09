/**
 * Parse response as JSON without throwing when server returns plain text (e.g. "Internal Server Error").
 */
export async function parseResponseJson<T = Record<string, unknown>>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    return { error: text || res.statusText || 'Invalid response' } as T;
  }
}
