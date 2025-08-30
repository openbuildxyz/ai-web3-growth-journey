import React from 'react';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';
import { useClerk } from '@clerk/clerk-react';
import { useAuth } from '../hooks/useAuth';
import config from '../config/environment';

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showIcon?: boolean;
  showText?: boolean;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  variant = 'outline', 
  size = 'default',
  className = '',
  showIcon = true,
  showText = true
}) => {
  const { signOut } = useClerk();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      // Clear local auth state
      logout();
      
      // Clear all localStorage items
      localStorage.removeItem('userRole');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('clerk-db-jwt');
      
      // Clear sessionStorage as well
      sessionStorage.clear();
      
      // Call the session clearing endpoint
      try {
        await fetch(`${config.API_BASE_URL}/auth/clear-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } catch (sessionError) {
        console.warn('Failed to clear server session:', sessionError);
      }
      
      // Sign out from Clerk with full redirect
      await signOut({ redirectUrl: '/' });
      
      // Force navigation to home page
      window.location.href = '/';
      
    } catch (error) {
      console.error('Logout error:', error);
      // Even if Clerk logout fails, still clear everything and navigate away
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size}
      onClick={handleLogout}
      className={`flex items-center gap-2 ${className}`}
    >
      {showIcon && <LogOut className="h-4 w-4" />}
      {showText && <span>Logout</span>}
    </Button>
  );
};

export default LogoutButton;
