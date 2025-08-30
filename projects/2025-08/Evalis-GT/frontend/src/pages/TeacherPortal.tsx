import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
    BarChart3, BookOpen, Calendar, CheckCircle, Clock, Download, Edit, Edit3,
    Eye, FileText, Filter, GraduationCap, Loader2, PenTool, Plus, 
    Trash2, Upload, User, Users, Award, AlertCircle
} from 'lucide-react';
import Header from '../components/Header';
import { SignIn } from '@clerk/clerk-react';
import { useAuth } from '@clerk/clerk-react';
import { Subject } from '../types/university';
import { EXAM_TYPES } from '../constants/universityData';
import { getStudentsByTeacher, getTeacherSubjects, getAccessibleBatches, getTeacherSubmissions, getTeacherAssignments, gradeSubmission, saveAnnotatedPDF, deleteAssignment, checkAuthState, restoreAuthFromUser } from '../api/teacherService';
import { getLetterGrade, getGradePoints } from '../utils/gradeCalculator';
import { getStudentsByBatch } from '../api/studentService';
import config from '../config/environment';
import TeacherAssignmentCreator from '../components/TeacherAssignmentCreator';
import TeacherQuestionPaperCreator from '../components/TeacherQuestionPaperCreator';
import PDFAnnotator from '../components/PDFAnnotator';
import TeacherGovernanceWidget from '../components/TeacherGovernanceWidget';
import TeacherWeb3Panel from '../components/TeacherWeb3Panel';
import BadgeGradingInterface from '../components/BadgeGradingInterface';
import BadgePreview from '../components/BadgePreview';
import { awardNftCertificate, awardBadgeBasedRewards, awardManualCertificate } from '../api/teacherService';

const TeacherPortal: React.FC = () => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isSignedIn) {
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
                  headerSubtitle: 'text-gray-600'
                }
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return <TeacherPortalContent />;
};

const TeacherPortalContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });
  const [selectedBatch, setSelectedBatch] = useState('');
  const [batches, setBatches] = useState<any[]>([]);
  const [showPDFAnnotator, setShowPDFAnnotator] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [gradingScores, setGradingScores] = useState<{[key: number]: number}>({});
  
  const navigate = useNavigate();

  // Stats for dashboard
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalAssignments: 0,
    pendingGrading: 0,
    completedGrading: 0
  });

  useEffect(() => {
    // Check authentication
    const userDataStr = localStorage.getItem(config.AUTH.CURRENT_USER_KEY);
    
    if (!userDataStr) {
      navigate('/login');
      return;
    }

    try {
      const userData = JSON.parse(userDataStr);
      
      if (userData.role !== 'teacher') {
        navigate('/login');
        return;
      }
      
      // Debug authentication state
      const authState = checkAuthState();
      console.log('Teacher Portal Auth State:', authState);
      
      // Try to restore auth if token is missing but user data exists
      if (!authState.hasToken && authState.hasUser) {
        console.log('Attempting to restore authentication...');
        if (restoreAuthFromUser()) {
          console.log('Authentication restored successfully');
        } else {
          console.warn('Could not restore authentication - user may need to log in again');
        }
      }
      
      initializeData();
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    }
  }, [navigate]);

  // Fetch students when batch selection changes
  useEffect(() => {
    if (selectedBatch) {
      fetchStudents(selectedBatch);
    } else {
      fetchStudents();
    }
  }, [selectedBatch]);

  const initializeData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchTeacherSubjects(),
        fetchBatches(),
        fetchStudents(),
        fetchAssignments(),
        fetchSubmissions()
      ]);
    } catch (error) {
      console.error('Error initializing data:', error);
      showNotification('Failed to load data. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherSubjects = async () => {
    try {
      const response = await getTeacherSubjects();
      setSubjects(response);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await getAccessibleBatches();
      setBatches(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching teacher-accessible batches:', error);
    }
  };

  const fetchStudents = async (batchId?: string) => {
    try {
      let response;
      if (batchId) {
        // Fetch students from specific batch
        response = await getStudentsByBatch(batchId);
      } else {
        // Fetch all students assigned to this teacher
        response = await getStudentsByTeacher();
      }
      setStudents(response);
      setStats(prev => ({ ...prev, totalStudents: response.length }));
    } catch (error) {
      console.error('Error fetching students:', error);
      showNotification('Failed to load students. Please try again.', 'error');
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await getTeacherSubmissions();
      setSubmissions(response);
      
      // Update stats based on submissions
      const pendingGrading = response.filter((sub: any) => !sub.graded).length;
      const completedGrading = response.filter((sub: any) => sub.graded).length;
      setStats(prev => ({ 
        ...prev, 
        pendingGrading, 
        completedGrading 
      }));
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setSubmissions([]);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await getTeacherAssignments();
      setAssignments(response || []);
      setStats(prev => ({
        ...prev,
        totalAssignments: response.length
      }));
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setAssignments([]);
      setStats(prev => ({
        ...prev,
        totalAssignments: 0
      }));
    }
  };  const showNotification = (message: string, severity: 'success' | 'error') => {
    setNotification({ open: true, message, severity });
  };

  // Grading handlers
  const handleGradeSubmission = async (submissionId: number) => {
    const gradeInput = document.getElementById(`grade-${submissionId}`) as HTMLInputElement;
    const feedbackInput = document.getElementById(`feedback-${submissionId}`) as HTMLInputElement;
    const awardTokensInput = document.getElementById(`award-tokens-${submissionId}`) as HTMLInputElement;
    const tokenAmountInput = document.getElementById(`token-amount-${submissionId}`) as HTMLInputElement;
    const tokenReasonInput = document.getElementById(`token-reason-${submissionId}`) as HTMLInputElement;
    
    const grade = gradeInput?.value;
    const feedback = feedbackInput?.value || '';
    const shouldAwardTokens = awardTokensInput?.checked || false;
    const tokenAmount = tokenAmountInput?.value ? parseFloat(tokenAmountInput.value) : 0;
    const tokenReason = tokenReasonInput?.value || '';
    
    if (!grade || isNaN(Number(grade)) || Number(grade) < 0 || Number(grade) > 100) {
      showNotification('Please enter a valid grade between 0 and 100', 'error');
      return;
    }

    if (shouldAwardTokens && (!tokenAmount || tokenAmount <= 0)) {
      showNotification('Please enter a valid token amount', 'error');
      return;
    }

    // Check wallet connection for automatic rewards
    const gradeNumber = Number(grade);
    if (gradeNumber >= 75) {
      // Will automatically award badge-based rewards, so student must have wallet linked
      const submission = submissions.find(s => s.id === submissionId);
      if (submission && !submission.Student?.walletAddress) {
        showNotification('Student must link their wallet to receive automatic badge rewards. Ask them to connect their wallet in the Student Portal first.', 'error');
        return;
      }
    }

    try {
      // Call the grading API with optional token awarding
      const tokenAward = shouldAwardTokens ? {
        awardTokens: true,
        tokenAmount,
        tokenReason: tokenReason || `Great work! Score: ${grade}%`
      } : undefined;

      const result = await gradeSubmission(submissionId, Number(grade), feedback, tokenAward);
      
      let successMessage = 'Grade submitted successfully!';
      
      // Check for automatic badge rewards
      if (result.badgeReward && !result.badgeReward.error) {
        const badge = result.badgeReward.results?.badge;
        const tokens = result.badgeReward.results?.tokens;
        const certificate = result.badgeReward.results?.certificate;
        
        successMessage += ` ${badge?.name} badge awarded with ${tokens?.amount || 0} EVLT tokens!`;
        
        if (certificate) {
          successMessage += ` NFT certificate also awarded!`;
        }
      } else if (result.badgeReward?.error) {
        successMessage += ` Note: Automatic rewards failed - ${result.badgeReward.error}`;
      }
      
      // Check for manual token awards
      if (result.tokenAward && !result.tokenAward.error) {
        successMessage += ` ${tokenAmount} EVT tokens awarded to student.`;
      } else if (result.tokenAward?.error) {
        successMessage += ` Note: Token awarding failed - ${result.tokenAward.error}`;
      }
      
      showNotification(successMessage, 'success');
      fetchSubmissions(); // Refresh the submissions list
    } catch (error) {
      console.error('Error grading submission:', error);
      showNotification('Failed to submit grade. Please try again.', 'error');
    }
  };

  const handleAwardCertificate = async (submissionId: number, studentName: string) => {
    try {
      const result = await awardNftCertificate(submissionId, ''); // Empty string for auto-generated metadata
      showNotification(`NFT certificate successfully awarded to ${studentName}! Transaction: ${result.txHash?.slice(0, 10)}...`, 'success');
      fetchSubmissions(); // Refresh to show updated status
    } catch (error: any) {
      console.error('Error awarding NFT certificate:', error);
      
      // Handle authentication errors specifically
      if (error.message?.includes('Authentication required') || 
          error.message?.includes('session has expired') ||
          error.response?.status === 401) {
        showNotification('Your session has expired. Please refresh the page and log in again.', 'error');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to award certificate';
        showNotification(`Certificate awarding failed: ${errorMessage}`, 'error');
      }
    }
  };

  const handleAwardManualCertificate = async (submissionId: number, studentName: string, reason?: string) => {
    try {
      const certificateReason = reason || `Manual NFT certificate award for exceptional work`;
      const result = await awardManualCertificate(submissionId, certificateReason);
      showNotification(`NFT certificate manually awarded to ${studentName}! Transaction: ${result.txHash?.slice(0, 10)}...`, 'success');
      fetchSubmissions(); // Refresh to show updated status
    } catch (error: any) {
      console.error('Error manually awarding NFT certificate:', error);
      
      // Handle authentication errors specifically
      if (error.message?.includes('Authentication required') || 
          error.message?.includes('session has expired') ||
          error.response?.status === 401) {
        showNotification('Your session has expired. Please refresh the page and log in again.', 'error');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to award manual certificate';
        showNotification(`Manual certificate awarding failed: ${errorMessage}`, 'error');
      }
    }
  };

  const handleAwardBadgeRewards = async (submissionId: number, awardCertificate: boolean) => {
    try {
      const result = await awardBadgeBasedRewards(submissionId, awardCertificate);
      const message = result.message || 'Badge rewards awarded successfully!';
      const badge = result.results?.badge;
      const tokens = result.results?.tokens;
      const certificate = result.results?.certificate;
      
      let detailMessage = message;
      if (badge && tokens) {
        detailMessage += ` ${badge.name} badge with ${tokens.amount} EVLT tokens awarded.`;
      }
      if (certificate) {
        detailMessage += ` NFT certificate included!`;
      }
      
      showNotification(detailMessage, 'success');
      fetchSubmissions(); // Refresh to show updated status
    } catch (error: any) {
      console.error('Error awarding badge rewards:', error);
      
      // Handle authentication errors specifically
      if (error.message?.includes('Authentication required') || 
          error.message?.includes('session has expired') ||
          error.response?.status === 401) {
        showNotification('Your session has expired. Please refresh the page and log in again.', 'error');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to award badge rewards';
        showNotification(`Badge reward awarding failed: ${errorMessage}`, 'error');
      }
    }
  };

  const handleViewSubmission = (submission: any) => {
    // Check if this is a PDF submission
    if (submission.fileUrl && submission.fileUrl.toLowerCase().includes('.pdf')) {
      setSelectedSubmission(submission);
      setShowPDFAnnotator(true);
    } else {
      // For text submissions or non-PDF files
      console.log('Viewing submission:', submission);
      alert(`Viewing submission by ${submission.Student?.name}:\n\n${submission.submissionText || 'No text content'}`);
    }
  };

  const handleClosePDFAnnotator = () => {
    setShowPDFAnnotator(false);
    setSelectedSubmission(null);
  };

  const handlePDFAnnotationSave = async (annotations: any[], gradedPdfUrl: string) => {
    try {
      // Save the annotated PDF to the server
      await saveAnnotatedPDF(selectedSubmission.id, annotations, gradedPdfUrl);
      
      console.log('PDF annotations saved:', annotations);
      console.log('Graded PDF URL:', gradedPdfUrl);
      showNotification('PDF annotations saved successfully!', 'success');
      
      // Refresh submissions to get updated data
      await fetchSubmissions();
      
      handleClosePDFAnnotator();
    } catch (error) {
      console.error('Error saving PDF annotations:', error);
      showNotification('Failed to save PDF annotations. Please try again.', 'error');
    }
  };

  const handleDeleteAssignment = async (assignmentId: string, assignmentTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${assignmentTitle}"? This will also delete all submissions and uploaded files. This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await deleteAssignment(assignmentId);
      showNotification(
        `Assignment deleted successfully. ${response.deletedSubmissions || 0} submissions were also removed.`, 
        'success'
      );
      
      // Refresh assignments and submissions
      await Promise.all([fetchAssignments(), fetchSubmissions()]);
    } catch (error: any) {
      console.error('Error deleting assignment:', error);
      
      // Handle authentication errors specifically
      if (error.message?.includes('Authentication required') || 
          error.message?.includes('session has expired') ||
          error.response?.status === 401) {
        showNotification('Your session has expired. Please refresh the page and log in again.', 'error');
        // Optionally redirect to login
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete assignment';
        showNotification(`Failed to delete assignment: ${errorMessage}`, 'error');
      }
    }
  };

  const StatCard = ({ title, value, icon, description, trend }: { 
    title: string; 
    value: number | string; 
    icon: React.ReactNode; 
    description: string;
    trend?: string;
  }) => (
    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className="text-gray-400">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-black">{value}</div>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
        {trend && (
          <div className="flex items-center mt-2">
            <Badge variant="outline" className="text-xs border-green-200 text-green-800">
              {trend}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const QuickActionCard = ({ title, description, icon, onClick, disabled = false }: {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
  }) => (
    <Card 
      className={`border-0 shadow-md hover:shadow-lg transition-all cursor-pointer ${disabled ? 'opacity-50' : ''}`}
      onClick={disabled ? undefined : onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gray-100 rounded-lg text-black">
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-black mb-1">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Teacher Portal" showLogout={true} />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin mr-3" />
            <span className="text-lg text-gray-600">Loading your dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Teacher Portal" showLogout={true} />

      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-black rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-black">Teacher Dashboard</h1>
              <p className="text-gray-600">Manage your classes, assignments, and student progress</p>
            </div>
          </div>
        </div>

        {/* Notification */}
        {notification.open && (
          <Alert className={`mb-6 ${notification.severity === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className={notification.severity === 'error' ? 'text-red-800' : 'text-green-800'}>
              {notification.message}
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 bg-white border border-gray-200">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Students</span>
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Assignments</span>
            </TabsTrigger>
            <TabsTrigger value="grading" className="flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white">
              <PenTool className="h-4 w-4" />
              <span className="hidden sm:inline">Grading</span>
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Questions</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Students"
                value={stats.totalStudents}
                icon={<Users className="h-4 w-4" />}
                description="Students under your guidance"
                trend="+5 this month"
              />
              <StatCard
                title="Active Assignments"
                value={stats.totalAssignments}
                icon={<FileText className="h-4 w-4" />}
                description="Currently active assignments"
              />
              <StatCard
                title="Pending Grading"
                value={stats.pendingGrading}
                icon={<Clock className="h-4 w-4" />}
                description="Submissions awaiting review"
              />
              <StatCard
                title="Completed Grading"
                value={stats.completedGrading}
                icon={<CheckCircle className="h-4 w-4" />}
                description="Recently graded submissions"
                trend="+3 today"
              />
            </div>
            {/* Governance widget */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TeacherGovernanceWidget />
              <TeacherWeb3Panel />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <QuickActionCard
                title="Create Assignment"
                description="Create new assignments for your students"
                icon={<Plus className="h-5 w-5" />}
                onClick={() => setActiveTab('assignments')}
              />
              <QuickActionCard
                title="Grade Submissions"
                description="Review and grade pending submissions"
                icon={<PenTool className="h-5 w-5" />}
                onClick={() => setActiveTab('grading')}
              />
              <QuickActionCard
                title="View Students"
                description="Manage your student roster"
                icon={<Users className="h-5 w-5" />}
                onClick={() => setActiveTab('students')}
              />
              <QuickActionCard
                title="Create Questions"
                description="Build question papers and tests"
                icon={<BookOpen className="h-5 w-5" />}
                onClick={() => setActiveTab('questions')}
              />
              <QuickActionCard
                title="Upload Materials"
                description="Share resources with students"
                icon={<Upload className="h-5 w-5" />}
                onClick={() => {}}
              />
              <QuickActionCard
                title="View Reports"
                description="Analyze student performance"
                icon={<BarChart3 className="h-5 w-5" />}
                onClick={() => setActiveTab('reports')}
              />
            </div>

            {/* Batch Filter for Dashboard */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Batch Overview
                </CardTitle>
                <CardDescription>Select a batch to view specific information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Label htmlFor="dashboard-batch-select" className="text-sm font-medium text-gray-700">
                    Filter by Batch:
                  </Label>
                  <select 
                    id="dashboard-batch-select"
                    value={selectedBatch} 
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-md focus:border-black focus:ring-black min-w-[200px]"
                  >
                    <option value="">All Batches</option>
                    {batches.map((batch) => {
                      const label = batch.name || batch.batchName || batch.id;
                      const extra = batch.startYear && batch.endYear ? ` ${batch.startYear}-${batch.endYear}` : '';
                      return (
                        <option key={batch.id} value={batch.id}>
                          {label}{extra}
                        </option>
                      );
                    })}
                  </select>
                  {selectedBatch && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedBatch('')}
                      className="border-gray-200 hover:bg-gray-50"
                    >
                      Clear Filter
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Submissions
                    {selectedBatch && (
                      <Badge variant="outline" className="ml-2 border-blue-200 text-blue-800">
                        {batches.find(b => b.id === selectedBatch)?.name}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Latest student submissions requiring attention
                    {selectedBatch ? ' from selected batch' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {submissions.length > 0 ? submissions.map((submission, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-black">{submission.title || 'Assignment'}</p>
                          <p className="text-sm text-gray-600">{submission.studentName || 'Student'} • {submission.submittedAt || 'Recently'}</p>
                        </div>
                        <Badge variant="outline" className="border-orange-200 text-orange-800">
                          {submission.status || 'Pending'}
                        </Badge>
                      </div>
                    )) : (
                      <div className="text-center py-4 text-gray-500">
                        No recent submissions
                        {selectedBatch && ' from selected batch'}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Your Subjects
                  </CardTitle>
                  <CardDescription>Subjects you're currently teaching</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {subjects.length > 0 ? subjects.map((subject) => (
                      <div key={subject.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-black">{subject.name}</p>
                          <p className="text-sm text-gray-600">{subject.code}</p>
                        </div>
                        <Badge variant="outline" className="border-blue-200 text-blue-800">
                          Active
                        </Badge>
                      </div>
                    )) : (
                      <div className="text-center py-4 text-gray-500">
                        No subjects assigned yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Student Management
                </CardTitle>
                <CardDescription>View and manage students by batch</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-4">
                      <Label htmlFor="batch-select" className="text-sm font-medium text-gray-700">
                        Select Batch:
                      </Label>
                      <select 
                        id="batch-select"
                        value={selectedBatch} 
                        onChange={(e) => setSelectedBatch(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-md focus:border-black focus:ring-black min-w-[200px]"
                      >
                        <option value="">All Students</option>
                        {batches.map((batch) => {
                          const label = batch.name || batch.batchName || batch.id;
                          const extra = batch.startYear && batch.endYear ? ` ${batch.startYear}-${batch.endYear}` : '';
                          return (
                            <option key={batch.id} value={batch.id}>
                              {label}{extra}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div className="flex-1">
                      <Input 
                        placeholder="Search students..." 
                        className="border-gray-200 focus:border-black focus:ring-black"
                      />
                    </div>
                    <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button className="bg-black hover:bg-gray-800 text-white">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Showing {students.length} students
                      {selectedBatch && (
                        <span className="ml-2">
                          from {batches.find(b => b.id === selectedBatch)?.name || 'selected batch'}
                        </span>
                      )}
                    </p>
                    <Badge variant="outline" className="border-blue-200 text-blue-800">
                      {selectedBatch ? 'Filtered' : 'All Students'}
                    </Badge>
                  </div>
                  
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Loading students...
                    </div>
                  ) : students.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {students.map((student) => (
                        <Card key={student.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="font-semibold text-black">{student.name}</h3>
                                <p className="text-sm text-gray-600">{student.studentId}</p>
                                <p className="text-sm text-gray-600">{student.email}</p>
                                {student.batch && (
                                  <p className="text-sm text-gray-500">Batch: {student.batch}</p>
                                )}
                              </div>
                              <Badge variant="outline" className="border-green-200 text-green-800">
                                Active
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              {student.currentGrade && (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600">Current Grade:</span>
                                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                    {student.currentGrade}
                                  </Badge>
                                </div>
                              )}
                              <div className="flex items-center gap-2 pt-2">
                                <Button variant="outline" size="sm" className="flex-1">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Profile
                                </Button>
                                <Button variant="outline" size="sm" className="flex-1">
                                  <BarChart3 className="h-4 w-4 mr-2" />
                                  Grades
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No students found</h3>
                      <p className="text-gray-600 mb-4">
                        {selectedBatch 
                          ? 'No students found in the selected batch' 
                          : 'No students assigned to you yet'
                        }
                      </p>
                      {selectedBatch && (
                        <Button 
                          variant="outline" 
                          onClick={() => setSelectedBatch('')}
                          className="border-gray-200 hover:bg-gray-50"
                        >
                          View All Students
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Assignment Management
                </CardTitle>
                <CardDescription>Create and manage assignments for your students</CardDescription>
              </CardHeader>
              <CardContent>
                <TeacherAssignmentCreator 
                  subjects={subjects}
                  examTypes={EXAM_TYPES}
                  onAssignmentCreated={() => {
                    // Refresh assignments when a new one is created
                    fetchAssignments();
                    showNotification('Assignment created successfully!', 'success');
                  }}
                />
              </CardContent>
            </Card>

            {/* Existing Assignments */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Your Assignments
                </CardTitle>
                <CardDescription>View and manage your created assignments</CardDescription>
              </CardHeader>
              <CardContent>
                {assignments.length > 0 ? (
                  <div className="space-y-4">
                    {assignments.map((assignment, index) => (
                      <Card key={assignment.id || index} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-black mb-1">
                                {assignment.title || `Assignment ${index + 1}`}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">
                                {assignment.subject || assignment.subjectName} • Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}
                              </p>
                              <p className="text-xs text-gray-500 line-clamp-2">
                                {assignment.description || 'No description available'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="border-blue-200 text-blue-700">
                                {assignment.examType || 'Assignment'}
                              </Badge>
                              <Badge className={
                                assignment.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                                assignment.status === 'draft' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                'bg-gray-100 text-gray-800 border-gray-200'
                              }>
                                {assignment.status || 'Active'}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-300 text-red-700 hover:bg-red-100"
                                onClick={() => handleDeleteAssignment(assignment.id, assignment.title || `Assignment ${index + 1}`)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Assignment File */}
                          {assignment.fileUrl && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-blue-600" />
                                  <div>
                                    <p className="text-sm font-medium text-blue-800">Question Paper</p>
                                    <p className="text-xs text-blue-600">
                                      {assignment.fileUrl.split('/').pop() || 'Assignment file'}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                                    onClick={() => window.open(config.getFileUrl(assignment.fileUrl), '_blank')}
                                  >
                                    <Download className="h-4 w-4 mr-1" />
                                    Download
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                                    onClick={() => window.open(config.getFileUrl(assignment.fileUrl), '_blank')}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    Preview
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Assignment Stats */}
                          <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {assignment.submissionCount || 0} submissions
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Created {assignment.createdAt ? new Date(assignment.createdAt).toLocaleDateString() : 'Recently'}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No assignments created yet</h3>
                    <p className="text-gray-600 mb-6">Create your first assignment to get started</p>
                    <Button
                      onClick={() => setActiveTab('assignments')}
                      className="bg-black hover:bg-gray-800 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Assignment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Grading Tab */}
          <TabsContent value="grading" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PenTool className="h-5 w-5" />
                  Grading Center
                </CardTitle>
                <CardDescription>Review and grade student submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Input 
                        placeholder="Search submissions..." 
                        className="border-gray-200 focus:border-black focus:ring-black"
                      />
                    </div>
                    <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                  
                  {/* Submissions List */}
                  {submissions.length > 0 ? (
                    <div className="space-y-4">
                      {submissions.map((submission) => (
                        <Card key={submission.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-4">
                                  <h3 className="font-semibold text-lg text-black">
                                    {submission.Assignment?.title || `Assignment ${submission.assignmentId}`}
                                  </h3>
                                  <Badge 
                                    variant="outline" 
                                    className={submission.graded ? 'border-green-200 text-green-800' : 'border-orange-200 text-orange-800'}
                                  >
                                    {submission.graded ? 'Graded' : 'Pending Review'}
                                  </Badge>
                                </div>
                                
                                <div className="flex items-center gap-6 text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <User className="h-4 w-4" />
                                    {submission.Student?.name || 'Unknown Student'} ({submission.Student?.section || 'N/A'})
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <BookOpen className="h-4 w-4" />
                                    {submission.Subject?.name || 'Unknown Subject'}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    Submitted: {submission.submissionDate ? new Date(submission.submissionDate).toLocaleDateString() : 'Unknown'}
                                  </span>
                                </div>

                                {/* Submission Preview */}
                                <div className="mt-3 space-y-3">
                                  {/* Text Submission */}
                                  <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-700 font-medium mb-1">Text Submission:</p>
                                    <p className="text-sm text-gray-600 line-clamp-3">
                                      {submission.submissionText || 'No text submission provided'}
                                    </p>
                                  </div>

                                  {/* File Attachment */}
                                  {submission.fileUrl && (
                                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <FileText className="h-4 w-4 text-blue-600" />
                                          <div>
                                            <p className="text-sm font-medium text-blue-800">Student Submission File</p>
                                            <p className="text-xs text-blue-600">
                                              {submission.fileUrl.split('/').pop() || 'Submitted File'}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-blue-300 text-blue-700 hover:bg-blue-100"
                                            onClick={() => window.open(config.getFileUrl(submission.fileUrl), '_blank')}
                                          >
                                            <Download className="h-4 w-4 mr-1" />
                                            Download
                                          </Button>
                                          {submission.fileUrl.toLowerCase().includes('.pdf') && (
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="border-green-300 text-green-700 hover:bg-green-100"
                                              onClick={() => handleViewSubmission(submission)}
                                            >
                                              <Edit3 className="h-4 w-4 mr-1" />
                                              Grade PDF
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Graded File (if available) */}
                                  {submission.gradedFileUrl && (
                                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <CheckCircle className="h-4 w-4 text-green-600" />
                                          <div>
                                            <p className="text-sm font-medium text-green-800">Graded File with Annotations</p>
                                            <p className="text-xs text-green-600">
                                              Contains teacher feedback and corrections
                                            </p>
                                          </div>
                                        </div>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="border-green-300 text-green-700 hover:bg-green-100"
                                          onClick={() => window.open(submission.gradedFileUrl, '_blank')}
                                        >
                                          <Eye className="h-4 w-4 mr-1" />
                                          View Graded
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Grade Display/Input */}
                                {submission.graded ? (
                                  <div className="flex items-center gap-4 mt-3">
                                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                      {submission.score || 0}% ({getLetterGrade(submission.score || 0)})
                                    </Badge>
                                    <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                                      {getGradePoints(submission.score || 0)} GP
                                    </Badge>
                                    {submission.feedback && (
                                      <span className="text-sm text-gray-600">
                                        Feedback provided
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <div className="space-y-3 mt-3">
                                    {/* Grade Input */}
                                    <div className="flex items-center gap-2">
                                      <Input 
                                        type="number" 
                                        placeholder="Grade (0-100)" 
                                        className="w-32 text-sm"
                                        min="0"
                                        max="100"
                                        id={`grade-${submission.id}`}
                                        onChange={(e) => {
                                          const score = parseInt(e.target.value) || 0;
                                          setGradingScores(prev => ({
                                            ...prev,
                                            [submission.id]: score
                                          }));
                                          
                                          const previewElement = document.getElementById(`preview-${submission.id}`);
                                          if (previewElement && !isNaN(score)) {
                                            previewElement.textContent = `${getLetterGrade(score)} (${getGradePoints(score)} GP)`;
                                          } else if (previewElement) {
                                            previewElement.textContent = '';
                                          }
                                          
                                          // Show/hide badge preview
                                          const badgePreviewElement = document.getElementById(`badge-preview-${submission.id}`);
                                          if (badgePreviewElement) {
                                            if (score >= 75) {
                                              badgePreviewElement.style.display = 'block';
                                            } else {
                                              badgePreviewElement.style.display = 'none';
                                            }
                                          }
                                        }}
                                      />
                                      <span id={`preview-${submission.id}`} className="text-sm font-medium text-blue-600"></span>
                                    </div>
                                    
                                    {/* Feedback Input */}
                                    <div className="flex items-center gap-2">
                                      <Input 
                                        placeholder="Feedback (optional)" 
                                        className="flex-1 text-sm"
                                        id={`feedback-${submission.id}`}
                                      />
                                    </div>

                                    {/* Badge Preview */}
                                    <div id={`badge-preview-${submission.id}`} style={{ display: 'none' }}>
                                      <BadgePreview 
                                        score={gradingScores[submission.id] || 0}
                                        studentName={submission.Student?.name || 'Student'}
                                        className="mt-2"
                                      />
                                    </div>

                                    {/* Badge-Based Rewards Section */}
                                    <div id={`badge-section-${submission.id}`}>
                                      <BadgeGradingInterface
                                        submissionId={submission.id}
                                        currentGrade={submission.score || gradingScores[submission.id] || 0}
                                        studentName={submission.Student?.name || 'Student'}
                                        onAwardBadgeRewards={handleAwardBadgeRewards}
                                        isGraded={submission.graded && submission.score !== null}
                                      />
                                    </div>

                                    {/* EVT Token Award Section */}
                                    <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                                      <div className="flex items-center gap-2 mb-2">
                                        <input
                                          type="checkbox"
                                          id={`award-tokens-${submission.id}`}
                                          className="rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                                          onChange={(e) => {
                                            const tokenInputs = document.getElementById(`token-inputs-${submission.id}`);
                                            if (tokenInputs) {
                                              tokenInputs.style.display = e.target.checked ? 'block' : 'none';
                                            }
                                          }}
                                        />
                                        <label htmlFor={`award-tokens-${submission.id}`} className="text-sm font-medium text-purple-800">
                                          🎁 Award EVT Tokens for Excellent Work
                                        </label>
                                      </div>
                                      
                                      <div id={`token-inputs-${submission.id}`} className="space-y-2 ml-6" style={{ display: 'none' }}>
                                        <div className="flex items-center gap-2">
                                          <Input 
                                            type="number" 
                                            placeholder="Token amount (e.g., 50)" 
                                            className="w-40 text-sm"
                                            min="1"
                                            max="1000"
                                            id={`token-amount-${submission.id}`}
                                          />
                                          <span className="text-xs text-purple-600 font-medium">EVT tokens</span>
                                        </div>
                                        <Input 
                                          placeholder="Reason for award (optional)" 
                                          className="text-sm"
                                          id={`token-reason-${submission.id}`}
                                        />
                                        <p className="text-xs text-purple-600">
                                          💡 Student must have linked wallet to receive tokens
                                        </p>
                                      </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-end">
                                      <Button
                                        size="sm"
                                        className="bg-black hover:bg-gray-800 text-white"
                                        onClick={() => handleGradeSubmission(submission.id)}
                                      >
                                        Submit Grade
                                        {gradingScores[submission.id] >= 80 && (
                                          <span className="ml-2 text-xs bg-green-400 text-green-900 px-2 py-1 rounded">
                                            + Badge + NFT
                                          </span>
                                        )}
                                        {gradingScores[submission.id] >= 75 && gradingScores[submission.id] < 80 && (
                                          <span className="ml-2 text-xs bg-yellow-400 text-yellow-900 px-2 py-1 rounded">
                                            + Badge Only
                                          </span>
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-2 ml-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-gray-200 hover:bg-gray-50"
                                  onClick={() => handleViewSubmission(submission)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Full
                                </Button>
                                
                                {/* NFT Certificate Award Section - Show for all graded submissions */}
                                {submission.graded && (
                                  <div className="mt-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                          <Award className="h-4 w-4 text-yellow-600" />
                                          <span className="text-sm font-medium text-yellow-800">NFT Certificate Status</span>
                                        </div>
                                        {submission.score >= 80 ? (
                                          <p className="text-xs text-yellow-700">
                                            🎓 <strong>Silver+ League:</strong> Certificate automatically awarded for score ≥80%
                                          </p>
                                        ) : (
                                          <p className="text-xs text-yellow-700">
                                            ⭐ Manual certificate award available for exceptional work
                                          </p>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {/* Show appropriate button based on score */}
                                        {submission.score >= 80 ? (
                                          <Badge className="bg-green-100 text-green-800 border-green-200">
                                            Auto-Awarded ✓
                                          </Badge>
                                        ) : (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                                            onClick={() => {
                                              const reason = prompt('Enter reason for manual certificate award (optional):');
                                              if (reason !== null) { // User didn't cancel
                                                handleAwardManualCertificate(submission.id, submission.Student?.name || 'Student', reason);
                                              }
                                            }}
                                          >
                                            <Award className="h-4 w-4 mr-2" />
                                            Award Certificate
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <PenTool className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No submissions yet</h3>
                      <p className="text-gray-600">Student submissions will appear here when they submit assignments</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Question Paper Creator
                </CardTitle>
                <CardDescription>Create and manage question papers and tests</CardDescription>
              </CardHeader>
              <CardContent>
                <TeacherQuestionPaperCreator 
                  subjects={subjects}
                  examTypes={EXAM_TYPES}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Reports
                </CardTitle>
                <CardDescription>Analyze student performance and progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Reports and analytics interface will be implemented here
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* PDF Annotator Modal */}
      {showPDFAnnotator && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full h-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">
                Grading: {selectedSubmission.Student?.name} - {selectedSubmission.Assignment?.title}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClosePDFAnnotator}
              >
                Close
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <PDFAnnotator
                fileUrl={config.getFileUrl(selectedSubmission.fileUrl)}
                studentName={selectedSubmission.Student?.name || 'Unknown Student'}
                submissionId={selectedSubmission.id}
                onSave={handlePDFAnnotationSave}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherPortal;