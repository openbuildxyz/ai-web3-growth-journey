// Server-side & client Firebase configuration that works locally and on Vercel.
// Supports providing service account via environment variable (JSON or base64) to avoid bundling file.
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const {
  initializeApp: initializeClientApp,
} = require('firebase/app');
const {
  getAuth: getClientAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} = require('firebase/auth');
const path = require('path');
const fs = require('fs');

// --- Service Account Loading Strategy ---
// Priority:
// 1. FIREBASE_SERVICE_ACCOUNT_JSON (raw JSON string)
// 2. FIREBASE_SERVICE_ACCOUNT_B64 (base64 string of JSON)
// 3. FIREBASE_PRIVATE_KEY_B64 (base64 string of JSON - alternative name)
// 4. Local file (Firebase Admin SDK.json) – dev only
let serviceAccount = null;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    console.log('✓ Firebase service account loaded from FIREBASE_SERVICE_ACCOUNT_JSON');
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_B64) {
    const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64, 'base64').toString('utf8');
    serviceAccount = JSON.parse(decoded);
    console.log('✓ Firebase service account loaded from FIREBASE_SERVICE_ACCOUNT_B64');
  } else if (process.env.FIREBASE_PRIVATE_KEY_B64) {
    const decoded = Buffer.from(process.env.FIREBASE_PRIVATE_KEY_B64, 'base64').toString('utf8');
    serviceAccount = JSON.parse(decoded);
    console.log('✓ Firebase service account loaded from FIREBASE_PRIVATE_KEY_B64');
  } else {
    const serviceAccountPath = path.join(__dirname, '../../Firebase Admin SDK.json');
    if (fs.existsSync(serviceAccountPath)) {
      serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      console.log('✓ Firebase service account loaded from local file');
    } else {
      console.warn('⚠ No Firebase service account provided (env or file). Admin features limited.');
    }
  }
} catch (e) {
  console.error('❌ Failed to parse Firebase service account:', e.message);
}

// --- Admin SDK Initialization ---
let adminApp, adminAuth;
try {
  if (serviceAccount) {
    adminApp = initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID,
    });
    adminAuth = getAuth(adminApp);
    console.log('✓ Firebase Admin SDK initialized');
  }
} catch (e) {
  console.error('❌ Error initializing Firebase Admin SDK:', e.message);
}

// --- Client SDK Configuration ---
// Prefer env (so production values can differ). Fallback to previously hard coded dev config.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyDOyFOhXSYbtWrFCZMBwsF-7upRxYRlE9k",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "evalis-d16f2.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "evalis-d16f2",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "evalis-d16f2.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "993676113888",
  appId: process.env.FIREBASE_APP_ID || "1:993676113888:web:21e93b506a90e0544e5d85",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-CHPDVY165C"
};

let clientApp, clientAuth;
try {
  clientApp = initializeClientApp(firebaseConfig);
  clientAuth = getClientAuth(clientApp);
} catch (e) {
  console.error('❌ Failed to initialize client Firebase SDK:', e.message);
}

// Authentication helper functions using client SDK (for verification)
const loginWithEmailAndPassword = async (email, password) => {
  try {
  if (!clientAuth) throw new Error('Client Firebase auth not initialized');
  return await signInWithEmailAndPassword(clientAuth, email, password);
  } catch (error) {
    console.error("Firebase authentication error:", error.code, error.message);
    
    // Provide more helpful error messages based on the error code
    if (error.code === 'auth/invalid-credential') {
      throw new Error('Invalid email or password. Please check your credentials and try again.');
    } else if (error.code === 'auth/user-not-found') {
      throw new Error('No account found with this email. Please register first.');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password. Please try again.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed login attempts. Please try again later or reset your password.');
    } else {
      throw error;
    }
  }
};

// Use Admin SDK for creating users (server-side only)
const createFirebaseUser = async (email, password, displayName = null) => {
  try {
    if (!adminAuth) {
      throw new Error('Firebase Admin SDK not initialized');
    }

    const userRecord = await adminAuth.createUser({
      email: email,
      password: password,
      displayName: displayName,
      emailVerified: false
    });

    console.log('✓ Firebase user created successfully:', userRecord.uid);
    return {
      success: true,
      uid: userRecord.uid,
      email: userRecord.email
    };
  } catch (error) {
    console.error('Error creating Firebase user:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Generate custom password reset link using Admin SDK
const generatePasswordResetLink = async (email) => {
  try {
    if (!adminAuth) {
      throw new Error('Firebase Admin SDK not initialized');
    }

    const link = await adminAuth.generatePasswordResetLink(email);
    console.log('✓ Password reset link generated successfully for:', email);
    return {
      success: true,
      resetLink: link
    };
  } catch (error) {
    console.error('Error generating password reset link:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

const registerWithEmailAndPassword = async (email, password) => {
  if (!clientAuth) throw new Error('Client Firebase auth not initialized');
  return await createUserWithEmailAndPassword(clientAuth, email, password);
};

const sendPasswordReset = async (email) => {
  try {
  if (!clientAuth) throw new Error('Client Firebase auth not initialized');
  await sendPasswordResetEmail(clientAuth, email);
    return { 
      success: true, 
      message: "Password reset email sent successfully" 
    };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return {
      success: false,
      message: error.message || "Failed to send password reset email"
    };
  }
};

module.exports = {
  app: clientApp,
  auth: clientAuth,
  adminApp,
  adminAuth,
  loginWithEmailAndPassword,
  registerWithEmailAndPassword,
  createFirebaseUser,
  generatePasswordResetLink,
  sendPasswordReset
};