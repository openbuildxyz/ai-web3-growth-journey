# Firebase Password Reset Guide

## The Problem
When you reset your password using Firebase's "Forgot Password" feature, it updates your password in Firebase Auth but not in our database. This can cause login issues where you get "Invalid password" errors even with the correct new password.

## The Solution
We've implemented a hybrid authentication system that handles both scenarios:

### For Teachers:
1. **After resetting password via Firebase email:**
   - Use your new password to log in normally
   - The system will first try database authentication
   - If that fails, it will try Firebase authentication
   - If Firebase succeeds, it will automatically sync your password to our database
   - Future logins will work with either method

### For Students:
- Students should use their student ID and database password
- If you need to reset a student password, contact an admin

## How It Works:

### Login Flow:
1. **Database First**: System tries to authenticate against our database
2. **Firebase Fallback**: If database auth fails, tries Firebase authentication
3. **Auto-Sync**: If Firebase succeeds, syncs the password to database for future logins

### Password Reset Flow:
1. User clicks "Forgot Password" → Firebase sends reset email
2. User resets password via Firebase email link
3. User logs in with new password
4. System detects Firebase auth success and syncs to database
5. Future logins work with either authentication method

## For Developers:

### Key Files Modified:
- `server/controllers/authController.js` - Enhanced teacher authentication
- `server/config/firebase.js` - Server-side Firebase client config
- `server/routes/authRoutes.js` - Added password sync endpoint
- `src/context/AuthContext.jsx` - Enhanced frontend auth flow

### New Endpoints:
- `POST /api/auth/sync-firebase-password` - Syncs Firebase password to database

### Authentication Methods:
- **Database Auth**: Uses bcrypt to compare hashed passwords
- **Firebase Auth**: Uses Firebase client SDK for authentication
- **Hybrid Auth**: Tries database first, falls back to Firebase

## Testing:
1. Create a teacher account
2. Reset password via Firebase
3. Login with new password
4. Verify both authentication methods work

## Troubleshooting:
- If login still fails after password reset, check server logs
- Ensure Firebase configuration is correct on both client and server
- Verify the main server (port 3000) is running, not just admin server (port 5003)