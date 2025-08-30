import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

const StudentSignIn: React.FC = () => {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Navigate to="/student" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Student Portal</h1>
          <p className="mt-2 text-gray-600">Sign in to access your assignments</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <SignIn 
            routing="hash"
            signUpUrl="/student/signup"
            redirectUrl="/student"
            appearance={{
              elements: {
                formButtonPrimary: 'bg-green-600 hover:bg-green-700 text-white',
                card: 'shadow-none border-0',
                headerTitle: 'text-xl font-semibold text-gray-900',
                headerSubtitle: 'text-gray-600',
                socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-50',
                formFieldInput: 'border border-gray-300 focus:border-green-500 focus:ring-green-500'
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default StudentSignIn;
