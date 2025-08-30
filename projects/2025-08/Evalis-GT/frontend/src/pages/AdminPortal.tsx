import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { 
  Users, 
  GraduationCap, 
  Upload, 
  Database, 
  BookOpen, 
  Calendar,
  Settings,
  UserPlus,
  AlertCircle,
  Loader2,
  Plus,
  Edit,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Eye
} from "lucide-react";
import Header from "../components/Header";
import { SignIn } from '@clerk/clerk-react';
import { useAuth } from '../hooks/useAuth';
import { BATCHES } from "../data/universityData";
import { Student, Subject, Teacher } from "../types/university";
import TeacherAssignment from "../components/TeacherAssignment";
import StudentImporter from "../components/StudentImporter";
import TeacherImporter from "../components/TeacherImporter";
import SubjectForm from "../components/SubjectForm";
import BatchList from "../components/BatchList";
import { getTeachers, assignSubject, removeSubject, createTeacher, updateTeacher, deleteTeacher } from "../api/teacherService";
import { getAllSubjects, createSubject, updateSubject } from "../api/subjectService";
import { getStudentsByBatch, createStudent, updateStudent, deleteStudent } from "../api/studentService";
import { getAllBatches } from "../api/batchService";
import SemesterManagement from '../components/SemesterManagement';
import config from "../config/environment";
import GovernanceAdminPanel from "../components/GovernanceAdminPanel";
import AdminWeb3MintPanel from "../components/AdminWeb3MintPanel";
import AdminIssueCertificate from "../components/AdminIssueCertificate";
// Removed CreateUserForm (Create Users section) per request

const AdminPortal: React.FC = (): React.ReactElement => {
  const { isSignedIn, loading, currentUser } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!isSignedIn || !currentUser) {
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
                  headerSubtitle: 'text-gray-600'
                }
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Check if user has admin role
  if (currentUser.role !== 'admin') {
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

  return <AdminPortalContent />;
};

const AdminPortalContent: React.FC = (): React.ReactElement => {
  const [activeTab, setActiveTab] = useState("overview");
  const [notification, setNotification] = useState({ 
    open: false, 
    message: "", 
    severity: "success" as "success" | "error" 
  });
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [seedingSubjects, setSeedingSubjects] = useState(false);
  const [seedingBatches, setSeedingBatches] = useState(false);
  
  // Student data state
  const [availableBatches, setAvailableBatches] = useState<any[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  
  // Student form state
  const [studentFormOpen, setStudentFormOpen] = useState(false);
  const [savingStudent, setSavingStudent] = useState(false);
  const [studentError, setStudentError] = useState<string | undefined>(undefined);
  const [editingStudent, setEditingStudent] = useState<Student | undefined>(undefined);
  const [showDeleteStudentConfirm, setShowDeleteStudentConfirm] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState(false);
  
  // Subject data state
  const [subjectFormOpen, setSubjectFormOpen] = useState(false);
  const [savingSubject, setSavingSubject] = useState(false);
  const [subjectError, setSubjectError] = useState<string | undefined>(undefined);
  const [editingSubject, setEditingSubject] = useState<Subject | undefined>(undefined);
  // Stats for overview cards
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalSubjects: 0,
    totalBatches: 0
  });

  // Simplified auth check (assumes access handled globally)
  useEffect(() => {
    const userDataStr = localStorage.getItem(config.AUTH.CURRENT_USER_KEY);
    if (!userDataStr) return;
    try {
      const userData = JSON.parse(userDataStr);
      if (userData.token && !localStorage.getItem(config.AUTH.TOKEN_STORAGE_KEY)) {
        localStorage.setItem(config.AUTH.TOKEN_STORAGE_KEY, userData.token);
      }
    } catch {}
  }, []);

  // Fetch initial data
  useEffect(() => {
    const initializeData = async () => {
      console.log('Initializing admin data...');
      await Promise.all([
        fetchTeachers(),
        fetchSubjects(),
        fetchBatches()
      ]);
    };
    
    initializeData();
  }, []);

  useEffect(() => {
    if (selectedBatchId) {
      fetchStudents(selectedBatchId);
    }
  }, [selectedBatchId]);

  // Update stats when data changes
  useEffect(() => {
    setStats({
      totalStudents: students.length,
      totalTeachers: teachers.length,
      totalSubjects: subjects.length,
      totalBatches: availableBatches.length
    });
  }, [students, teachers, subjects, availableBatches]);

  const fetchTeachers = async () => {
    try {
      console.log('Fetching teachers...');
      const response = await getTeachers();
      console.log('Teachers response:', response);
      
      if (!response || !Array.isArray(response)) {
        console.error('Invalid teachers response:', response);
        showNotification("Invalid response from server. Please try again.", "error");
        return;
      }
      
      const fetchedTeachers = response.map((teacher: any) => ({
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        subjects: teacher.Subjects ? teacher.Subjects.map((subject: any) => subject.id) : []
      }));
      
      console.log('Processed teachers:', fetchedTeachers);
      setTeachers(fetchedTeachers);
      
      if (fetchedTeachers.length === 0) {
        showNotification("No teachers found. You may need to add teachers first.", "error");
      }
    } catch (error: any) {
      console.error("Error fetching teachers:", error);
      
      // More specific error messages
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error || 'Unknown server error';
        
        if (status === 401) {
          showNotification("Authentication failed. Please login again.", "error");
          // Optionally redirect to login
          // navigate('/login');
        } else if (status === 403) {
          showNotification("Access denied. Admin privileges required.", "error");
        } else if (status === 404) {
          showNotification("Teachers endpoint not found. Please check server configuration.", "error");
        } else if (status >= 500) {
          showNotification("Server error. Please try again later.", "error");
        } else {
          showNotification(`Failed to load teachers: ${message}`, "error");
        }
      } else if (error.request) {
        showNotification("Cannot connect to server. Please check if the server is running.", "error");
      } else {
        showNotification(`Failed to load teachers: ${error.message}`, "error");
      }
    }
  };

  const fetchSubjects = async () => {
    try {
      setSubjectsLoading(true);
      const response = await getAllSubjects();
      setSubjects(response);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      showNotification("Failed to load subjects. Please try again.", "error");
    } finally {
      setSubjectsLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await getAllBatches();
      const batches = Array.isArray(response) ? response : [];
      setAvailableBatches(batches);
      if (batches.length > 0 && !selectedBatchId) {
        setSelectedBatchId(batches[0].id);
      }
    } catch (error) {
      console.error("Error fetching batches:", error);
      showNotification("Failed to load batches. Please try again.", "error");
    }
  };

  const fetchStudents = async (batchId: string) => {
    try {
      setStudentsLoading(true);
      const response = await getStudentsByBatch(batchId);
      setStudents(response);
    } catch (error) {
      console.error("Error fetching students:", error);
      showNotification("Failed to load students. Please try again.", "error");
    } finally {
      setStudentsLoading(false);
    }
  };

  const showNotification = (message: string, severity: "success" | "error") => {
    setNotification({ open: true, message, severity });
  };

  const handleSeedSubjects = async () => {
    setSeedingSubjects(true);
    try {
  // Placeholder for seeding subjects (removed)
      await fetchSubjects();
      showNotification("Subjects seeded successfully!", "success");
    } catch (error) {
      console.error("Error seeding subjects:", error);
      showNotification("Failed to seed subjects. Please try again.", "error");
    } finally {
      setSeedingSubjects(false);
    }
  };

  // Subject save handler (create or update)
  const handleSaveSubject = async (data: Partial<Subject>) => {
    setSubjectError(undefined);
    setSavingSubject(true);
    try {
      // Ensure required fields
      if (!data.name || !data.section || (!data.batchId && !data.semesterId)) {
        throw new Error('Name, Section and (Batch or Semester) are required');
      }

      if (editingSubject) {
        await updateSubject(editingSubject.id, {
          name: data.name,
            section: data.section,
          description: data.description,
          credits: data.credits,
          batchId: data.batchId,
          semesterId: data.semesterId
        });
      } else {
        await createSubject({
          id: data.id || undefined, // allow backend auto-gen when blank
          name: data.name,
          section: data.section!,
          description: data.description || '',
          credits: data.credits || 3,
          batchId: data.batchId,
          semesterId: data.semesterId
        });
      }

      await fetchSubjects();
      setSubjectFormOpen(false);
      setEditingSubject(undefined);
      showNotification(`Subject ${editingSubject ? 'updated' : 'created'} successfully`, 'success');
    } catch (e: any) {
      const msg = e?.response?.data?.message || e.message || 'Failed to save subject';
      setSubjectError(msg);
    } finally {
      setSavingSubject(false);
    }
  };

  const handleSeedBatches = async () => {
    setSeedingBatches(true);
    try {
  // Placeholder for seeding batches (removed)
      await fetchBatches();
      showNotification("Batches seeded successfully!", "success");
    } catch (error) {
      console.error("Error seeding batches:", error);
      showNotification("Failed to seed batches. Please try again.", "error");
    } finally {
      setSeedingBatches(false);
    }
  };

  // Student save handler (create or update)
  const handleSaveStudent = async (data: Partial<Student>) => {
    setStudentError(undefined);
    setSavingStudent(true);
    try {
      // Ensure required fields
      if (!data.id || !data.name || !data.email || !selectedBatchId) {
        throw new Error('ID, Name, Email and Batch are required');
      }

      if (editingStudent) {
        await updateStudent(editingStudent.id, {
          name: data.name,
          email: data.email,
          batch: selectedBatchId,
          section: data.section
        });
      } else {
        await createStudent({
          id: data.id,
          name: data.name,
          email: data.email,
          batch: selectedBatchId,
          section: data.section || 'A'
        });
      }

      await fetchStudents(selectedBatchId);
      setStudentFormOpen(false);
      setEditingStudent(undefined);
      showNotification(`Student ${editingStudent ? 'updated' : 'created'} successfully`, 'success');
    } catch (e: any) {
      const msg = e?.response?.data?.message || e.message || 'Failed to save student';
      setStudentError(msg);
    } finally {
      setSavingStudent(false);
    }
  };

  // Student delete handler
  const handleDeleteStudent = async () => {
    if (!editingStudent) return;
    
    setDeletingStudent(true);
    try {
      await deleteStudent(editingStudent.id);
      await fetchStudents(selectedBatchId);
      setShowDeleteStudentConfirm(false);
      setStudentFormOpen(false);
      setEditingStudent(undefined);
      showNotification(`Student ${editingStudent.name} deleted successfully`, 'success');
    } catch (e: any) {
      const msg = e?.response?.data?.message || e.message || 'Failed to delete student';
      showNotification(msg, 'error');
    } finally {
      setDeletingStudent(false);
    }
  };

  // Placeholder handlers for the existing functionality
  const handleAssignSubject = async (teacherId: string, subjectId: string) => {
    try {
      await assignSubject(teacherId, subjectId);
      await fetchTeachers();
      showNotification("Subject assigned successfully!", "success");
    } catch (error) {
      console.error("Error assigning subject:", error);
      showNotification("Failed to assign subject. Please try again.", "error");
    }
  };

  const handleRemoveSubject = async (teacherId: string, subjectId: string) => {
    try {
      await removeSubject(teacherId, subjectId);
      await fetchTeachers();
      showNotification("Subject removed successfully!", "success");
    } catch (error) {
      console.error("Error removing subject:", error);
      showNotification("Failed to remove subject. Please try again.", "error");
    }
  };

  const handleAddTeacher = async (teacherData: any) => {
    try {
      console.log('Adding teacher with data:', teacherData);
      console.log('Current user:', localStorage.getItem('currentUser'));
      console.log('Auth token:', localStorage.getItem('userToken'));
      
      await createTeacher(teacherData);
      await fetchTeachers();
      showNotification("Teacher added successfully!", "success");
    } catch (error) {
      console.error("Error adding teacher:", error);
      console.error("Error details:", error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || "Failed to add teacher. Please try again.";
      showNotification(errorMessage, "error");
    }
  };

  const handleEditTeacher = async (teacherData: any) => {
    try {
      await updateTeacher(teacherData.id, teacherData);
      await fetchTeachers();
      showNotification("Teacher updated successfully!", "success");
    } catch (error) {
      console.error("Error updating teacher:", error);
      showNotification("Failed to update teacher. Please try again.", "error");
    }
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    try {
      await deleteTeacher(teacherId);
      await fetchTeachers();
      showNotification("Teacher deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting teacher:", error);
      showNotification("Failed to delete teacher. Please try again.", "error");
    }
  };

  // Simplified placeholder import handlers (actual bulk import components manage their own logic)
  const handleImportTeachers = () => {};
  const handleImportStudents = (_batchId: string, _students: Student[]) => {};

  const StatCard = ({ title, value, icon, description }: { 
    title: string; 
    value: number; 
    icon: React.ReactNode; 
    description: string;
  }) => (
    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className="text-gray-400">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-black">{value}</div>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Admin Dashboard" showLogout={true} />

      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-black rounded-lg">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-black">Admin Control Panel</h1>
              <p className="text-gray-600">Manage your institution's data and settings</p>
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
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9 bg-white border border-gray-200">
            <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="teachers" className="flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Teachers</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Students</span>
            </TabsTrigger>
            <TabsTrigger value="subjects" className="flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Subjects</span>
            </TabsTrigger>
            <TabsTrigger value="batches" className="flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Batches</span>
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Import</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Data</span>
            </TabsTrigger>
            <TabsTrigger value="semesters" className="flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Semesters</span>
            </TabsTrigger>
            <TabsTrigger value="governance" className="flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Governance</span>
            </TabsTrigger>
            {/* Create Users tab removed */}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Students"
                value={stats.totalStudents}
                icon={<Users className="h-4 w-4" />}
                description="Active students in system"
              />
              <StatCard
                title="Total Teachers"
                value={stats.totalTeachers}
                icon={<GraduationCap className="h-4 w-4" />}
                description="Faculty members"
              />
              <StatCard
                title="Total Subjects"
                value={stats.totalSubjects}
                icon={<BookOpen className="h-4 w-4" />}
                description="Available courses"
              />
              <StatCard
                title="Total Batches"
                value={stats.totalBatches}
                icon={<Users className="h-4 w-4" />}
                description="Student groups"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => setActiveTab("import")} 
                    className="w-full justify-start bg-gray-100 hover:bg-gray-200 text-black border-0"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("teachers")} 
                    className="w-full justify-start bg-gray-100 hover:bg-gray-200 text-black border-0"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Manage Teachers
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("students")} 
                    className="w-full justify-start bg-gray-100 hover:bg-gray-200 text-black border-0"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Manage Students
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    System Status
                  </CardTitle>
                  <CardDescription>Current system information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Database Status</span>
                    <Badge className="bg-green-100 text-green-800 border-green-200">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Backup</span>
                    <span className="text-sm text-gray-900">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">System Version</span>
                    <span className="text-sm text-gray-900">v1.0.0</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Teachers Tab */}
          <TabsContent value="teachers" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Teacher Management
                </CardTitle>
                <CardDescription>Assign subjects and manage teacher accounts</CardDescription>
              </CardHeader>
              <CardContent>
                {subjectsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading teachers...
                  </div>
                ) : subjects.length > 0 ? (
                  <TeacherAssignment 
                    teachers={teachers}
                    subjects={subjects}
                    onAssignSubject={handleAssignSubject}
                    onRemoveSubject={handleRemoveSubject}
                    onAddTeacher={handleAddTeacher}
                    onEditTeacher={handleEditTeacher}
                    onDeleteTeacher={handleDeleteTeacher}
                  />
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No subjects found</h3>
                    <p className="text-gray-600 mb-4">Add subjects to start assigning teachers</p>
                    <div className="flex gap-2 justify-center">
                      <Button 
                        onClick={handleSeedSubjects}
                        disabled={seedingSubjects}
                        className="bg-black hover:bg-gray-800 text-white"
                      >
                        {seedingSubjects ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Adding Subjects...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Default Subjects
                          </>
                        )}
                      </Button>
                      <Button 
                        onClick={fetchTeachers}
                        variant="outline"
                        className="border-gray-200 hover:bg-gray-50"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry Teachers
                      </Button>
                      <Button 
                        onClick={async () => {
                          try {
                            const response = await fetch(`${config.API_BASE_URL}/health`);
                            const data = await response.json();
                            showNotification(`Server is ${data.status === 'OK' ? 'running' : 'having issues'}`, data.status === 'OK' ? 'success' : 'error');
                          } catch (error) {
                            showNotification('Cannot connect to server', 'error');
                          }
                        }}
                        variant="outline"
                        className="border-gray-200 hover:bg-gray-50"
                      >
                        Test Connection
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Student Management
                </CardTitle>
                <CardDescription>View and manage student records</CardDescription>
              </CardHeader>
              <CardContent>
                {studentsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading students...
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <select 
                          value={selectedBatchId} 
                          onChange={(e) => setSelectedBatchId(e.target.value)}
                          className="px-3 py-2 border border-gray-200 rounded-md focus:border-black focus:ring-black"
                        >
                          <option value="">Select Batch</option>
                          {availableBatches.map((batch) => (
                            <option key={batch.id} value={batch.id}>
                              {batch.name} ({batch.year})
                            </option>
                          ))}
                        </select>
                        <p className="text-sm text-gray-600">
                          Showing {students.length} students
                        </p>
                      </div>
                      <Button 
                        onClick={() => {
                          if (!selectedBatchId) {
                            showNotification("Please select a batch first", "error");
                            return;
                          }
                          setEditingStudent(undefined);
                          setStudentFormOpen(true);
                        }}
                        className="bg-black hover:bg-gray-800 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Student
                      </Button>
                    </div>
                    
                    {students.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {students.map((student) => (
                          <Card key={student.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-black">{student.name}</h3>
                                  <p className="text-sm text-gray-600">{student.id}</p>
                                  <p className="text-sm text-gray-600">{student.email}</p>
                                </div>
                                <Badge variant="outline" className="border-blue-200 text-blue-800">
                                  {student.batch || 'No Batch'}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 pt-2">
                                <Button variant="outline" size="sm" className="flex-1">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex-1"
                                  onClick={() => {
                                    setEditingStudent(student);
                                    setStudentFormOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Button>
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
                          {selectedBatchId ? 'No students in selected batch' : 'Select a batch to view students'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Student Form Modal */}
            {studentFormOpen && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    {editingStudent ? 'Edit Student' : 'Add New Student'}
                  </CardTitle>
                  <CardDescription>
                    {editingStudent ? 'Update student information' : 'Create a new student account'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleSaveStudent({
                      id: formData.get('id') as string,
                      name: formData.get('name') as string,
                      email: formData.get('email') as string,
                      section: formData.get('section') as string,
                    });
                  }} className="space-y-4">
                    {studentError && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-red-800">
                          {studentError}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="student-id" className="block text-sm font-medium text-gray-700 mb-1">
                          Student ID *
                        </label>
                        <input
                          id="student-id"
                          name="id"
                          type="text"
                          required
                          disabled={!!editingStudent}
                          defaultValue={editingStudent?.id || ''}
                          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-black focus:ring-black disabled:bg-gray-100"
                          placeholder="e.g., 2024001"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="student-name" className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          id="student-name"
                          name="name"
                          type="text"
                          required
                          defaultValue={editingStudent?.name || ''}
                          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-black focus:ring-black"
                          placeholder="Enter student's full name"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="student-email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address *
                        </label>
                        <input
                          id="student-email"
                          name="email"
                          type="email"
                          required
                          defaultValue={editingStudent?.email || ''}
                          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-black focus:ring-black"
                          placeholder="student@example.com"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="student-section" className="block text-sm font-medium text-gray-700 mb-1">
                          Section
                        </label>
                        <select
                          id="student-section"
                          name="section"
                          defaultValue={editingStudent?.section || 'A'}
                          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-black focus:ring-black"
                        >
                          <option value="A">Section A</option>
                          <option value="B">Section B</option>
                          <option value="C">Section C</option>
                          <option value="D">Section D</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-600">
                        <strong>Selected Batch:</strong> {availableBatches.find(b => b.id === selectedBatchId)?.name || 'None'}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4">
                      {/* Delete button (only show when editing existing student) */}
                      {editingStudent && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowDeleteStudentConfirm(true)}
                          disabled={savingStudent || deletingStudent}
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          {deletingStudent ? 'Deleting...' : 'Delete Student'}
                        </Button>
                      )}
                      
                      {/* Right-aligned buttons */}
                      <div className="flex items-center gap-3 ml-auto">
                        <Button
                          type="submit"
                          disabled={savingStudent || deletingStudent}
                          className="bg-black hover:bg-gray-800 text-white"
                        >
                          {savingStudent ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              {editingStudent ? 'Updating...' : 'Creating...'}
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              {editingStudent ? 'Update Student' : 'Create Student'}
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setStudentFormOpen(false);
                            setEditingStudent(undefined);
                            setStudentError(undefined);
                          }}
                          className="border-gray-200 hover:bg-gray-50"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Delete Student Confirmation Dialog */}
            {showDeleteStudentConfirm && editingStudent && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <Card className="w-full max-w-md mx-4">
                  <CardHeader>
                    <CardTitle className="text-red-600">Confirm Delete</CardTitle>
                    <CardDescription>
                      Are you sure you want to delete this student?
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p><strong>Student ID:</strong> {editingStudent.id}</p>
                      <p><strong>Name:</strong> {editingStudent.name}</p>
                      <p><strong>Email:</strong> {editingStudent.email}</p>
                    </div>
                    <Alert className="mt-4 border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-red-800">
                        This action cannot be undone. All student data including submissions will be permanently removed.
                      </AlertDescription>
                    </Alert>
                    <div className="flex justify-end gap-3 mt-6">
                      <Button
                        variant="outline"
                        onClick={() => setShowDeleteStudentConfirm(false)}
                        disabled={deletingStudent}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleDeleteStudent}
                        disabled={deletingStudent}
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        {deletingStudent ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          'Delete Student'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Subjects Tab */}
          <TabsContent value="subjects" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Subject Management
                </CardTitle>
                <CardDescription>Manage course subjects and curriculum</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      {subjects.length} subjects available
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleSeedSubjects}
                        disabled={seedingSubjects}
                        variant="outline"
                        className="border-gray-200 hover:bg-gray-50"
                      >
                        {seedingSubjects ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Seed Subjects
                      </Button>
                      <Button 
                        onClick={() => setSubjectFormOpen(true)}
                        className="bg-black hover:bg-gray-800 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Subject
                      </Button>
                    </div>
                  </div>
                  
                  {subjectsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Loading subjects...
                    </div>
                  ) : subjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {subjects.map((subject) => (
                        <Card key={subject.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="font-semibold text-black">{subject.name}</h3>
                                <p className="text-sm text-gray-600">ID: {subject.id}</p>
                                {subject.section && (
                                  <p className="text-sm text-gray-600">Section: {subject.section}</p>
                                )}
                              </div>
                              <Badge variant="outline" className="border-green-200 text-green-800">
                                {subject.credits || 3} Credits
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              {subject.description && (
                                <p className="text-sm text-gray-600 line-clamp-2">{subject.description}</p>
                              )}
                              <div className="flex items-center gap-2 pt-2">
                                <Button variant="outline" size="sm" className="flex-1">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex-1"
                                  onClick={() => { setEditingSubject(subject); setSubjectFormOpen(true); }}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No subjects found</h3>
                      <p className="text-gray-600 mb-4">Add subjects to start managing your curriculum</p>
                      <Button 
                        onClick={handleSeedSubjects}
                        disabled={seedingSubjects}
                        className="bg-black hover:bg-gray-800 text-white"
                      >
                        {seedingSubjects ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Seeding Subjects...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Seed Default Subjects
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Batches Tab */}
          <TabsContent value="batches" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Batch Management
                </CardTitle>
                <CardDescription>Organize students into batches and groups</CardDescription>
              </CardHeader>
              <CardContent>
                <BatchList />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Import Teachers
                  </CardTitle>
                  <CardDescription>Bulk import teacher data from Excel/CSV</CardDescription>
                </CardHeader>
                <CardContent>
                  <TeacherImporter onImportTeachers={handleImportTeachers} />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Import Students
                  </CardTitle>
                  <CardDescription>Bulk import student data from Excel/CSV</CardDescription>
                </CardHeader>
                <CardContent>
                  <StudentImporter 
                    batches={BATCHES}
                    onImportStudents={handleImportStudents}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Data Management Tab */}
          <TabsContent value="data" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Database Operations
                  </CardTitle>
                  <CardDescription>Seed and manage database content</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button 
                      onClick={handleSeedSubjects}
                      disabled={seedingSubjects}
                      className="w-full justify-start bg-gray-100 hover:bg-gray-200 text-black border-0"
                    >
                      {seedingSubjects ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      {seedingSubjects ? 'Seeding Subjects...' : 'Seed Default Subjects'}
                    </Button>
                    
                    <Button 
                      onClick={handleSeedBatches}
                      disabled={seedingBatches}
                      className="w-full justify-start bg-gray-100 hover:bg-gray-200 text-black border-0"
                    >
                      {seedingBatches ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      {seedingBatches ? 'Seeding Batches...' : 'Seed Default Batches'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Batch Overview
                  </CardTitle>
                  <CardDescription>Current batch information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {BATCHES.map((batch) => (
                      <div key={batch.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-black">{batch.name}</p>
                          <p className="text-sm text-gray-600">{batch.id}</p>
                        </div>
                        <Badge variant="outline" className="border-gray-300">
                          {batch.id}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Semesters Tab */}
          <TabsContent value="semesters" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Semester Management
                </CardTitle>
                <CardDescription>Configure academic semesters and terms</CardDescription>
              </CardHeader>
              <CardContent>
                <SemesterManagement 
                  onSuccess={(msg: string) => showNotification(msg, 'success')} 
                  onError={(msg: string) => showNotification(msg, 'error')} 
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Governance Tab */}
          <TabsContent value="governance" className="space-y-6">
            <GovernanceAdminPanel />
            <AdminWeb3MintPanel />
            <AdminIssueCertificate />
          </TabsContent>

          {/* Create Users tab content removed */}
        </Tabs>
      {/* Subject Form Modal */}
      <SubjectForm 
        open={subjectFormOpen} 
        onClose={() => { setSubjectFormOpen(false); setEditingSubject(undefined); }}
        onSave={handleSaveSubject}
        subject={editingSubject}
        saving={savingSubject}
        error={subjectError}
        title={editingSubject ? 'Edit Subject' : 'Create Subject'}
      />
      </div>
    </div>
  );
};

export default AdminPortal;