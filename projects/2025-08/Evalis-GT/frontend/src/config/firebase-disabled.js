// This file is kept for backwards compatibility but Firebase functionality has been removed
// All authentication is now handled by Clerk

// Placeholder functions to prevent import errors
export const auth = null;
export const db = null;
export const storage = null;
export const app = null;

// Deprecated functions - these will no longer work and should be replaced with Clerk
export const loginWithEmailAndPassword = async (email, password) => {
  throw new Error('Firebase authentication has been removed. Please use Clerk authentication.');
};

export const registerWithEmailAndPassword = async (email, password) => {
  throw new Error('Firebase authentication has been removed. Please use Clerk authentication.');
};

export const sendPasswordReset = async (email) => {
  throw new Error('Firebase authentication has been removed. Please use Clerk authentication.');
};

export const logoutUser = async () => {
  throw new Error('Firebase authentication has been removed. Please use Clerk authentication.');
};

export const getCurrentUser = () => {
  return null;
};

// Default export for compatibility
export default {
  auth,
  db,
  storage,
  app,
  loginWithEmailAndPassword,
  registerWithEmailAndPassword,
  sendPasswordReset,
  logoutUser,
  getCurrentUser
};
