// Test authentication for debugging the 401 errors
// This script can be run in the browser console to check auth state

console.log('=== Authentication Debug Test ===');

// Check localStorage contents
const tokenStorageKey = 'userToken';
const userStorageKey = 'currentUser';

const token = localStorage.getItem(tokenStorageKey);
const currentUser = localStorage.getItem(userStorageKey);

console.log('1. Storage Check:');
console.log('   Token exists:', !!token);
console.log('   User data exists:', !!currentUser);

if (currentUser) {
  try {
    const userData = JSON.parse(currentUser);
    console.log('2. User Data:');
    console.log('   Role:', userData.role);
    console.log('   Has token property:', !!userData.token);
    console.log('   Token matches storage:', userData.token === token);
    
    if (userData.token && !token) {
      console.log('3. Fixing token mismatch...');
      localStorage.setItem(tokenStorageKey, userData.token);
      console.log('   Token restored to storage');
    }
  } catch (e) {
    console.error('Error parsing user data:', e);
  }
}

// Test API call with current auth
const testApiCall = async () => {
  try {
    const currentToken = localStorage.getItem(tokenStorageKey);
    if (!currentToken) {
      console.log('4. API Test: No token available for testing');
      return;
    }
    
    console.log('4. Testing API call with token...');
    
    const response = await fetch('http://localhost:3001/api/teachers', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      }
    });
    
    console.log('   Response status:', response.status);
    
    if (response.status === 401) {
      console.log('   ❌ Authentication failed - token may be expired');
    } else if (response.ok) {
      console.log('   ✅ Authentication successful');
    } else {
      console.log('   ⚠️  Other error:', response.statusText);
    }
    
  } catch (error) {
    console.error('   Error testing API:', error);
  }
};

// Run the test
testApiCall();

// Helper function to manually restore auth
window.restoreAuth = () => {
  const userData = localStorage.getItem(userStorageKey);
  if (userData) {
    try {
      const user = JSON.parse(userData);
      if (user.token) {
        localStorage.setItem(tokenStorageKey, user.token);
        console.log('Authentication manually restored');
        return true;
      }
    } catch (e) {
      console.error('Error restoring auth:', e);
    }
  }
  console.log('Could not restore authentication');
  return false;
};

console.log('=== Debug test complete ===');
console.log('Run window.restoreAuth() to manually fix token issues');
