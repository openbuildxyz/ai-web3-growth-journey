import React, { useState } from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import EmailPasswordAuth from './EmailPasswordAuth';
import IsolatedClerkProvider from './IsolatedClerkProvider';
import { UserRole } from '../../config/clerkConfig';

interface DualAuthProps {
  role: UserRole;
  mode: 'signin' | 'signup';
}

const DualAuth: React.FC<DualAuthProps> = ({ role, mode }) => {
  const [authMethod, setAuthMethod] = useState<'clerk' | 'password' | null>(null);

  const getRoleTitle = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'teacher': return 'Teacher';
      case 'student': return 'Student';
      default: return 'User';
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-red-600';
      case 'teacher': return 'bg-green-600';
      case 'student': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  if (!authMethod) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {getRoleTitle(role)} {mode === 'signin' ? 'Sign In' : 'Sign Up'}
            </h2>
            <div className={`inline-block px-3 py-1 mt-2 text-white text-sm rounded-full ${getRoleColor(role)}`}>
              {getRoleTitle(role)} Portal
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Choose your preferred sign-in method
            </p>
          </div>
          
          <div className="space-y-4">
            <Card className="bg-white shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Single Sign-On (SSO)</CardTitle>
                <CardDescription>
                  Use Google, GitHub, or other social accounts via Clerk
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setAuthMethod('clerk')}
                  className={`w-full text-white ${getRoleColor(role)} hover:opacity-90`}
                >
                  Continue with SSO
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Email & Password</CardTitle>
                <CardDescription>
                  Traditional email and password authentication
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setAuthMethod('password')}
                  variant="outline"
                  className="w-full border-2"
                >
                  Continue with Email
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
              <a 
                href={mode === 'signin' ? `/${role}/sign-up` : `/${role}/sign-in`}
                className={`font-medium hover:underline ${
                  role === 'admin' ? 'text-red-600' : 
                  role === 'teacher' ? 'text-green-600' : 
                  'text-blue-600'
                }`}
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (authMethod === 'clerk') {
    return (
      <IsolatedClerkProvider role={role}>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <Button
                onClick={() => setAuthMethod(null)}
                variant="ghost"
                className="mb-4"
              >
                ← Back to options
              </Button>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                {getRoleTitle(role)} {mode === 'signin' ? 'Sign In' : 'Sign Up'}
              </h2>
              <div className={`inline-block px-3 py-1 mt-2 text-white text-sm rounded-full ${getRoleColor(role)}`}>
                {getRoleTitle(role)} Portal - SSO
              </div>
            </div>
            
            <div className="bg-white py-8 px-6 shadow rounded-lg">
              {mode === 'signin' ? (
                <SignIn 
                  routing="path"
                  path={`/${role}/sign-in`}
                  redirectUrl={`/${role}?verified=true`}
                  signUpUrl={`/${role}/sign-up`}
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "shadow-none border-none",
                      headerTitle: "hidden",
                      headerSubtitle: "hidden",
                      socialButtonsIconButton: "border-gray-300",
                      formButtonPrimary: getRoleColor(role).replace('bg-', 'bg-'),
                    },
                  }}
                  afterSignInUrl={`/${role}?verified=true`}
                />
              ) : (
                <SignUp 
                  routing="path"
                  path={`/${role}/sign-up`}
                  redirectUrl={`/${role}`}
                  signInUrl={`/${role}/sign-in`}
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "shadow-none border-none",
                      headerTitle: "hidden",
                      headerSubtitle: "hidden",
                      socialButtonsIconButton: "border-gray-300",
                      formButtonPrimary: getRoleColor(role).replace('bg-', 'bg-'),
                    },
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </IsolatedClerkProvider>
    );
  }

  if (authMethod === 'password') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Button
              onClick={() => setAuthMethod(null)}
              variant="ghost"
              className="mb-4"
            >
              ← Back to options
            </Button>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {getRoleTitle(role)} {mode === 'signin' ? 'Sign In' : 'Sign Up'}
            </h2>
            <div className={`inline-block px-3 py-1 mt-2 text-white text-sm rounded-full ${getRoleColor(role)}`}>
              {getRoleTitle(role)} Portal - Email
            </div>
          </div>
          
          <div className="bg-white py-8 px-6 shadow rounded-lg">
            <EmailPasswordAuth 
              role={role} 
              mode={mode}
              onSuccess={() => {
                // Redirect will be handled by EmailPasswordAuth component
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default DualAuth;
