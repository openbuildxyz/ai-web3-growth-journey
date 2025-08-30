const admin = require('firebase-admin');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

// Initialize Firebase Admin SDK
let firebaseInitialized = false;

if (!admin.apps.length) {
  try {
    // First try to load from service account JSON file
    const serviceAccountPath = path.join(__dirname, '../../Firebase Admin SDK.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      console.log('Loading Firebase Admin SDK from service account file...');
      const serviceAccount = require(serviceAccountPath);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
      });
      
      console.log('✓ Firebase Admin SDK initialized successfully with service account file');
      console.log(`✓ Project: ${serviceAccount.project_id}`);
      console.log(`✓ Client Email: ${serviceAccount.client_email}`);
      firebaseInitialized = true;
    }
    // Fallback to environment variables
    else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      // Skip initialization if using placeholder values
      if (process.env.FIREBASE_CLIENT_EMAIL.includes('your-service-account-email') || 
          process.env.FIREBASE_CLIENT_EMAIL.includes('firebase-adminsdk-xxxxx')) {
        console.log('⚠️  Placeholder Firebase credentials detected. Skipping Firebase Admin SDK initialization.');
      } else {
        console.log('Initializing Firebase Admin SDK with environment variables');
      
        // Format the private key correctly if it exists
        const privateKey = process.env.FIREBASE_PRIVATE_KEY ? 
          process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : 
          undefined;
        
        try {
          admin.initializeApp({
            credential: admin.credential.cert({
              type: "service_account",
              project_id: process.env.FIREBASE_PROJECT_ID,
              private_key: privateKey,
              client_email: process.env.FIREBASE_CLIENT_EMAIL,
            })
          });
          console.log('✓ Firebase Admin SDK initialized successfully with env variables');
          firebaseInitialized = true;
        } catch (certError) {
          console.error('Error creating credential certificate:', certError);
          throw certError;
        }
      }
    } else {
      console.log('⚠️  Firebase Admin SDK credentials not found');
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
  }
  
  if (!firebaseInitialized) {
    console.warn('⚠️ Running without Firebase Admin SDK functionality');
  } else {
    // Test Firebase connection
    admin.auth().listUsers(1)
      .then(() => {
        console.log('✅ Firebase Admin SDK connection test successful');
      })
      .catch(error => {
        console.error('❌ Firebase Admin SDK connection test failed:', error);
        firebaseInitialized = false;
      });
  }
}

/**
 * Create a new user in Firebase Authentication
 * @param {string} email - User's email
 * @param {string} password - Initial password
 * @param {Object} userData - Additional user data
 * @returns {Promise<Object>} - Firebase user record
 */
const createFirebaseUser = async (email, password, userData = {}) => {
  if (!firebaseInitialized) {
    console.error('Firebase Admin SDK not initialized, cannot create user');
    return {
      success: false,
      error: 'Firebase Admin SDK not initialized'
    };
  }
  
  try {
    // Create user with email and password
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: userData.name,
      disabled: false,
    });

    // Set custom claims if needed (role-based access)
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: userData.role || 'student',
      userId: userData.id
    });

    console.log(`✓ Firebase user created successfully: ${userRecord.uid} for ${email}`);
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

/**
 * Generate custom password reset link using Admin SDK
 * @param {string} email - User's email
 * @returns {Promise<Object>} - Password reset link result
 */
const generatePasswordResetLink = async (email) => {
  if (!firebaseInitialized) {
    console.error('Firebase Admin SDK not initialized, cannot generate password reset link');
    return {
      success: false,
      error: 'Firebase Admin SDK not initialized'
    };
  }
  
  try {
    const link = await admin.auth().generatePasswordResetLink(email);
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

/**
 * Get Firebase user by email
 * @param {string} email - User's email
 * @returns {Promise<Object|null>} - Firebase user record or null if not found
 */
const getFirebaseUserByEmail = async (email) => {
  if (!firebaseInitialized) {
    console.error('Firebase Admin SDK not initialized, cannot get user');
    return null;
  }
  
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log(`✓ Found Firebase user by email: ${email} (UID: ${userRecord.uid})`);
    return userRecord;
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.log(`No Firebase user found with email: ${email}`);
      return null;
    }
    console.error('Error getting Firebase user by email:', error);
    throw error;
  }
};

/**
 * Delete a Firebase user by email
 * This function removes the user from Firebase Authentication completely,
 * preventing them from logging in to the dashboard
 * @param {string} email - User's email
 * @returns {Promise<Object>} - Success status with details
 */
const deleteFirebaseUserByEmail = async (email) => {
  if (!firebaseInitialized) {
    console.error('Firebase Admin SDK not initialized, cannot delete user');
    return { 
      success: false, 
      error: 'Firebase Admin SDK not initialized',
      details: 'User will remain in Firebase Authentication'
    };
  }
  
  try {
    console.log(`🔍 Searching for Firebase user with email: ${email}`);
    
    // First get the user by email to find their UID
    const userRecord = await getFirebaseUserByEmail(email);
    
    if (!userRecord) {
      console.log(`ℹ️  No Firebase user found with email ${email} - nothing to delete`);
      return { 
        success: true, 
        message: 'No Firebase user found to delete',
        details: 'User was not in Firebase Authentication'
      };
    }
    
    console.log(`🗑️  Deleting Firebase user: ${email} (UID: ${userRecord.uid})`);
    
    // Delete the user using their UID - this completely removes them from Firebase Auth
    await admin.auth().deleteUser(userRecord.uid);
    
    console.log(`✅ Successfully deleted Firebase user: ${email} (UID: ${userRecord.uid})`);
    console.log(`🔒 User ${email} can no longer log in to the dashboard`);
    
    return { 
      success: true, 
      message: 'Firebase user deleted successfully',
      details: `User ${email} removed from Firebase Authentication and can no longer log in`,
      deletedUid: userRecord.uid
    };
  } catch (error) {
    console.error(`❌ Error deleting Firebase user by email (${email}):`, error);
    return { 
      success: false, 
      error: error.message,
      details: `Failed to remove user from Firebase Authentication - they may still be able to log in`
    };
  }
};

/**
 * Delete a Firebase user by UID
 * @param {string} uid - Firebase user ID
 * @returns {Promise<void>}
 */
const deleteFirebaseUser = async (uid) => {
  if (!firebaseInitialized) {
    console.error('Firebase Admin SDK not initialized, cannot delete user');
    throw new Error('Firebase Admin SDK not initialized');
  }
  
  try {
    await admin.auth().deleteUser(uid);
    console.log(`✅ Successfully deleted Firebase user with UID: ${uid}`);
  } catch (error) {
    console.error('Error deleting Firebase user:', error);
    throw error;
  }
};

/**
 * Update Firebase user information
 * @param {string} uid - Firebase user ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} - Updated user record
 */
const updateFirebaseUser = async (uid, updateData) => {
  if (!firebaseInitialized) {
    console.error('Firebase Admin SDK not initialized, cannot update user');
    throw new Error('Firebase Admin SDK not initialized');
  }
  
  try {
    if (!uid) {
      throw new Error('User ID (uid) is required for update');
    }
    
    const userRecord = await admin.auth().updateUser(uid, updateData);
    console.log(`Successfully updated Firebase user: ${userRecord.uid}`);
    return userRecord;
  } catch (error) {
    console.error('Error updating Firebase user:', error);
    throw error;
  }
};

module.exports = {
  createFirebaseUser,
  generatePasswordResetLink,
  getFirebaseUserByEmail,
  deleteFirebaseUser,
  deleteFirebaseUserByEmail,
  updateFirebaseUser,
  admin
};
