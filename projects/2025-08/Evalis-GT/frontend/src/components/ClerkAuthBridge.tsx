import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import config from '../config/environment';

// Bridge Clerk session token into localStorage TOKEN_STORAGE_KEY so existing API calls continue to work
export default function ClerkAuthBridge() {
  const { getToken, isSignedIn /*, signOut*/ } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    let active = true;
    
    async function syncToken() {
      try {
        if (!isSignedIn || !user) {
          // Clear tokens when signed out
          localStorage.removeItem(config.AUTH.TOKEN_STORAGE_KEY);
          localStorage.removeItem(config.AUTH.CURRENT_USER_KEY);
          localStorage.removeItem('userRole'); // Clear cached role
          return;
        }
        
        const token = await getToken().catch(() => null);
  if (token && active) {
          // Store the Clerk token for API calls
          localStorage.setItem(config.AUTH.TOKEN_STORAGE_KEY, token);
          
          // Verify user role with backend
          try {
            const headers: Record<string, string> = { 'Authorization': `Bearer ${token}` };
            const cachedRole = localStorage.getItem('userRole');
            if (cachedRole) headers['X-Portal-Role'] = cachedRole;
            const response = await fetch(`${config.API_BASE_URL}/auth/profile`, { headers });
            
            if (response.ok) {
              const raw = await response.json();
              const userData = raw && typeof raw === 'object' && 'user' in raw ? raw.user : raw;
              
              // Store user data with verified role from backend
              const userWithRole = {
                id: userData.id || user.id,
                email: userData.email || user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress,
                name: userData.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
                role: userData.role, // Use backend-verified role
                token: token,
                authMethod: 'clerk'
              };
              
              localStorage.setItem(config.AUTH.CURRENT_USER_KEY, JSON.stringify(userWithRole));
              if (userData.role) {
                localStorage.setItem('userRole', userData.role); // Cache role separately
              }
              
              console.log('User authenticated with role:', userData.role);
            } else {
              // Don’t force sign-out here; backend might be temporarily unreachable or slow.
              // Keep current local session and try again on next interval.
              console.warn('Profile verification failed (status ' + response.status + '). Will retry later.');
            }
          } catch (error) {
            console.warn('Failed to verify user role (network). Will retry.', error);
            // Soft failure: keep token; next interval will retry
          }
        }
      } catch (error) {
        console.log('Clerk token sync failed:', error);
      }
    }
    
    syncToken();
    
    // Refresh token periodically
  const id = setInterval(syncToken, 5 * 60 * 1000); // Every 5 minutes
    
    return () => { 
      active = false; 
      clearInterval(id); 
    };
  }, [getToken, isSignedIn, user]);

  return null;
}
