#!/usr/bin/env node

/**
 * Authentication troubleshooting script
 * Run this when experiencing 401 errors with assignment deletion or NFT rewards
 */

console.log('🔍 Evalis Authentication Troubleshooting');
console.log('==========================================\n');

console.log('📋 Common Issues and Solutions:\n');

console.log('1. 401 Unauthorized Errors:');
console.log('   - Check if the teacher is logged in');
console.log('   - Verify token is stored in localStorage');
console.log('   - Ensure server is running on correct port\n');

console.log('2. Token Storage Issues:');
console.log('   - Token should be in localStorage["userToken"]');
console.log('   - User data should be in localStorage["currentUser"]');
console.log('   - Both should contain the same token value\n');

console.log('3. Server Connection:');
console.log('   - Frontend expects server on port 3001');
console.log('   - Check server is running: `npm run server:dev`');
console.log('   - Verify CORS settings allow frontend domain\n');

console.log('4. Browser Debug Steps:');
console.log('   - Open browser console on teacher portal');
console.log('   - Run: localStorage.getItem("userToken")');
console.log('   - Run: localStorage.getItem("currentUser")');
console.log('   - Check network tab for API calls and responses\n');

console.log('5. Quick Fixes:');
console.log('   - Refresh the page to restore auth state');
console.log('   - Log out and log back in');
console.log('   - Clear browser localStorage and login again\n');

console.log('6. Advanced Debugging:');
console.log('   - Copy and run the debug script: debug-auth.js');
console.log('   - Check server logs for authentication middleware errors');
console.log('   - Verify JWT token hasn\'t expired\n');

console.log('🔧 Server Commands:');
console.log('   Start server: npm run server:dev');
console.log('   Start frontend: npm run dev');
console.log('   View logs: check terminal running the server\n');

console.log('📞 If issues persist:');
console.log('   1. Check server terminal for error messages');
console.log('   2. Verify environment variables are set correctly');
console.log('   3. Ensure database connection is working');
console.log('   4. Check if JWT_SECRET is configured\n');

console.log('✅ This script completed. Check the steps above to resolve 401 errors.');
