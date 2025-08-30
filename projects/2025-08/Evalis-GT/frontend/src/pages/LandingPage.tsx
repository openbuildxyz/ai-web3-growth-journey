import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { 
  GraduationCap, 
  Shield, 
  BarChart3, 
  TrendingUp, 
  LogIn, 
  Play, 
  User, 
  BookOpen,
  Code,
  ArrowRight,
  CheckCircle,
  Star,
  Zap
} from 'lucide-react';
import Header from '../components/Header';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [demoDialogOpen, setDemoDialogOpen] = useState(false);

  const features = [
    {
      icon: <GraduationCap className="h-8 w-8" />,
      title: 'Smart Grading',
      description: 'AI-powered grading system with automatic CGPA calculation and intelligent performance tracking.',
      highlight: 'AI-Powered'
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: 'Advanced Analytics',
      description: 'Comprehensive grade distribution and performance analytics with visual insights.',
      highlight: 'Real-time'
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: 'Progress Tracking',
      description: 'Visual representation of academic progress with predictive performance indicators.',
      highlight: 'Predictive'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Secure Access',
      description: 'Enterprise-grade security with role-based access control and data encryption.',
      highlight: 'Enterprise'
    }
  ];

  const demoOptions = [
    {
      title: 'Student Experience',
      icon: <User className="h-10 w-10" />,
      description: 'Explore the student dashboard with sample assignments and grades',
      path: '/student',
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
    },
    {
      title: 'Teacher Portal',
      icon: <BookOpen className="h-10 w-10" />,
      description: 'Try the teacher interface with grading tools and class management',
      path: '/teacher',
      color: 'bg-green-50 hover:bg-green-100 border-green-200'
    },
    {
      title: 'Admin Dashboard',
      icon: <Code className="h-10 w-10" />,
      description: 'Experience the full administrative control panel',
      path: '/admin',
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Students' },
    { number: '500+', label: 'Teachers' },
    { number: '50+', label: 'Institutions' },
    { number: '99.9%', label: 'Uptime' }
  ];

  const handleDemoClick = (path: string) => {
    setDemoDialogOpen(false);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header showBackButton={false} />

      {/* Action Buttons */}
      <div className="fixed top-4 right-6 z-50 flex gap-3">
        <Dialog open={demoDialogOpen} onOpenChange={setDemoDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-gray-50">
              <Play className="h-4 w-4 mr-2" />
              Try Demo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Choose Your Experience</DialogTitle>
              <DialogDescription>
                Select a demo mode to explore Evalis features
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {demoOptions.map((option, index) => (
                <Card 
                  key={index}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${option.color}`}
                  onClick={() => handleDemoClick(option.path)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4 text-gray-700">
                      {option.icon}
                    </div>
                    <h3 className="font-semibold text-lg mb-2 text-gray-900">{option.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{option.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
        
        <Button onClick={() => navigate('/login')} className="bg-black hover:bg-gray-800 text-white">
          <LogIn className="h-4 w-4 mr-2" />
          Login
        </Button>
      </div>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                  <Zap className="h-3 w-3 mr-1" />
                  Next-Gen Education Platform
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold text-black leading-tight">
                  Smart Grading
                  <span className="block text-gray-600">Made Simple</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                  Transform your academic experience with our intelligent grading system. 
                  Streamlined, secure, and designed for modern education.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/get-started')}
                  className="bg-black hover:bg-gray-800 text-white px-8 py-3 text-lg"
                >
                  Get Started
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate('/login')}
                  className="border-gray-300 hover:bg-gray-50 px-8 py-3 text-lg"
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  Login
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-gray-100">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-black">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl transform rotate-3"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-black">Evalis Dashboard</div>
                        <div className="text-sm text-gray-500">Grade Management</div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-200">Live</Badge>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Mathematics</span>
                      <Badge variant="outline">A+</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Physics</span>
                      <Badge variant="outline">A</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Chemistry</span>
                      <Badge variant="outline">B+</Badge>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-black">Overall CGPA</span>
                      <span className="text-2xl font-bold text-black">8.7</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 bg-white border-gray-200">
              <Star className="h-3 w-3 mr-1" />
              Features
            </Badge>
            <h2 className="text-4xl font-bold text-black mb-4">
              Everything you need for modern grading
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful tools designed to streamline academic management and enhance learning outcomes.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gray-100 rounded-lg text-black">
                      {feature.icon}
                    </div>
                    <Badge variant="secondary" className="bg-black text-white">
                      {feature.highlight}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-black">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold mb-6">
            Ready to transform your grading experience?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of educators and students who trust Evalis for their academic management needs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate('/get-started')}
              className="bg-white text-black hover:bg-gray-100 px-8 py-3 text-lg"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/login')}
              className="border-gray-600 text-white hover:bg-gray-900 px-8 py-3 text-lg"
            >
              <LogIn className="h-5 w-5 mr-2" />
              Login Now
            </Button>
          </div>
          
          <div className="flex items-center justify-center mt-8 space-x-6 text-sm text-gray-400">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Free to start
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              No credit card required
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Setup in minutes
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;