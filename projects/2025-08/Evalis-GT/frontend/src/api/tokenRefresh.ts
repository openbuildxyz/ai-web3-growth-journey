import axios from 'axios';
import config from '../config/environment';

// Token refresh flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Add a response interceptor to handle token expiration
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return axios(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh the token
        const newToken = await refreshToken();
        if (newToken) {
          processQueue(null, newToken);
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return axios(originalRequest);
        } else {
          // If refresh fails, logout and redirect
          processQueue(new Error('Token refresh failed'), null);
          handleLogout();
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        handleLogout();
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

const refreshToken = async (): Promise<string | null> => {
  try {
    // Firebase authentication is disabled - using Clerk only
    console.warn('Firebase token refresh is disabled. Using Clerk authentication only.');
    
    // Check for Clerk token
    const clerkToken = localStorage.getItem(config.AUTH.TOKEN_STORAGE_KEY);
    if (clerkToken) {
      // For Clerk tokens, we rely on Clerk's automatic token management
      return clerkToken;
    }
    
    return null;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
};

const handleLogout = () => {
  // Clear all tokens
  localStorage.removeItem(config.AUTH.TOKEN_STORAGE_KEY);
  localStorage.removeItem(config.AUTH.CURRENT_USER_KEY);
  localStorage.removeItem('lastTokenRefresh');
  
  // Redirect to login
  const currentPath = window.location.pathname;
  if (!currentPath.includes('/login') && !currentPath.includes('/signin')) {
    window.location.href = '/';
  }
};

export { refreshToken, handleLogout };
