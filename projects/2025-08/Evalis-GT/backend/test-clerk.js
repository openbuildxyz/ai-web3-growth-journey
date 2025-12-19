const { clerkClient } = require('@clerk/express');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env.development') });
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function testClerkIntegration() {
  console.log('Testing Clerk integration...');
  console.log('CLERK_SECRET_KEY present:', !!process.env.CLERK_SECRET_KEY);
  console.log('CLERK_SECRET_KEY (first 10 chars):', process.env.CLERK_SECRET_KEY?.substring(0, 10));

  try {
    // Test 1: List existing users
    console.log('\n1. Testing user list...');
    const users = await clerkClient.users.getUserList({ limit: 5 });
    console.log(`Found ${users.length} existing users in Clerk`);
    
    if (users.length > 0) {
      console.log('Sample user:', {
        id: users[0].id,
        email: users[0].emailAddresses?.[0]?.emailAddress,
        firstName: users[0].firstName,
        lastName: users[0].lastName
      });
    }

    // Test 2: Try to create a test user
    console.log('\n2. Testing user creation...');
    const testEmail = `test-${Date.now()}@example.com`;
    
    try {
      const newUser = await clerkClient.users.createUser({
        emailAddress: [testEmail],
        firstName: 'Test',
        lastName: 'User',
        username: `testuser${Date.now()}`, // Add username as required
        skipPasswordChecks: true,
        skipPasswordRequirement: true
      });
      
      console.log('✅ User created successfully:', {
        id: newUser.id,
        email: newUser.emailAddresses?.[0]?.emailAddress,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      });

      // Clean up - delete the test user
      try {
        await clerkClient.users.deleteUser(newUser.id);
        console.log('✅ Test user cleaned up');
      } catch (deleteError) {
        console.log('⚠️ Could not delete test user:', deleteError.message);
      }

    } catch (createError) {
      console.log('❌ User creation failed:', createError.message);
      console.log('Error details:', createError);
    }

  } catch (error) {
    console.error('❌ Clerk API error:', error.message);
    console.error('Error details:', error);
  }
}

testClerkIntegration().catch(console.error);
