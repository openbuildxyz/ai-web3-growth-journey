import { createContext, useContext, useState, useEffect } from 'react';
import config from '../config/environment';

// Create context
const AuthContext = createContext(null);

// Hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Auth Provider component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Effect to load auth state from localStorage on app start
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Check for existing user data in localStorage
        const storedUser = localStorage.getItem(config.AUTH.CURRENT_USER_KEY);
        const storedToken = localStorage.getItem(config.AUTH.TOKEN_STORAGE_KEY);
        
        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser);
          setCurrentUser(userData);
        }
      } catch (err) {
        console.error('Error loading auth state:', err);
        // Clear corrupted data
        localStorage.removeItem(config.AUTH.CURRENT_USER_KEY);
        localStorage.removeItem(config.AUTH.TOKEN_STORAGE_KEY);
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Function to update user state (called by individual portals)
  const updateUser = (userData) => {
    setCurrentUser(userData);
    
    if (userData) {
      localStorage.setItem(config.AUTH.CURRENT_USER_KEY, JSON.stringify(userData));
      if (userData.token) {
        localStorage.setItem(config.AUTH.TOKEN_STORAGE_KEY, userData.token);
      }
    } else {
      // Clear localStorage when userData is null
      localStorage.removeItem(config.AUTH.CURRENT_USER_KEY);
      localStorage.removeItem(config.AUTH.TOKEN_STORAGE_KEY);
      localStorage.removeItem('userRole');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(config.AUTH.CURRENT_USER_KEY);
    localStorage.removeItem(config.AUTH.TOKEN_STORAGE_KEY);
    // Clear any role-specific data
    localStorage.removeItem('userRole');
  };

  // Legacy login methods (kept for backward compatibility during transition)
  const studentLogin = async () => {
    throw new Error('Direct login is no longer supported. Please use the Student portal sign-in.');
  };

  const teacherLogin = async () => {
    throw new Error('Direct login is no longer supported. Please use the Teacher portal sign-in.');
  };

  const adminLogin = async () => {
    throw new Error('Direct login is no longer supported. Please use the Admin portal sign-in.');
  };

  const value = {
    currentUser,
    loading,
    error,
    updateUser, // New method for portals to update user state
    logout,
    // Legacy methods for backward compatibility
    studentLogin,
    teacherLogin,
    adminLogin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
