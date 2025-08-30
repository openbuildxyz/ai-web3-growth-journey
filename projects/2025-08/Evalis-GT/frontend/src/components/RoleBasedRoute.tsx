import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import config from '../config/environment';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export default function RoleBasedRoute({ 
  children, 
  allowedRoles, 
  redirectTo = '/login' 
}: RoleBasedRouteProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    const checkAuthorization = async () => {
      if (!isSignedIn || !user) {
        setIsAuthorized(false);
        navigate(redirectTo);
        return;
      }

      try {
        // Get token and verify user role with backend
        const token = await getToken();
        if (!token) {
          setIsAuthorized(false);
          navigate(redirectTo);
          return;
        }

        const response = await fetch(`${config.API_BASE_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUserRole(userData.role);
          
          if (allowedRoles.includes(userData.role)) {
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
            // Redirect to appropriate portal based on user's actual role
            switch (userData.role) {
              case 'admin':
                navigate('/admin');
                break;
              case 'teacher':
                navigate('/teacher');
                break;
              case 'student':
                navigate('/student');
                break;
              default:
                navigate(redirectTo);
            }
          }
        } else {
          setIsAuthorized(false);
          navigate(redirectTo);
        }
      } catch (error) {
        console.error('Authorization check failed:', error);
        setIsAuthorized(false);
        navigate(redirectTo);
      }
    };

    checkAuthorization();
  }, [isSignedIn, user, allowedRoles, navigate, redirectTo, getToken]);

  // Show loading while checking authorization
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized message
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
            {userRole && ` Your role: ${userRole}`}
          </p>
          <button 
            onClick={() => navigate(redirectTo)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
