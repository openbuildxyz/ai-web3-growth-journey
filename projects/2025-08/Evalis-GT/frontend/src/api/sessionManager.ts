import { getToken } from './authUtils';
import config from '../config/environment';

class SessionManager {
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private readonly HEARTBEAT_INTERVAL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.startHeartbeat();
    
    // Listen for visibility change to restart heartbeat when tab becomes active
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.restartHeartbeat();
      }
    });
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(async () => {
      await this.ping();
    }, this.HEARTBEAT_INTERVAL);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private restartHeartbeat() {
    this.stopHeartbeat();
    this.startHeartbeat();
  }

  private async ping() {
    try {
      const token = getToken();
      if (!token) return;

      // Make a lightweight request to keep session alive
      const response = await fetch(`${config.API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        // Token expired, trigger refresh
        console.log('Session expired, refreshing token...');
        const { refreshToken } = await import('./tokenRefresh');
        await refreshToken();
      }
    } catch (error) {
      console.error('Session heartbeat failed:', error);
    }
  }

  public destroy() {
    this.stopHeartbeat();
    document.removeEventListener('visibilitychange', this.restartHeartbeat);
  }
}

// Create singleton instance
export const sessionManager = new SessionManager();
