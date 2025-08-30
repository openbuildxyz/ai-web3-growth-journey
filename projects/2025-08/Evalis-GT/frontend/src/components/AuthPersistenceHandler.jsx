import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import config from '../config/environment';

const AuthPersistenceHandler = () => {
  const { currentUser } = useAuth();

  // This effect runs on page load/refresh to ensure auth state persistence
  useEffect(() => {
    if (!currentUser) return;

    // Function to check token health and refresh if needed
    const validateAndRefreshToken = async () => {
      try {
        const token = localStorage.getItem(config.AUTH.TOKEN_STORAGE_KEY);
        if (!token) return;

        // Check if token will expire soon (within next 5 minutes)
        // This is a simplified check - for proper token expiry checking, decode the JWT
        // and check the expiration time
        
        // For now, we'll validate by making a lightweight API call
        try {
          await axios.get(
            `${config.API_BASE_URL}/auth/status`,
            { 
              headers: { Authorization: `Bearer ${token}` },
              // Don't throw errors for 401s
              validateStatus: (status) => status < 500
            }
          );
        } catch (error) {
          console.log('Token validation error, will attempt refresh');
          
          // If validation fails, try to refresh token
          if (currentUser.refreshToken) {
            try {
              console.log('Attempting early token refresh');
              const response = await axios.post(
                `${config.API_BASE_URL}/auth/refresh`,
                { refreshToken: currentUser.refreshToken }
              );
              
              if (response.status === 200 && response.data.token) {
                console.log('Early token refresh successful');
                
                // Update tokens in storage
                localStorage.setItem(config.AUTH.TOKEN_STORAGE_KEY, response.data.token);
                
                // Update stored user object
                const userData = { ...currentUser };
                userData.token = response.data.token;
                
                if (response.data.refreshToken) {
                  userData.refreshToken = response.data.refreshToken;
                }
                
                localStorage.setItem(config.AUTH.CURRENT_USER_KEY, JSON.stringify(userData));
                console.log('Auth state refreshed successfully');
              }
            } catch (refreshError) {
              console.error('Early token refresh failed:', refreshError);
              // Don't log user out here, let them continue until an actual API call fails
            }
          }
        }
      } catch (error) {
        console.error('Auth persistence validation error:', error);
      }
    };

    // Perform token validation when component mounts (page refresh)
    validateAndRefreshToken();
    
    // Also set up a timer to refresh token periodically if needed
    // This helps prevent token expiration during active sessions
    const refreshInterval = setInterval(() => {
      validateAndRefreshToken();
    }, 15 * 60 * 1000); // Check every 15 minutes
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [currentUser]);

  // This component doesn't render anything
  return null;
};

export default AuthPersistenceHandler; 