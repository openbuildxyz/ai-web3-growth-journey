# Firebase to Clerk Migration Guide

## Overview
This project is migrating from Firebase Authentication to Clerk for improved developer experience and better user management.

## What's Been Done

### 1. Dependencies Added
- **Frontend**: `@clerk/clerk-react` 
- **Backend**: `@clerk/express`

### 2. Environment Setup
Add these variables to your `.env.local` file:
```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_ZW5vdWdoLW1hcnRlbi01MC5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_uw1aDt1T4Osw1A6PMgLyRGjCcVNNKPh4mWXNuuZw0v
```

### 3. Frontend Changes
- **ClerkProvider** wrapped around the app in `src/main.tsx`
- **ClerkAuthBridge** component bridges Clerk tokens to existing localStorage system
- **ClerkAuth** component added to Login page for testing
- Existing Firebase auth remains functional during transition

### 4. Backend Changes
- **Auth middleware** updated to check Clerk tokens first, then fallback to Firebase/JWT
- **Clerk utilities** added for token verification and user mapping
- Users are mapped by email to existing Student/Teacher/Admin records

## Migration Strategy

### Phase 1: Parallel Authentication (Current)
- Both Firebase and Clerk work simultaneously
- New users can sign up with Clerk
- Existing users continue with Firebase
- All users mapped by email to database records

### Phase 2: User Migration (Next Steps)
1. Export existing Firebase users
2. Import them into Clerk (preserving emails)
3. Update password reset flows
4. Test all auth flows

### Phase 3: Firebase Removal (Final)
1. Remove Firebase dependencies
2. Clean up Firebase-specific code
3. Update all auth flows to use Clerk only

## Testing

### Current State
1. Start the development server: `npm run dev`
2. Go to `/login` page
3. You should see both:
   - New Clerk auth buttons at the top
   - Existing Firebase/JWT login forms below

### Clerk Test Flow
1. Click "Sign Up with Clerk"
2. Create account with an email that exists in your database
3. The system should automatically map you to the correct role (Student/Teacher/Admin) based on email
4. You should be able to access the appropriate portal

## Database User Mapping

Users are mapped by email address:
- **Admin**: Checks `Admin` table first
- **Teacher**: Checks `Teacher` table second  
- **Student**: Checks `Student` table last

The system maintains compatibility with existing role-based route protection.

## Next Steps

1. Test Clerk authentication with existing database users
2. Configure Clerk organization settings if needed
3. Set up password policies and user management
4. Plan migration of existing Firebase users
5. Update deployment environment variables

## Troubleshooting

### Clerk Authentication Issues
- Check that `CLERK_SECRET_KEY` is set in server environment
- Verify `VITE_CLERK_PUBLISHABLE_KEY` is available in frontend
- Check browser console for token sync issues

### User Mapping Issues
- Ensure user exists in database with the same email as Clerk account
- Check server logs for user mapping errors
- Verify database connection is working

### Token Bridge Issues
- Check localStorage for `userToken` and `currentUser` keys
- Verify ClerkAuthBridge is running (no visible UI, runs in background)
- Check network tab for API calls with Authorization headers
