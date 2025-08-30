// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  User,
  UserCredential
} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDOyFOhXSYbtWrFCZMBwsF-7upRxYRlE9k",
  authDomain: "evalis-d16f2.firebaseapp.com",
  projectId: "evalis-d16f2",
  storageBucket: "evalis-d16f2.firebasestorage.app",
  messagingSenderId: "993676113888",
  appId: "1:993676113888:web:21e93b506a90e0544e5d85",
  measurementId: "G-CHPDVY165C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// Authentication helper functions
export const loginWithEmailAndPassword = async (
  email: string, 
  password: string
): Promise<UserCredential> => {
  console.log('Firebase login attempt with:', { email });
  
  // Trim any whitespace from email to prevent formatting issues
  const trimmedEmail = email.trim();
  
  try {
    return await signInWithEmailAndPassword(auth, trimmedEmail, password);
  } catch (error: any) {
    console.error('Firebase login error:', error.code, error.message);
    throw error;
  }
};

export const registerWithEmailAndPassword = async (
  email: string, 
  password: string
): Promise<UserCredential> => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

export const sendPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { 
      success: true, 
      message: "Password reset email sent successfully" 
    };
  } catch (error: any) {
    const errorMessage = error.message || "Failed to send password reset email";
    return {
      success: false,
      message: errorMessage
    };
  }
};

export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export { auth, analytics };
export default app; 