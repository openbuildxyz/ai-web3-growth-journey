import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  User, 
  GraduationCap, 
  Shield
} from 'lucide-react';
import Header from '../components/Header';
import ClerkAuth from '../components/ClerkAuth';
import ClerkAuthBridge from '../components/ClerkAuthBridge';
import { useAuth, useUser } from '@clerk/clerk-react';

export default function Login() {
  const [activeTab, setActiveTab] = useState('student');
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  const userTypes = [
    {
      id: 'student',
      label: 'Student',
      icon: <User className="h-4 w-4" />,
      description: 'Access your grades and assignments',
      color: 'bg-blue-50 border-blue-200'
    },
    {
      id: 'teacher',
      label: 'Teacher',
      icon: <GraduationCap className="h-4 w-4" />,
      description: 'Manage classes and grade students',
      color: 'bg-green-50 border-green-200'
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: <Shield className="h-4 w-4" />,
      description: 'System administration and management',
      color: 'bg-purple-50 border-purple-200'
    }
  ];

  // Redirect user if already signed in
  useEffect(() => {
    if (isSignedIn && user) {
      // The ClerkAuthBridge component will handle role detection
      // and redirect to appropriate portal
      const checkUserRole = async () => {
        // Wait a bit for the auth bridge to sync
        setTimeout(() => {
          const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
          if (currentUser.role) {
            switch (currentUser.role) {
              case 'student':
                navigate('/student');
                break;
              case 'teacher':
                navigate('/teacher');
                break;
              case 'admin':
                navigate('/admin');
                break;
              default:
                // If role not determined yet, redirect to student portal as default
                navigate('/student');
            }
          }
        }, 1000);
      };
      
      checkUserRole();
    }
  }, [isSignedIn, user, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <ClerkAuthBridge />
      
      <div className="container max-w-4xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Evalis
          </h1>
          <p className="text-lg text-gray-600">
            Please sign in to access your portal
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Choose your role and sign in to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                {userTypes.map((type) => (
                  <TabsTrigger key={type.id} value={type.id} className="flex items-center gap-2">
                    {type.icon}
                    {type.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {userTypes.map((type) => (
                <TabsContent key={type.id} value={type.id} className="space-y-4">
                  <div className={`p-4 rounded-lg ${type.color}`}>
                    <div className="flex items-center gap-3 mb-2">
                      {type.icon}
                      <h3 className="font-semibold">{type.label} Portal</h3>
                    </div>
                    <p className="text-sm text-gray-700">{type.description}</p>
                  </div>
                  
                  <ClerkAuth userType={type.id as 'student' | 'teacher' | 'admin'} />
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Don't have an account? Contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
