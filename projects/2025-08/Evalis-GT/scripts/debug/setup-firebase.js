#!/usr/bin/env node

/**
 * Firebase Admin SDK Setup Helper
 * 
 * This script helps you set up Firebase Admin SDK credentials.
 * Run with: node setup-firebase.js path/to/your/service-account.json
 */

const fs = require('fs');
const path = require('path');

function setupFirebaseCredentials(serviceAccountPath) {
  try {
    if (!fs.existsSync(serviceAccountPath)) {
      console.error('❌ Service account file not found:', serviceAccountPath);
      console.log('\n📋 To get your service account file:');
      console.log('1. Go to https://console.firebase.google.com/');
      console.log('2. Select your project (evalis-d16f2)');
      console.log('3. Go to Project Settings > Service Accounts');
      console.log('4. Click "Generate new private key"');
      console.log('5. Download the JSON file');
      console.log('6. Run: node setup-firebase.js path/to/downloaded/file.json');
      return;
    }

    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    
    // Validate required fields
    const requiredFields = ['project_id', 'client_email', 'private_key'];
    const missingFields = requiredFields.filter(field => !serviceAccount[field]);
    
    if (missingFields.length > 0) {
      console.error('❌ Missing required fields in service account:', missingFields);
      return;
    }

    // Format private key for .env file (escape newlines)
    const privateKey = serviceAccount.private_key.replace(/\n/g, '\\n');
    
    const envContent = `# Firebase Admin SDK Configuration
# Generated from service account: ${path.basename(serviceAccountPath)}
# Generated on: ${new Date().toISOString()}

FIREBASE_PROJECT_ID=${serviceAccount.project_id}
FIREBASE_CLIENT_EMAIL=${serviceAccount.client_email}
FIREBASE_PRIVATE_KEY="${privateKey}"

# Other environment variables
NODE_ENV=development
`;

    // Write to .env file
    fs.writeFileSync('.env', envContent);
    
    console.log('✅ Firebase credentials configured successfully!');
    console.log('📁 Updated .env file with:');
    console.log(`   - Project ID: ${serviceAccount.project_id}`);
    console.log(`   - Client Email: ${serviceAccount.client_email}`);
    console.log(`   - Private Key: [CONFIGURED]`);
    console.log('\n🚀 You can now restart your server.');
    
  } catch (error) {
    console.error('❌ Error setting up Firebase credentials:', error.message);
  }
}

// Check if service account path is provided
const serviceAccountPath = process.argv[2];

if (!serviceAccountPath) {
  console.log('🔧 Firebase Admin SDK Setup Helper');
  console.log('');
  console.log('Usage: node setup-firebase.js <path-to-service-account.json>');
  console.log('');
  console.log('📋 To get your service account file:');
  console.log('1. Go to https://console.firebase.google.com/');
  console.log('2. Select your project (evalis-d16f2)');
  console.log('3. Go to Project Settings > Service Accounts');
  console.log('4. Click "Generate new private key"');
  console.log('5. Download the JSON file');
  console.log('6. Run: node setup-firebase.js path/to/downloaded/file.json');
  console.log('');
  console.log('Alternative: Place the JSON file in project root as "firebase-admin-sdk.json"');
} else {
  setupFirebaseCredentials(serviceAccountPath);
}
