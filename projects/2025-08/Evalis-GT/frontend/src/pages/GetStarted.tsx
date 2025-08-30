import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { 
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  User,
  FileText,
  CheckCircle,
  Users,
  BarChart3,
  Shield,
  Zap,
  Star
} from 'lucide-react';
import Header from '../components/Header';

const GetStarted: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const steps = [
    {
      title: 'Choose Your Role',
      description: 'Select how you want to use Evalis',
      icon: <User className="h-8 w-8" />
    },
    {
      title: 'Set Up Account',
      description: 'Create your account and profile',
      icon: <GraduationCap className="h-8 w-8" />
    },
    {
      title: 'Start Learning',
      description: 'Begin your academic journey',
      icon: <FileText className="h-8 w-8" />
    }
  ];

  const userRoles = [
    {
      title: 'Student',
      description: 'Access your grades, assignments, and track your academic progress',
      icon: <User className="h-12 w-12" />,
      features: ['View Grades', 'Submit Assignments', 'Track Progress', 'Access Materials'],
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
      path: '/login'
    },
    {
      title: 'Teacher',
      description: 'Manage classes, grade assignments, and track student performance',
      icon: <GraduationCap className="h-12 w-12" />,
      features: ['Grade Assignments', 'Manage Classes', 'Create Tests', 'View Analytics'],
      color: 'bg-green-50 hover:bg-green-100 border-green-200',
      path: '/login'
    },
    {
      title: 'Administrator',
      description: 'Oversee the entire system, manage users, and configure settings',
      icon: <Shield className="h-12 w-12" />,
      features: ['User Management', 'System Config', 'Reports', 'Data Import'],
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
      path: '/login'
    }
  ];

  const features = [
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Smart Analytics',
      description: 'Get insights into academic performance with detailed analytics'
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Secure Platform',
      description: 'Your data is protected with enterprise-grade security'
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Fast & Reliable',
      description: 'Lightning-fast performance with 99.9% uptime guarantee'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Collaborative',
      description: 'Built for seamless collaboration between students and teachers'
    }
  ];

  const handleRoleSelect = (path: string) => {
    navigate(path);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Get Started" />

      <div className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-black rounded-full">
              <Star className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-black mb-4">Get Started with Evalis</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose your role and start your journey with our intelligent grading system
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            {steps.map((_, index) => (
              <div key={index} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  index <= currentStep 
                    ? 'bg-black border-black text-white' 
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {index < currentStep ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    index < currentStep ? 'bg-black' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 0 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-black mb-2">Choose Your Role</h2>
                <p className="text-gray-600">Select how you want to use Evalis to get personalized features</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {userRoles.map((role, index) => (
                  <Card 
                    key={index}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${role.color} border-2`}
                    onClick={() => handleRoleSelect(role.path)}
                  >
                    <CardHeader className="text-center pb-4">
                      <div className="flex justify-center mb-4 text-gray-700">
                        {role.icon}
                      </div>
                      <CardTitle className="text-xl text-black">{role.title}</CardTitle>
                      <CardDescription className="text-gray-600">
                        {role.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {role.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center text-sm text-gray-700">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                            {feature}
                          </div>
                        ))}
                      </div>
                      <Button 
                        className="w-full mt-4 bg-black hover:bg-gray-800 text-white"
                        onClick={() => handleRoleSelect(role.path)}
                      >
                        Get Started as {role.title}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-black mb-2">Set Up Your Account</h2>
                <p className="text-gray-600">Create your account to access all features</p>
              </div>

              <Card className="max-w-md mx-auto border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className="mb-6">
                    <div className="p-4 bg-gray-100 rounded-full inline-block mb-4">
                      <User className="h-8 w-8 text-black" />
                    </div>
                    <h3 className="text-xl font-semibold text-black mb-2">Ready to Sign Up</h3>
                    <p className="text-gray-600">Click below to create your account and start using Evalis</p>
                  </div>
                  
                  <Button 
                    className="w-full bg-black hover:bg-gray-800 text-white mb-4"
                    onClick={() => navigate('/login')}
                  >
                    Create Account
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  
                  <p className="text-sm text-gray-500">
                    Already have an account?{' '}
                    <button 
                      onClick={() => navigate('/login')}
                      className="text-black hover:underline font-medium"
                    >
                      Sign in
                    </button>
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-black mb-2">Start Your Journey</h2>
                <p className="text-gray-600">You're all set! Begin exploring Evalis features</p>
              </div>

              <Card className="max-w-md mx-auto border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className="mb-6">
                    <div className="p-4 bg-green-100 rounded-full inline-block mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-black mb-2">All Set!</h3>
                    <p className="text-gray-600">You're ready to start using Evalis. Let's begin your academic journey.</p>
                  </div>
                  
                  <Button 
                    className="w-full bg-black hover:bg-gray-800 text-white"
                    onClick={() => navigate('/login')}
                  >
                    Go to Login
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-12 max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="border-gray-200 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <div className="text-sm text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </div>
          
          <Button
            onClick={nextStep}
            disabled={currentStep === steps.length - 1}
            className="bg-black hover:bg-gray-800 text-white"
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Features Section */}
        <div className="mt-20">
          {/* Separator removed */}
          
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">Why Choose Evalis?</h2>
            <p className="text-xl text-gray-600">Powerful features designed for modern education</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow text-center">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4 text-black">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-black mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;