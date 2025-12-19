import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import config from '../config/environment';

const SESSION_THRESHOLD = 5 * 60 * 1000; // 5 minutes

const AuthListener = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDialog, setShowDialog] = useState(false);
  const [authError, setAuthError] = useState(null);
  
  useEffect(() => {
    // Event listener for auth errors
    const handleAuthError = (event) => {
      console.log('Auth error event received:', event.detail);
      
      // Skip if we're already on the login page
      if (location.pathname === '/login') {
        return;
      }
      
      const { message, redirectUrl } = event.detail;
      
      // Store current path for redirecting back after login
      sessionStorage.setItem('auth:redirectPath', location.pathname);
      
      // Show dialog instead of immediate redirect
      setAuthError({
        message,
        redirectUrl: redirectUrl || '/login'
      });
      
      setShowDialog(true);
    };
    
    // Event listener for auth warnings (non-critical issues)
    const handleAuthWarning = (event) => {
      console.log('Auth warning event received:', event.detail);
      
      // Skip if we're already on the login page
      if (location.pathname === '/login') {
        return;
      }
      
      // For warnings, we don't force a redirect but show a notification
      // Components can choose to handle these individually
    };
    
    // Register event listeners
    window.addEventListener('auth:error', handleAuthError);
    window.addEventListener('auth:warning', handleAuthWarning);
    
    // Check for existing auth errors in session storage
    const hasStoredError = sessionStorage.getItem('auth:error') === 'true';
    const errorTime = parseInt(sessionStorage.getItem('auth:errorTime') || '0', 10);
    const currentTime = Date.now();
    
    // Only show the dialog if the error happened recently
    if (hasStoredError && (currentTime - errorTime) < SESSION_THRESHOLD) {
      setAuthError({
        message: 'Your session has expired.',
        redirectUrl: '/login'
      });
      setShowDialog(true);
    }
    
    return () => {
      // Clean up event listeners
      window.removeEventListener('auth:error', handleAuthError);
      window.removeEventListener('auth:warning', handleAuthWarning);
    };
  }, [location.pathname, navigate]);
  
  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem(config.AUTH.CURRENT_USER_KEY);
    localStorage.removeItem(config.AUTH.TOKEN_STORAGE_KEY);
    localStorage.removeItem('firebaseToken');
    sessionStorage.removeItem('auth:error');
    sessionStorage.removeItem('auth:errorTime');
    
    // Close dialog and navigate to login
    setShowDialog(false);
    navigate(authError?.redirectUrl || '/login');
  };
  
  const handleContinue = () => {
    // Clear just the error status but keep user logged in
    sessionStorage.removeItem('auth:error');
    sessionStorage.removeItem('auth:errorTime');
    setShowDialog(false);
  };
  
  if (!showDialog) {
    return null;
  }
  
  return (
    <Dialog open={showDialog} onClose={handleContinue}>
      <DialogTitle>Session Notice</DialogTitle>
      <DialogContent>
        <Typography>
          {authError?.message || 'Your session may have expired.'}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          You can try to continue working or log in again to refresh your session.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleContinue} color="primary">
          Continue
        </Button>
        <Button onClick={handleLogout} color="primary" variant="contained">
          Log In Again
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AuthListener; 