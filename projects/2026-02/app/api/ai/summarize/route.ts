// app/utils/api.ts
const API_CONFIG = {
  baseURL: typeof window !== 'undefined' ? '/api' : 'http://localhost:3000/api',
  timeout: 10000,
};

// All your existing ApiClient methods now point to your new API routes
class ApiClient {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_CONFIG.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }
  
  // Chat API
  async getChatMessages(chatId: string, limit: number = 50) {
    return this.request<any>(`/chat?userId=${chatId}&limit=${limit}`);
  }
  
  async sendMessage(chatId: string, message: string, type: string = 'text') {
    return this.request<any>('/chat', {
      method: 'POST',
      body: JSON.stringify({ chatId, message, type }),
    });
  }
  
  async shareLocation(chatId: string, location: { lat: number; lng: number; name: string }) {
    return this.request<any>('/chat', {
      method: 'POST',
      body: JSON.stringify({ chatId, type: 'location', location }),
    });
  }
  
  // Wallet API
  async getWalletBalance() {
    return this.request<any>('/wallet');
  }
  
  async getTransactions(limit: number = 10) {
    return this.request<any>(`/wallet/transactions?limit=${limit}`);
  }
  
  async depositFunds(amount: number, cardId: string) {
    return this.request<any>('/wallet', {
      method: 'POST',
      body: JSON.stringify({ action: 'deposit', amount, cardId }),
    });
  }
  
  // Trading API
  async getMarkets() {
    return this.request<any>('/trading');
  }
  
  async getMarketPair(symbol: string) {
    return this.request<any>(`/trading?symbol=${symbol}`);
  }
  
  async placeOrder(orderData: any) {
    return this.request<any>('/trading', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }
  
  // Videos API
  async getVideos(params?: { category?: string; limit?: number }) {
    const query = params ? `?${new URLSearchParams(params as any)}` : '';
    return this.request<any>(`/videos${query}`);
  }
  
  async generateAIVideo(prompt: string) {
    return this.request<any>('/chat', {
      method: 'POST',
      body: JSON.stringify({ type: 'ai-video', videoPrompt: prompt }),
    });
  }
  
  // Security API
  async getSecurityStatus() {
    return this.request<any>('/security');
  }
  
  async runSecurityScan() {
    return this.request<any>('/security?scan=true');
  }
  
  // Sponsors API
  async getSponsors() {
    return this.request<any>('/sponsors');
  }
  
  async getFeaturedSponsors() {
    return this.request<any>('/sponsors?featured=true');
  }
}

// Keep your MockApiClient for fallback
class MockApiClient extends ApiClient {
  // ... keep your existing mock implementations
}

export const api = new ApiClient();
// ... rest of your utilities