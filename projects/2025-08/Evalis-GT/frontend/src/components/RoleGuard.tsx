import React from 'react';
import { useAuth } from '@clerk/clerk-react';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole: string;
  userRole?: string;
  fallback?: React.ReactNode;
}

export default function RoleGuard({ 
  children, 
  requiredRole, 
  userRole, 
  fallback 
}: RoleGuardProps) {
  const { signOut } = useAuth();
  
  // Get user role from props or localStorage
  const currentRole = userRole || (() => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      return currentUser.role || localStorage.getItem('userRole');
    } catch {
      return null;
    }
  })();

  // If user doesn't have required role, show fallback or access denied
  if (currentRole !== requiredRole) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center p-6 bg-white rounded-lg shadow-lg">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this {requiredRole} portal.
            {currentRole && ` Your current role: ${currentRole}`}
          </p>
          <div className="space-y-2">
            <button 
              onClick={() => {
                // Redirect to appropriate portal based on current role
                if (currentRole === 'admin') {
                  window.location.href = '/admin';
                } else if (currentRole === 'teacher') {
                  window.location.href = '/teacher';
                } else if (currentRole === 'student') {
                  window.location.href = '/student';
                } else {
                  window.location.href = '/login';
                }
              }}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Go to Your Portal
            </button>
            <button 
              onClick={async () => {
                await signOut();
                window.location.href = '/login';
              }}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
