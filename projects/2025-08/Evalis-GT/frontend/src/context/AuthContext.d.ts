interface User {
  id: number | string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
  token: string;
  [key: string]: any;
}

export interface AuthContextType {
  currentUser: User | null;
  firebaseUser: any | null;
  loading: boolean;
  error: string | null;
  login: (identifier: string, password: string) => Promise<User>;
  studentLogin: (studentId: string, password: string) => Promise<User>;
  teacherLogin: (email: string, password: string) => Promise<User>;
  adminLogin: (username: string, password: string) => Promise<User>;
  logout: () => void;
  updateUser: (userData: User | null) => void; // Updated to accept null for clearing user state
  setupTeacherPassword: (email: string, currentPassword: string, newPassword: string) => Promise<User>;
  requestPasswordReset: (email: string) => Promise<void>;
}

export function useAuth(): AuthContextType;
export function AuthProvider(props: { children: React.ReactNode }): JSX.Element; 