import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../config/environment';

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'teacher' | 'student';
}

export function useAuth() {
  const { isSignedIn, getToken } = useClerkAuth();
  const { user } = useUser();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const syncUserProfile = async () => {
      if (!isSignedIn || !user) {
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      try {
        // Get Clerk token
        const token = await getToken();
        if (!token) {
          throw new Error('No token available');
        }

        // Store token for API calls
        localStorage.setItem('authToken', token);
        localStorage.setItem(config.AUTH.TOKEN_STORAGE_KEY, token);

        // Try to get user profile from backend
        const response = await axios.get(`${config.API_BASE_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const profile = response.data;
        setCurrentUser({
          id: profile.id,
          email: profile.email,
          name: profile.name || `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
          firstName: profile.firstName,
          lastName: profile.lastName,
          role: profile.role
        });

        // Store user data
        localStorage.setItem(config.AUTH.CURRENT_USER_KEY, JSON.stringify(profile));

      } catch (err: any) {
        console.error('Error syncing user profile:', err);
        setError(err.response?.data?.message || err.message || 'Failed to sync profile');
        
        // Fallback to Clerk user data
        if (user) {
          const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
          const fallbackProfile = {
            id: user.id,
            email: user.emailAddresses[0]?.emailAddress || '',
            name: fullName || user.emailAddresses[0]?.emailAddress?.split('@')[0] || 'User',
            firstName: user.firstName || undefined,
            lastName: user.lastName || undefined,
            role: 'teacher' as const // Default role
          };
          setCurrentUser(fallbackProfile);
        }
      } finally {
        setLoading(false);
      }
    };

    syncUserProfile();
  }, [isSignedIn, user, getToken]);

  const logout = async () => {
    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem(config.AUTH.TOKEN_STORAGE_KEY);
    localStorage.removeItem(config.AUTH.CURRENT_USER_KEY);
    
    // Clerk handles the actual logout
    setCurrentUser(null);
  };

  const updateUser = (userData: Partial<UserProfile>) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      setCurrentUser(updatedUser);
      localStorage.setItem(config.AUTH.CURRENT_USER_KEY, JSON.stringify(updatedUser));
    }
  };

  return {
    currentUser,
    loading,
    error,
    isSignedIn,
    logout,
    updateUser,
    setError
  };
}
