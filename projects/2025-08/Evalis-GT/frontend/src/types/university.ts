export interface Student {
  id: string;
  name: string;
  section: string;
  batch?: string;
  email?: string;
  role?: string;
  initialPassword?: string;
  firebaseUid?: string;
}

export interface Subject {
  id: string;
  name: string;
  section?: string;
  description?: string;
  credits?: number;
  semesterId?: string;
  batchId?: string;
  Batch?: any;
  Semester?: any;
  code?: string; // optional shorthand code used in UI
  instructor?: string; // optional instructor name populated client-side
}

export interface StudentSubmission {
  id: string;
  studentId: string;
  subjectId: string;
  subjectName: string;
  examType: string;
  submissionText: string;
  submissionDate: string;
  score?: number;
  plagiarismScore: number;
  feedback: string;
  graded: boolean;
  gradedBy: string | null;
  gradedDate: string | null;
  // Additional fields for enhanced functionality
  title?: string;
  subject?: string;
  submittedAt?: string;
  status?: 'pending' | 'submitted' | 'graded';
  grade?: number;
  letterGrade?: string;
  gradePoints?: number;
  assignmentId?: string;
  filePath?: string;
  fileName?: string;
  fileUrl?: string;
  gradedFileUrl?: string;
  annotations?: string;
}

export interface Batch {
  subjects: Subject[];
  students: Student[];
}

export interface BatchData {
  [key: string]: Batch;
}

export interface GradeRange {
  min: number;
  max: number;
  points: number;
}

export interface GradeScale {
  [key: string]: GradeRange;
}

export interface ExamType {
  id: string;
  name: string;
}

export interface ExamTypes {
  [key: string]: ExamType;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  initialPassword?: string;
  password?: string;
  role?: string;
  clerkId?: string;
  Subjects?: Subject[]; // For when populated from backend
} 