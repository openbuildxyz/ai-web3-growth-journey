import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { AlertCircle } from 'lucide-react';

const AdminSignIn: React.FC = () => {
  const { isSignedIn, loading, currentUser } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (isSignedIn && currentUser) {
    // Check if user has admin role
    if (currentUser.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      // User is signed in but not an admin
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">You don't have permission to access the admin portal.</p>
            <Button onClick={() => window.location.href = '/'} className="w-full">
              Return to Home
            </Button>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>
          <p className="mt-2 text-gray-600">Sign in to access admin controls</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <SignIn 
            routing="hash"
            signUpUrl="/admin/signup"
            redirectUrl="/admin"
            appearance={{
              elements: {
                formButtonPrimary: 'bg-red-600 hover:bg-red-700 text-white',
                card: 'shadow-none border-0',
                headerTitle: 'text-xl font-semibold text-gray-900',
                headerSubtitle: 'text-gray-600',
                socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-50',
                formFieldInput: 'border border-gray-300 focus:border-red-500 focus:ring-red-500'
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminSignIn;
