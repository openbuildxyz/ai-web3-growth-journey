import config from '../config/environment';

export const clearAllSessions = async () => {
  try {
    // Clear all localStorage items
    localStorage.removeItem('userRole');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('clerk-db-jwt');
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear server session
    await fetch(`${config.API_BASE_URL}/auth/clear-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('All sessions cleared successfully');
  } catch (error) {
    console.warn('Error clearing sessions:', error);
  }
};

export const forceReload = () => {
  // Force a complete page reload to clear any cached state
  window.location.reload();
};

export const redirectToPortal = (role: string) => {
  // Redirect to the correct portal sign-in page
  window.location.href = `/${role}/sign-in`;
};
