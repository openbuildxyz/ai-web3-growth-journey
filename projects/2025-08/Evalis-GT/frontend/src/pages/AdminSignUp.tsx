import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

const AdminSignUp: React.FC = () => {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>
          <p className="mt-2 text-gray-600">Create your admin account</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <SignUp 
            routing="hash"
            signInUrl="/admin/sign-in"
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

export default AdminSignUp;
