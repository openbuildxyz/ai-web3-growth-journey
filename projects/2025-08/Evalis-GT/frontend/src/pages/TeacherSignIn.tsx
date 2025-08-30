import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

const TeacherSignIn: React.FC = () => {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Navigate to="/teacher" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Teacher Portal</h1>
          <p className="mt-2 text-gray-600">Sign in to access your dashboard</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <SignIn 
            routing="hash"
            signUpUrl="/teacher/signup"
            redirectUrl="/teacher"
            appearance={{
              elements: {
                formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
                card: 'shadow-none border-0',
                headerTitle: 'text-xl font-semibold text-gray-900',
                headerSubtitle: 'text-gray-600',
                socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-50',
                formFieldInput: 'border border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TeacherSignIn;
