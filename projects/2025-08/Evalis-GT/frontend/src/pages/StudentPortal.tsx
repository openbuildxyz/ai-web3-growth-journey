import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import FileUpload from "../components/ui/FileUpload";
import {
    BookOpen,
    FileText,
    BarChart3,
    Calendar,
    User,
    GraduationCap,
    Clock,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    Award,
    Target,
    Loader2,
    Upload,
    Download,
    Eye,
    Filter,
    Coins
} from "lucide-react";
import Header from "../components/Header";
import StudentWeb3Rewards from "../components/StudentWeb3Rewards";
import WalletConnectionBanner from "../components/WalletConnectionBanner";
import { SignIn } from '@clerk/clerk-react';
import { useAuth } from '@clerk/clerk-react';
import { getStudentProfile, getStudentSubmissions } from "../api";
import { getStudentAssignments, getStudentSubjects, submitAssignment } from "../api/studentService";
import { Student, StudentSubmission, Subject } from "../types/university";
import { useAuth as useCustomAuth } from "../hooks/useAuth";
import config from "../config/environment";
import { calculateCGPA } from "../utils/gradeCalculator";
import { listMyCertificates } from "../api/certificatesService";

const StudentPortal: React.FC = () => {
    const { isSignedIn, isLoaded } = useAuth();

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (!isSignedIn) {
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
                                    headerSubtitle: 'text-gray-600'
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return <StudentPortalContent />;
};

const StudentPortalContent: React.FC = () => {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [student, setStudent] = useState<Student | null>(null);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [certs, setCerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error"
    });

    // Submission states
    const [submissionModal, setSubmissionModal] = useState({
        open: false,
        assignmentId: null as string | null,
        assignmentTitle: ""
    });
    const [submissionText, setSubmissionText] = useState("");
    const [submissionFile, setSubmissionFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    
    // Submission viewing state
    const [viewSubmissionModal, setViewSubmissionModal] = useState({
        open: false,
        submission: null as StudentSubmission | null
    });

    const navigate = useNavigate();
    const { currentUser } = useCustomAuth();

    // Stats for dashboard
    const [stats, setStats] = useState({
        totalSubjects: 0,
        completedAssignments: 0,
        pendingAssignments: 0,
        gradedAssignments: 0,
        averageGrade: 0,
        cgpa: 0
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

            if (userData.role !== 'student') {
                navigate('/login');
                return;
            }

            initializeData();
        } catch (error) {
            console.error('Error parsing user data:', error);
            navigate('/login');
        }
    }, [navigate]);

    const initializeData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                fetchStudentProfile(),
                fetchSubjects(),
                fetchSubmissions(),
                fetchAssignments(),
                fetchCertificates()
            ]);
        } catch (error) {
            console.error('Error initializing data:', error);
            showNotification('Failed to load data. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchCertificates = async () => {
        try { const list = await listMyCertificates(); setCerts(list || []); } catch (e) { /* ignore */ }
    };

    const fetchStudentProfile = async () => {
        try {
            if (currentUser?.id) {
                const response = await getStudentProfile();
                setStudent(response.data || response);
            }
        } catch (error) {
            console.error('Error fetching student profile:', error);
        }
    };

    const fetchSubjects = async () => {
        try {
            // Use the current student's endpoint without passing ID
            const subjectData = await getStudentSubjects();
            console.log('[StudentPortal] Fetched subjects:', subjectData);
            setSubjects(subjectData as Subject[] || []);
            setStats(prev => ({ ...prev, totalSubjects: (subjectData || []).length }));
        } catch (error) {
            console.error('Error fetching subjects:', error);
            // Add mock subjects for demo purposes when API fails
            const mockSubjects: Subject[] = [
                {
                    id: '1',
                    name: 'Mathematics',
                    code: 'MATH101',
                    credits: 3,
                    description: 'Advanced mathematical concepts and problem solving',
                    batchId: '1',
                    semesterId: '1'
                },
                {
                    id: '2',
                    name: 'Computer Science',
                    code: 'CS101',
                    credits: 4,
                    description: 'Introduction to programming and computer systems',
                    batchId: '1',
                    semesterId: '1'
                },
                {
                    id: '3',
                    name: 'Physics',
                    code: 'PHY101',
                    credits: 3,
                    description: 'Fundamental principles of physics and laboratory work',
                    batchId: '1',
                    semesterId: '1'
                },
                {
                    id: '4',
                    name: 'English Literature',
                    code: 'ENG101',
                    credits: 2,
                    description: 'Analysis of literary works and writing skills',
                    batchId: '1',
                    semesterId: '1'
                }
            ];
            console.log('[StudentPortal] Using mock subjects due to API error');
            setSubjects(mockSubjects);
            setStats(prev => ({ ...prev, totalSubjects: mockSubjects.length }));
        }
    };

    const fetchSubmissions = async () => {
        try {
            // Use the current student's endpoint without passing ID
            const submissionsResp: any = await getStudentSubmissions();
            const submissionsData: any[] = submissionsResp?.data || submissionsResp || [];
            setSubmissions(submissionsData as StudentSubmission[]);

            // Calculate stats from submissions
            const completed = submissionsData.length; // All submissions are completed
            const graded = submissionsData.filter(s => s.graded && s.score !== null).length;
            const grades = submissionsData.filter(s => s.graded && s.score !== null).map(s => s.score);
            const avgGrade = grades.length > 0 ? grades.reduce((a, b) => a + b, 0) / grades.length : 0;
            
            // Calculate CGPA
            const cgpa = calculateCGPA(submissionsData);

            setStats(prev => ({
                ...prev,
                completedAssignments: completed,
                gradedAssignments: graded,
                averageGrade: avgGrade,
                cgpa: cgpa
            }));
        } catch (error) {
            console.error('Error fetching submissions:', error);
        }
    };

    const fetchAssignments = async () => {
        try {
            console.log('[StudentPortal] Fetching assignments for current student');
            
            // Call without studentId to use the current user's token
            const assignmentsData = await getStudentAssignments();
            console.log('[StudentPortal] Fetched assignments:', assignmentsData);
            setAssignments(assignmentsData || []);
            
            // Calculate pending assignments - check for submitted status instead of Submissions array
            const pending = assignmentsData?.filter((a: any) => 
                !a.submitted
            ).length || 0;
            
            setStats(prev => ({ ...prev, pendingAssignments: pending }));
        } catch (error) {
            console.error('Error fetching assignments:', error);
        }
    };

    const showNotification = (message: string, severity: "success" | "error") => {
        setNotification({ open: true, message, severity });
    };

    // Submission handlers
    const handleSubmitAssignment = (assignmentId: string, assignmentTitle: string) => {
        setSubmissionModal({
            open: true,
            assignmentId,
            assignmentTitle
        });
        setSubmissionText("");
    };

    const handleSubmissionSubmit = async () => {
        if (!submissionModal.assignmentId || (!submissionText.trim() && !submissionFile)) {
            showNotification("Please enter submission text or upload a file", "error");
            return;
        }

        setSubmitting(true);
        try {
            const submissionData: any = {
                submissionText: submissionText.trim()
            };

            // If file is uploaded, add it to submission data
            if (submissionFile) {
                submissionData.file = submissionFile;
            }

            await submitAssignment(submissionModal.assignmentId, submissionData);

            showNotification("Assignment submitted successfully!", "success");
            setSubmissionModal({ open: false, assignmentId: null, assignmentTitle: "" });
            setSubmissionText("");
            setSubmissionFile(null);
            
            // Refresh assignments to show updated status
            fetchAssignments();
        } catch (error) {
            console.error('Error submitting assignment:', error);
            showNotification("Failed to submit assignment. Please try again.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    // View submission handlers
    const handleViewSubmission = async (submissionId: string) => {
        try {
            // Find the submission by ID
            const submission = submissions.find(s => s.id === submissionId);
            if (submission) {
                // If submission has a file, open it
                if (submission.fileUrl) {
                    window.open(config.getFileUrl(submission.fileUrl), '_blank');
                    showNotification("Opening your submission file...", "success");
                } else {
                    // Show submission details in modal
                    setViewSubmissionModal({
                        open: true,
                        submission: submission
                    });
                }
            } else {
                showNotification("Submission not found", "error");
            }
        } catch (error) {
            console.error('Error viewing submission:', error);
            showNotification("Failed to load submission details", "error");
        }
    };

    const handleViewGradedSubmission = async (submissionId: string) => {
        try {
            console.log('Looking for graded submission:', submissionId);
            console.log('Available submissions:', submissions.map(s => ({ 
                id: s.id, 
                status: s.status, 
                gradedFileUrl: s.gradedFileUrl,
                gradedDate: s.gradedDate 
            })));
            
            // Find the submission
            const submission = submissions.find(s => s.id === submissionId);
            if (submission && submission.gradedFileUrl) {
                // Construct full URL for graded PDF
                const fullUrl = submission.gradedFileUrl.startsWith('http') 
                    ? submission.gradedFileUrl 
                    : config.getFileUrl(submission.gradedFileUrl);
                
                console.log('Opening graded file URL:', fullUrl);
                // Open graded PDF with annotations in a new tab
                window.open(fullUrl, '_blank');
                showNotification("Opening graded submission...", "success");
            } else {
                console.log('Submission not found or no graded file:', {
                    submissionId,
                    foundSubmission: !!submission,
                    hasGradedFile: submission?.gradedFileUrl,
                    gradedFileUrl: submission?.gradedFileUrl,
                    status: submission?.status
                });
                showNotification("Graded file not available", "error");
            }
        } catch (error) {
            console.error('Error viewing graded submission:', error);
            showNotification("Failed to load graded submission", "error");
        }
    };

    const handleViewAssignmentDetails = (assignment: any) => {
        try {
            // This would open a modal with full assignment details
            console.log('Viewing assignment details:', assignment);
            showNotification("Opening assignment details...", "success");
            // TODO: Implement assignment details modal
        } catch (error) {
            console.error('Error viewing assignment details:', error);
            showNotification("Failed to load assignment details", "error");
        }
    };

    // Password reset handler
    const handlePasswordReset = async () => {
        try {
            if (!student?.email) {
                showNotification("Student email not found", "error");
                return;
            }

            // Firebase password reset is disabled - using Clerk only
            showNotification("Password reset is disabled. Please contact an administrator.", "error");
        } catch (error: any) {
            console.error('Error sending password reset email:', error);
            showNotification("Password reset functionality is disabled", "error");
        }
    };

    // View subject details handler
    const handleViewSubjectDetails = (subject: Subject) => {
        // Show subject information and assignments for this subject
        const subjectAssignments = assignments.filter(a => a.subjectId === subject.id);
        const subjectSubmissions = submissions.filter(s => s.subjectId === subject.id);
        
        console.log('Subject details:', {
            subject,
            assignments: subjectAssignments,
            submissions: subjectSubmissions
        });
        
        showNotification(`${subject.name} - ${subjectAssignments.length} assignments, ${subjectSubmissions.length} submissions`, "success");
        
        // Switch to assignments tab and filter by this subject
        setActiveTab('assignments');
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header title="Student Portal" showLogout={true} />
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
            <Header title="Student Portal" showLogout={true} />

            <div className="container mx-auto px-6 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-black rounded-lg">
                            <GraduationCap className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-black">Student Dashboard</h1>
                            <p className="text-gray-600">Welcome back, {student?.name || currentUser?.name || 'Student'}!</p>
                        </div>
                    </div>
                                        {certs.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {certs.slice(0,3).map((c: any) => (
                                                    <Badge key={c.id} className={
                                                        c.lastVerificationOk ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                                    }>
                                                        Certificate #{c.tokenId || c.id}: {c.lastVerificationOk ? 'Authentic' : 'Unverified'}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
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
                    <TabsList className="flex w-full bg-white border border-gray-200">
                        <TabsTrigger value="dashboard" className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white">
                            <BarChart3 className="h-4 w-4" />
                            Dashboard
                        </TabsTrigger>
                        <TabsTrigger value="subjects" className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white">
                            <BookOpen className="h-4 w-4" />
                            Subjects
                        </TabsTrigger>
                        <TabsTrigger value="assignments" className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white">
                            <FileText className="h-4 w-4" />
                            Assignments
                        </TabsTrigger>
                        <TabsTrigger value="grades" className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white">
                            <Award className="h-4 w-4" />
                            Grades
                        </TabsTrigger>
                        <TabsTrigger value="rewards" className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white">
                            <Coins className="h-4 w-4" />
                            Rewards
                        </TabsTrigger>
                        <TabsTrigger value="profile" className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white">
                            <User className="h-4 w-4" />
                            Profile
                        </TabsTrigger>
                    </TabsList>

                    {/* Dashboard Tab */}
                    <TabsContent value="dashboard" className="space-y-6">
                        {/* Wallet Connection Banner */}
                        <WalletConnectionBanner onConnectWallet={() => setActiveTab('rewards')} />
                        
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                            <StatCard
                                title="Total Subjects"
                                value={stats.totalSubjects}
                                icon={<BookOpen className="h-4 w-4" />}
                                description="Enrolled subjects this semester"
                            />
                            <StatCard
                                title="Completed Assignments"
                                value={stats.completedAssignments}
                                icon={<CheckCircle className="h-4 w-4" />}
                                description="Successfully submitted"
                            />
                            <StatCard
                                title="Pending Assignments"
                                value={stats.pendingAssignments}
                                icon={<Clock className="h-4 w-4" />}
                                description="Awaiting submission"
                            />
                            <StatCard
                                title="Graded Assignments"
                                value={stats.gradedAssignments}
                                icon={<Award className="h-4 w-4" />}
                                description="Assignments with grades"
                            />
                            <StatCard
                                title="Average Grade"
                                value={stats.averageGrade > 0 ? `${stats.averageGrade.toFixed(1)}%` : 'N/A'}
                                icon={<TrendingUp className="h-4 w-4" />}
                                description="Overall performance"
                            />
                            <StatCard
                                title="CGPA"
                                value={stats.cgpa > 0 ? stats.cgpa.toFixed(2) : 'N/A'}
                                icon={<GraduationCap className="h-4 w-4" />}
                                description="Cumulative Grade Point Average"
                                trend={stats.cgpa >= 7.0 ? "Excellent" : stats.cgpa >= 6.0 ? "Good" : stats.cgpa > 0 ? "Needs Improvement" : ""}
                            />
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Card className="border-0 shadow-md hover:shadow-lg transition-all cursor-pointer">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-black mb-1">View Assignments</h3>
                                            <p className="text-sm text-gray-600">Check your pending and completed assignments</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-md hover:shadow-lg transition-all cursor-pointer">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-green-100 rounded-lg text-green-600">
                                            <Upload className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-black mb-1">Submit Work</h3>
                                            <p className="text-sm text-gray-600">Upload your completed assignments</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-md hover:shadow-lg transition-all cursor-pointer">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                                            <Award className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-black mb-1">View Grades</h3>
                                            <p className="text-sm text-gray-600">Check your academic performance</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-md hover:shadow-lg transition-all cursor-pointer">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
                                            <BookOpen className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-black mb-1">Study Materials</h3>
                                            <p className="text-sm text-gray-600">Access course resources and notes</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-md hover:shadow-lg transition-all cursor-pointer">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-red-100 rounded-lg text-red-600">
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-black mb-1">Schedule</h3>
                                            <p className="text-sm text-gray-600">View your class timetable</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-md hover:shadow-lg transition-all cursor-pointer">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-black mb-1">Profile</h3>
                                            <p className="text-sm text-gray-600">Update your personal information</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Activity */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="border-0 shadow-md">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        Recent Submissions
                                    </CardTitle>
                                    <CardDescription>Your latest assignment submissions</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {submissions.length > 0 ? submissions.slice(0, 5).map((submission, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex-1">
                                                    <p className="font-medium text-black">
                                                        {(submission as any).Assignment?.title || `Assignment ${submission.assignmentId}` || 'Assignment'}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {(submission as any).subjectName || (submission as any).Subject?.name || 'Subject'} • {submission.submissionDate ? new Date(submission.submissionDate).toLocaleDateString() : 'Recently'}
                                                    </p>
                                                </div>
                                                <Badge variant="outline" className={
                                                    submission.graded ? 'border-blue-200 text-blue-800' :
                                                        'border-green-200 text-green-800'
                                                }>
                                                    {submission.graded ? 'Graded' : 'Pending'}
                                                </Badge>
                                            </div>
                                        )) : (
                                            <div className="text-center py-8">
                                                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No submissions yet</h3>
                                                <p className="text-gray-600 mb-4">Start by checking your assignments</p>
                                                <Button
                                                    onClick={() => setActiveTab('assignments')}
                                                    className="bg-black hover:bg-gray-800 text-white"
                                                >
                                                    View Assignments
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-md">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Target className="h-5 w-5" />
                                        Upcoming Deadlines
                                    </CardTitle>
                                    <CardDescription>Don't miss these important dates</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="text-center py-8">
                                            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming deadlines</h3>
                                            <p className="text-gray-600 mb-4">You're all caught up!</p>
                                            <Button
                                                variant="outline"
                                                onClick={() => setActiveTab('assignments')}
                                                className="border-gray-200 hover:bg-gray-50"
                                            >
                                                Check Assignments
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Academic Progress */}
                        <Card className="border-0 shadow-md">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Academic Progress
                                </CardTitle>
                                <CardDescription>Your performance overview this semester</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600 mb-2">
                                            {stats.totalSubjects}
                                        </div>
                                        <p className="text-sm text-blue-800 font-medium">Enrolled Subjects</p>
                                        <p className="text-xs text-blue-600 mt-1">This semester</p>
                                    </div>

                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600 mb-2">
                                            {stats.completedAssignments}
                                        </div>
                                        <p className="text-sm text-green-800 font-medium">Completed</p>
                                        <p className="text-xs text-green-600 mt-1">Assignments submitted</p>
                                    </div>

                                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                                        <div className="text-2xl font-bold text-orange-600 mb-2">
                                            {stats.averageGrade > 0 ? `${stats.averageGrade.toFixed(1)}%` : 'N/A'}
                                        </div>
                                        <p className="text-sm text-orange-800 font-medium">Average Grade</p>
                                        <p className="text-xs text-orange-600 mt-1">Overall performance</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Subjects Tab */}
                    <TabsContent value="subjects" className="space-y-6">
                        <Card className="border-0 shadow-md">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5" />
                                    My Subjects
                                </CardTitle>
                                <CardDescription>Subjects you're enrolled in this semester</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {subjects.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {subjects.map((subject) => (
                                            <Card key={subject.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                                                <CardContent className="p-4">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-black">{subject.name}</h3>
                                                            <p className="text-sm text-gray-600">{subject.code}</p>
                                                            <p className="text-sm text-gray-500">Credits: {subject.credits || 3}</p>
                                                        </div>
                                                        <Badge variant="outline" className="border-blue-200 text-blue-800">
                                                            Active
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2 pt-2">
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            className="flex-1"
                                                            onClick={() => handleViewSubjectDetails(subject)}
                                                        >
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View Details
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No subjects found</h3>
                                        <p className="text-gray-600">You're not enrolled in any subjects yet.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Assignments Tab */}
                    <TabsContent value="assignments" className="space-y-6">
                        {/* Assignment Filters */}
                        <Card className="border-0 shadow-md">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    My Assignments
                                </CardTitle>
                                <CardDescription>View and submit your assignments</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="assignment-filter" className="text-sm font-medium text-gray-700">
                                            Filter:
                                        </Label>
                                        <select
                                            id="assignment-filter"
                                            className="px-3 py-2 border border-gray-200 rounded-md focus:border-black focus:ring-black"
                                        >
                                            <option value="all">All Assignments</option>
                                            <option value="pending">Pending</option>
                                            <option value="submitted">Submitted</option>
                                            <option value="graded">Graded</option>
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <Input
                                            placeholder="Search assignments..."
                                            className="border-gray-200 focus:border-black focus:ring-black"
                                        />
                                    </div>
                                    <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
                                        <Filter className="h-4 w-4 mr-2" />
                                        Filter
                                    </Button>
                                </div>

                                {/* Assignment Categories */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <Card className="border border-orange-200 bg-orange-50">
                                        <CardContent className="p-4 text-center">
                                            <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                                            <div className="text-2xl font-bold text-orange-600">{stats.pendingAssignments}</div>
                                            <p className="text-sm text-orange-800 font-medium">Pending</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="border border-green-200 bg-green-50">
                                        <CardContent className="p-4 text-center">
                                            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                            <div className="text-2xl font-bold text-green-600">{stats.completedAssignments}</div>
                                            <p className="text-sm text-green-800 font-medium">Submitted</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="border border-blue-200 bg-blue-50">
                                        <CardContent className="p-4 text-center">
                                            <Award className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                            <div className="text-2xl font-bold text-blue-600">
                                                {stats.gradedAssignments}
                                            </div>
                                            <p className="text-sm text-blue-800 font-medium">Graded</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Assignment List */}
                                {assignments.length > 0 ? (
                                    <div className="space-y-4">
                                        {assignments.map((assignment, index) => (
                                            <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
                                                <CardContent className="p-6">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-black text-lg mb-2">
                                                                {assignment.title || `Assignment ${index + 1}`}
                                                            </h3>
                                                            <p className="text-gray-600 mb-2">{assignment.description || 'No description available'}</p>
                                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                                <span className="flex items-center gap-1">
                                                                    <BookOpen className="h-4 w-4" />
                                                                    {assignment.Subject?.name || assignment.subject || 'Subject'}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="h-4 w-4" />
                                                                    Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <User className="h-4 w-4" />
                                                                    {assignment.Teacher?.name || 'Teacher'}
                                                                </span>
                                                            </div>

                                                            {/* Assignment Attachment */}
                                                            {assignment.fileUrl && (
                                                                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                                    <div className="flex items-center gap-2">
                                                                        <FileText className="h-4 w-4 text-blue-600" />
                                                                        <span className="text-sm font-medium text-blue-800">Question Paper / Assignment File</span>
                                                                    </div>
                                                                    <div className="mt-2">
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="border-blue-300 text-blue-700 hover:bg-blue-100"
                                                                            onClick={() => window.open(config.getFileUrl(assignment.fileUrl), '_blank')}
                                                                        >
                                                                            <Download className="h-4 w-4 mr-1" />
                                                                            Download Question Paper
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Student Submission Status */}
                                                            {assignment.submitted && assignment.submissionId && (
                                                                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                                        <span className="text-sm font-medium text-green-800">Your Submission</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="border-green-300 text-green-700 hover:bg-green-100"
                                                                            onClick={() => handleViewSubmission(assignment.submissionId)}
                                                                        >
                                                                            <Eye className="h-4 w-4 mr-1" />
                                                                            View My Submission
                                                                        </Button>
                                                                        {assignment.graded && (
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="border-blue-300 text-blue-700 hover:bg-blue-100"
                                                                                onClick={() => handleViewGradedSubmission(assignment.submissionId)}
                                                                            >
                                                                                <FileText className="h-4 w-4 mr-1" />
                                                                                View Graded File
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <Badge variant="outline" className={
                                                            assignment.graded ? 'border-blue-200 text-blue-800' :
                                                                assignment.submitted ? 'border-green-200 text-green-800' :
                                                                    'border-orange-200 text-orange-800'
                                                        }>
                                                            {assignment.graded ? 'Graded' : assignment.submitted ? 'Submitted' : 'Pending'}
                                                        </Badge>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="border-gray-200 hover:bg-gray-50"
                                                            onClick={() => handleViewAssignmentDetails(assignment)}
                                                        >
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View Details
                                                        </Button>
                                                        {!assignment.submitted && (
                                                            <Button
                                                                size="sm"
                                                                className="bg-black hover:bg-gray-800 text-white"
                                                                onClick={() => handleSubmitAssignment(assignment.id, assignment.title)}
                                                            >
                                                                <Upload className="h-4 w-4 mr-2" />
                                                                Submit
                                                            </Button>
                                                        )}
                                                        {assignment.submitted && (
                                                            <Badge className="bg-green-100 text-green-800 border-green-200">
                                                                ✓ Submitted
                                                            </Badge>
                                                        )}
                                                        {assignment.graded && assignment.grade != null && (
                                                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                                                Grade: {assignment.grade}%
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No assignments available</h3>
                                        <p className="text-gray-600 mb-6">Check back later for new assignments from your teachers</p>
                                        <Button
                                            onClick={() => setActiveTab('subjects')}
                                            className="bg-black hover:bg-gray-800 text-white"
                                        >
                                            <BookOpen className="h-4 w-4 mr-2" />
                                            View Subjects
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Grades Tab */}
                    <TabsContent value="grades" className="space-y-6">
                        {/* Grade Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="border-0 shadow-md">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">Overall CGPA</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-blue-600 mb-2">
                                        {stats.cgpa > 0 ? stats.cgpa.toFixed(2) : 'N/A'}
                                    </div>
                                    <p className="text-sm text-gray-600">Out of 10.0</p>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-md">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">Average Score</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-green-600 mb-2">
                                        {stats.averageGrade > 0 ? `${stats.averageGrade.toFixed(1)}%` : 'N/A'}
                                    </div>
                                    <p className="text-sm text-gray-600">Overall percentage</p>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-md">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">Graded Items</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-purple-600 mb-2">
                                        {stats.gradedAssignments}
                                    </div>
                                    <p className="text-sm text-gray-600">Assignments graded</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Detailed Grades */}
                        <Card className="border-0 shadow-md">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="h-5 w-5" />
                                    Grade Details
                                </CardTitle>
                                <CardDescription>Your performance by subject and assignment</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Filter Options */}
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor="grade-filter" className="text-sm font-medium text-gray-700">
                                                Filter by Subject:
                                            </Label>
                                            <select
                                                id="grade-filter"
                                                className="px-3 py-2 border border-gray-200 rounded-md focus:border-black focus:ring-black"
                                            >
                                                <option value="all">All Subjects</option>
                                                {subjects.map((subject) => (
                                                    <option key={subject.id} value={subject.id}>
                                                        {subject.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
                                            <Download className="h-4 w-4 mr-2" />
                                            Export Grades
                                        </Button>
                                    </div>

                                    {/* Grades List */}
                                    {submissions.filter(s => s.score != null && s.graded).length > 0 ? (
                                        <div className="space-y-3">
                                            {submissions.filter(s => s.score != null && s.graded).map((submission, index) => (
                                                <Card key={index} className="border border-gray-200">
                                                    <CardContent className="p-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <h4 className="font-medium text-black">
                                                                    {(submission as any).Assignment?.title || submission.assignmentId || `Assignment ${index + 1}`}
                                                                </h4>
                                                                <p className="text-sm text-gray-600">
                                                                    {(submission as any).Subject?.name || submission.subjectId || 'Subject'} • {submission.submissionDate ? new Date(submission.submissionDate).toLocaleDateString() : 'Recently'}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <Badge className={
                                                                    (submission.score != null && submission.score >= 90) ? 'bg-green-100 text-green-800 border-green-200' :
                                                                        (submission.score != null && submission.score >= 80) ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                                                            (submission.score != null && submission.score >= 70) ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                                                (submission.score != null && submission.score >= 60) ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                                                                    'bg-red-100 text-red-800 border-red-200'
                                                                }>
                                                                    {submission.score != null ? `${submission.score}%` : 'Not Graded'}
                                                                </Badge>
                                                                <Badge variant="outline" className="border-gray-200 text-gray-600">
                                                                    {submission.letterGrade || (submission.score != null ? (
                                                                        submission.score >= 90 ? 'A+' :
                                                                        submission.score >= 85 ? 'A' :
                                                                            submission.score >= 80 ? 'A-' :
                                                                                submission.score >= 75 ? 'B+' :
                                                                                    submission.score >= 70 ? 'B' :
                                                                                        submission.score >= 65 ? 'B-' :
                                                                                            submission.score >= 60 ? 'C+' :
                                                                                                submission.score >= 55 ? 'C' :
                                                                                                    submission.score >= 50 ? 'C-' :
                                                                                                        'F'
                                                                    ) : 'N/A')}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        {submission.feedback && (
                                                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                                <p className="text-sm text-gray-700">
                                                                    <strong>Feedback:</strong> {submission.feedback}
                                                                </p>
                                                            </div>
                                                        )}
                                                        
                                                        {/* Graded File Section */}
                                                        {submission.gradedFileUrl && (
                                                            <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                                        <div>
                                                                            <p className="text-sm font-medium text-green-800">Graded File Available</p>
                                                                            <p className="text-xs text-green-600">
                                                                                View your graded submission with teacher feedback and corrections
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="border-green-300 text-green-700 hover:bg-green-100"
                                                                            onClick={() => window.open(submission.gradedFileUrl, '_blank')}
                                                                        >
                                                                            <Download className="h-4 w-4 mr-1" />
                                                                            Download
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="border-green-300 text-green-700 hover:bg-green-100"
                                                                            onClick={() => handleViewGradedSubmission(submission.id)}
                                                                        >
                                                                            <Eye className="h-4 w-4 mr-1" />
                                                                            View Feedback
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        
                                                        {/* Original Submission File */}
                                                        {submission.fileUrl && (
                                                            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <FileText className="h-4 w-4 text-blue-600" />
                                                                        <div>
                                                                            <p className="text-sm font-medium text-blue-800">Your Original Submission</p>
                                                                            <p className="text-xs text-blue-600">
                                                                                {submission.fileUrl.split('/').pop() || 'Your submitted file'}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="border-blue-300 text-blue-700 hover:bg-blue-100"
                                                                        onClick={() => window.open(config.getFileUrl(submission.fileUrl || ''), '_blank')}
                                                                    >
                                                                        <Download className="h-4 w-4 mr-1" />
                                                                        Download
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No grades available yet</h3>
                                            <p className="text-gray-600 mb-6">Your grades will appear here once your assignments are graded</p>
                                            <Button
                                                onClick={() => setActiveTab('assignments')}
                                                className="bg-black hover:bg-gray-800 text-white"
                                            >
                                                <FileText className="h-4 w-4 mr-2" />
                                                View Assignments
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Web3 Rewards Tab */}
                    <TabsContent value="rewards" className="space-y-6">
                        <StudentWeb3Rewards />
                    </TabsContent>

                    {/* Profile Tab */}
                    <TabsContent value="profile" className="space-y-6">
                        {/* Profile Header */}
                        <Card className="border-0 shadow-md">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                        {(student?.name || currentUser?.name || 'S').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-black mb-1">
                                            {student?.name || currentUser?.name || 'Student'}
                                        </h2>
                                        <p className="text-gray-600 mb-2">{student?.id || currentUser?.id || 'Student ID'}</p>
                                        <Badge className="bg-green-100 text-green-800 border-green-200">
                                            Active Student
                                        </Badge>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        className="border-gray-200 hover:bg-gray-50"
                                        onClick={() => handlePasswordReset()}
                                    >
                                        <User className="h-4 w-4 mr-2" />
                                        Reset Password
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Profile Information */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="border-0 shadow-md">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Personal Information
                                    </CardTitle>
                                    <CardDescription>Your basic profile details</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {student ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Student ID
                                                    </label>
                                                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border">
                                                        {student.id}
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Full Name
                                                    </label>
                                                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border">
                                                        {student.name}
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Email Address
                                                    </label>
                                                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border">
                                                        {student.email}
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Section
                                                    </label>
                                                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border">
                                                        {student.section || 'Not assigned'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
                                            <p className="text-gray-500">Loading profile information...</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-md">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <GraduationCap className="h-5 w-5" />
                                        Academic Information
                                    </CardTitle>
                                    <CardDescription>Your academic details and progress</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Batch
                                            </label>
                                            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border">
                                                {student?.batch || 'Not assigned'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Enrolled Subjects
                                            </label>
                                            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border">
                                                {stats.totalSubjects} subjects
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Current GPA
                                            </label>
                                            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border">
                                                {stats.averageGrade > 0 ? (stats.averageGrade / 20).toFixed(2) : 'N/A'} / 5.0
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Assignments Completed
                                            </label>
                                            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border">
                                                {stats.completedAssignments} completed
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Stats */}
                        <Card className="border-0 shadow-md">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Quick Statistics
                                </CardTitle>
                                <CardDescription>Your academic performance at a glance</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                        <div className="text-2xl font-bold text-blue-600">{stats.totalSubjects}</div>
                                        <p className="text-sm text-blue-800">Subjects</p>
                                    </div>

                                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                                        <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                        <div className="text-2xl font-bold text-green-600">{stats.completedAssignments}</div>
                                        <p className="text-sm text-green-800">Completed</p>
                                    </div>

                                    <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                                        <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                                        <div className="text-2xl font-bold text-orange-600">{stats.pendingAssignments}</div>
                                        <p className="text-sm text-orange-800">Pending</p>
                                    </div>

                                    <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                                        <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                                        <div className="text-2xl font-bold text-purple-600">
                                            {stats.averageGrade > 0 ? `${stats.averageGrade.toFixed(0)}%` : 'N/A'}
                                        </div>
                                        <p className="text-sm text-purple-800">Average</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Account Settings */}
                        <Card className="border-0 shadow-md">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Account Settings
                                </CardTitle>
                                <CardDescription>Manage your account preferences</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <Button variant="outline" className="w-full justify-start border-gray-200 hover:bg-gray-50">
                                        <User className="h-4 w-4 mr-2" />
                                        Update Profile Information
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start border-gray-200 hover:bg-gray-50">
                                        <User className="h-4 w-4 mr-2" />
                                        Change Password
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start border-gray-200 hover:bg-gray-50">
                                        <Download className="h-4 w-4 mr-2" />
                                        Download Academic Records
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Submission Modal */}
            <Dialog open={submissionModal.open} onOpenChange={(open) => 
                setSubmissionModal(prev => ({ ...prev, open }))
            }>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Submit Assignment</DialogTitle>
                        <DialogDescription>
                            Submit your work for: {submissionModal.assignmentTitle}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="submission-text">Your Submission</Label>
                            <textarea
                                id="submission-text"
                                className="w-full min-h-[120px] p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your assignment submission here..."
                                value={submissionText}
                                onChange={(e) => setSubmissionText(e.target.value)}
                            />
                        </div>
                        
                        {/* File Upload Section */}
                        <div className="grid gap-2">
                            <Label>Upload File (Optional)</Label>
                            <FileUpload
                                onFileSelect={setSubmissionFile}
                                allowedTypes={['pdf', 'doc', 'docx', 'txt']}
                                maxSizeInMB={10}
                            />
                            {submissionFile && (
                                <div className="text-sm text-gray-600 mt-2">
                                    Selected file: {submissionFile.name}
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setSubmissionModal({ open: false, assignmentId: null, assignmentTitle: "" })}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmissionSubmit}
                            disabled={submitting || (!submissionText.trim() && !submissionFile)}
                            className="bg-black hover:bg-gray-800 text-white"
                        >
                            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {submitting ? 'Submitting...' : 'Submit Assignment'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Submission Modal */}
            <Dialog open={viewSubmissionModal.open} onOpenChange={(open) => 
                setViewSubmissionModal(prev => ({ ...prev, open }))
            }>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Your Submission Details</DialogTitle>
                        <DialogDescription>
                            View your submitted work and details
                        </DialogDescription>
                    </DialogHeader>
                    {viewSubmissionModal.submission && (
                        <div className="grid gap-4 py-4">
                            {/* Assignment Info */}
                            <div className="grid gap-2">
                                <Label className="font-medium">Assignment</Label>
                                <p className="text-sm text-gray-600">
                                    {viewSubmissionModal.submission.title || 'Assignment'}
                                </p>
                            </div>

                            {/* Submission Date */}
                            <div className="grid gap-2">
                                <Label className="font-medium">Submitted On</Label>
                                <p className="text-sm text-gray-600">
                                    {viewSubmissionModal.submission.submittedAt 
                                        ? new Date(viewSubmissionModal.submission.submittedAt).toLocaleString()
                                        : 'Date not available'
                                    }
                                </p>
                            </div>

                            {/* Text Submission */}
                            {viewSubmissionModal.submission.submissionText && (
                                <div className="grid gap-2">
                                    <Label className="font-medium">Text Submission</Label>
                                    <div className="p-3 bg-gray-50 rounded-lg border max-h-40 overflow-y-auto">
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                            {viewSubmissionModal.submission.submissionText}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* File Submission */}
                            {viewSubmissionModal.submission.fileUrl && (
                                <div className="grid gap-2">
                                    <Label className="font-medium">File Submission</Label>
                                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-blue-600" />
                                                <div>
                                                    <p className="text-sm font-medium text-blue-800">
                                                        {viewSubmissionModal.submission.fileName || 'Submitted File'}
                                                    </p>
                                                    <p className="text-xs text-blue-600">
                                                        Click to open your submission
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-blue-300 text-blue-700 hover:bg-blue-100"
                                                onClick={() => window.open(config.getFileUrl(viewSubmissionModal.submission?.fileUrl || ''), '_blank')}
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                Open File
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Grade Info */}
                            {viewSubmissionModal.submission.grade !== null && viewSubmissionModal.submission.grade !== undefined && (
                                <div className="grid gap-2">
                                    <Label className="font-medium">Grade</Label>
                                    <div className="flex items-center gap-2">
                                        <Badge className={
                                            viewSubmissionModal.submission.grade >= 90 ? 'bg-green-100 text-green-800 border-green-200' :
                                            viewSubmissionModal.submission.grade >= 80 ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                            viewSubmissionModal.submission.grade >= 70 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                            viewSubmissionModal.submission.grade >= 60 ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                            'bg-red-100 text-red-800 border-red-200'
                                        }>
                                            {viewSubmissionModal.submission.grade}%
                                        </Badge>
                                    </div>
                                </div>
                            )}

                            {/* Feedback */}
                            {viewSubmissionModal.submission.feedback && (
                                <div className="grid gap-2">
                                    <Label className="font-medium">Teacher Feedback</Label>
                                    <div className="p-3 bg-gray-50 rounded-lg border">
                                        <p className="text-sm text-gray-700">
                                            {viewSubmissionModal.submission.feedback}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setViewSubmissionModal({ open: false, submission: null })}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default StudentPortal;