# Firebase Admin SDK Setup Guide

Your project supports **3 different methods** to set up Firebase Admin SDK:

## Method 1: Service Account JSON File (Simplest - Your Snippet Approach)

1. **Download your service account key:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select project: `evalis-d16f2`
   - Go to **Project Settings** → **Service Accounts**
   - Click **"Generate new private key"**
   - Download the JSON file

2. **Place the file in your project root** with one of these names:
   ```
   firebase-admin-sdk.json
   evalis-firebase-admin-sdk.json
   Evalis Firebase Admin SDK.json
   ```

3. **Use the simple Firebase setup:**
   ```javascript
   const { admin, getAuth } = require('./server/utils/simpleFirebase');
   
   // Firebase is auto-initialized when you import the module
   const auth = getAuth();
   ```

## Method 2: Environment Variables

1. **Get your service account JSON** (same as Method 1)

2. **Run the setup helper:**
   ```bash
   node setup-firebase.js path/to/your/downloaded-file.json
   ```

3. **Your existing firebaseUtils.js will work automatically**

## Method 3: Manual Environment Variables

Add to your `.env` file:
```env
FIREBASE_PROJECT_ID=evalis-d16f2
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@evalis-d16f2.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

## Current Status

- ✅ Client-side Firebase (browser) is configured
- ⚠️  Server-side Firebase Admin SDK needs credentials
- ✅ Multiple setup methods available
- ✅ Setup helper script created

## Files Created/Updated

- `setup-firebase.js` - Helper script for easy setup
- `server/utils/simpleFirebase.js` - Simple JSON-based setup (your snippet approach)
- `server/utils/firebaseExample.js` - Usage examples
- `.env.example` - Template for environment variables

## Choose Your Method

**Recommended:** Method 1 (JSON file) - It's the simplest and matches your snippet exactly!
