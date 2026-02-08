// app/utils/api.ts
const API_CONFIG = {
  baseURL: typeof window !== 'undefined' ? '/api' : 'http://localhost:3000/api',
  timeout: 10000,
};

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
      // Return mock data if API fails
      return this.getMockData(endpoint, options) as T;
    }
  }
  
  private getMockData(endpoint: string, options: RequestInit): any {
    // Mock responses for when API is down
    switch(endpoint) {
      case '/chat':
        if (options.method === 'GET') {
          return {
            success: true,
            messages: [
              {
                id: '1',
                sender: 'System',
                text: 'Chat API is in demo mode',
                type: 'text',
                timestamp: new Date().toISOString(),
                isRead: true
              }
            ]
          };
        }
        return { success: true, messageId: 'DEMO_MSG' };
        
      case '/trading':
        if (options.method === 'GET') {
          return {
            success: true,
            data: [
              {
                symbol: 'BTC/USD',
                name: 'Bitcoin',
                currentPrice: 45128.50,
                change24hPercent: 2.84
              }
            ]
          };
        }
        return { 
          success: true, 
          orderId: 'DEMO_ORDER',
          status: 'filled',
          message: 'Demo order executed'
        };
        
      default:
        return { success: false, error: 'API unavailable', fallback: true };
    }
  }
  
  // Chat API
  async getChatMessages(chatId: string = 'demo', limit: number = 50) {
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
  
  // Trading API
  async getMarkets() {
    return this.request<any>('/trading');
  }
  
  async getMarketPair(symbol: string) {
    return this.request<any>(`/trading?symbol=${encodeURIComponent(symbol)}`);
  }
  
  async placeOrder(orderData: any) {
    return this.request<any>('/trading', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }
  
  // ... other API methods
}

export const api = new ApiClient();

// Helper functions
export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
  // Toast implementation
  console.log(`${type}: ${message}`);
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};