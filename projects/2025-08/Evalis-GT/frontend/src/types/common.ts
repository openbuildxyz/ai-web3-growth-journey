// Alert state type
export interface AlertState {
  open: boolean;
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error';
}

// Submission data type
export interface SubmissionData {
  subjectId: string;
  examTypeId: string;
  title: string;
  description: string;
  file: File;
  dueDate?: string;
} 