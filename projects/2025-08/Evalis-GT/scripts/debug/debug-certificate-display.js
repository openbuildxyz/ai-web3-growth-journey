#!/usr/bin/env node

/**
 * Debug NFT Certificate Display Issue
 * This script helps diagnose why certificates aren't showing up in the student portal
 */

const axios = require('axios');

const API_BASE = process.env.API_BASE || 'http://localhost:3000';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`${title}`, 'cyan');
  log(`${'='.repeat(60)}`, 'cyan');
}

async function checkDatabaseCertificates() {
  logSection('CHECKING DATABASE FOR CERTIFICATES');
  
  try {
    // Test the API endpoints
    log('\n🔍 Testing certificate API endpoints...', 'blue');
    
    // Check health endpoint first
    try {
      const healthResponse = await axios.get(`${API_BASE}/api/health`, { timeout: 5000 });
      log(`✅ Server is running (${healthResponse.status})`, 'green');
    } catch (error) {
      log(`❌ Server appears to be down: ${error.message}`, 'red');
      return;
    }
    
    // Test the web3 certificates endpoint (without auth for now)
    try {
      log('\n📊 Testing certificate endpoints...', 'blue');
      
      // This will likely fail due to auth, but we can see the error type
      const testResponse = await axios.get(`${API_BASE}/api/web3/student/1/certificates`, {
        timeout: 5000,
        validateStatus: () => true // Accept any status
      });
      
      log(`Certificate endpoint status: ${testResponse.status}`, 'yellow');
      
      if (testResponse.status === 401) {
        log('✅ Endpoint exists (requires authentication)', 'green');
      } else if (testResponse.status === 404) {
        log('❌ Certificate endpoint not found', 'red');
      } else if (testResponse.status === 200) {
        log('✅ Endpoint working (unexpected - no auth provided)', 'green');
        log(`Response: ${JSON.stringify(testResponse.data, null, 2)}`, 'blue');
      } else {
        log(`⚠️  Unexpected status: ${testResponse.status}`, 'yellow');
        log(`Response: ${JSON.stringify(testResponse.data, null, 2)}`, 'blue');
      }
      
    } catch (error) {
      log(`❌ Error testing certificate endpoint: ${error.message}`, 'red');
    }
    
  } catch (error) {
    log(`❌ Failed to check database: ${error.message}`, 'red');
  }
}

async function analyzeStudentPortalIssue() {
  logSection('ANALYZING STUDENT PORTAL CERTIFICATE ISSUE');
  
  log('\n🔍 Potential Issues:', 'blue');
  log('1. No certificates have been awarded yet', 'yellow');
  log('2. Student is not logged in or wallet not connected', 'yellow');
  log('3. Certificate API endpoint authentication issues', 'yellow');
  log('4. Certificate database records missing or malformed', 'yellow');
  log('5. Frontend not calling the correct API endpoint', 'yellow');
  log('6. Certificate service import/export issues', 'yellow');
  
  log('\n📋 Certificate Flow Analysis:', 'blue');
  log('Student Portal → StudentWeb3Rewards.tsx → getMyCertificates() → API /web3/student/:id/certificates', 'cyan');
  
  log('\n🎯 Debugging Steps:', 'blue');
  log('1. Check if any student has actually received a certificate (score ≥80%)', 'yellow');
  log('2. Verify student authentication and ID retrieval', 'yellow');
  log('3. Test certificate API endpoint with valid auth token', 'yellow');
  log('4. Check browser network tab for API calls and responses', 'yellow');
  log('5. Verify Certificate model and database schema', 'yellow');
  
  log('\n🔧 Quick Fixes to Try:', 'blue');
  log('• Check browser console for JavaScript errors', 'green');
  log('• Verify student is logged in with valid session', 'green');
  log('• Test grading a submission with 85% to trigger certificate', 'green');
  log('• Check network tab during page load for failed API calls', 'green');
  log('• Verify environment variables for blockchain connectivity', 'green');
}

async function generateTestCertificateData() {
  logSection('SAMPLE CERTIFICATE DATA FOR TESTING');
  
  const sampleCertificate = {
    id: 1,
    studentId: 123,
    submissionId: 456,
    tokenId: '1',
    contractAddress: '0x8f907106a386aF9b9a3a7A3bF74BbBa45fdEc5a0',
    transactionHash: '0x1234567890abcdef...',
    metadata: {
      name: 'Evalis Achievement Certificate',
      description: 'NFT certificate for exceptional academic achievement',
      image: 'https://your-domain.com/public/nft-badges/nft_certificate.jpeg',
      attributes: [
        { trait_type: 'Student Name', value: 'Test Student' },
        { trait_type: 'Assignment', value: 'Mathematics Quiz' },
        { trait_type: 'Score', value: '85%' },
        { trait_type: 'Grade Tier', value: 'Gold' },
        { trait_type: 'Issue Date', value: '2024-01-15' }
      ]
    },
    issuedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  log('\n📄 Sample certificate data structure:', 'blue');
  log(JSON.stringify(sampleCertificate, null, 2), 'cyan');
  
  log('\n💡 To test certificate display:', 'blue');
  log('1. Create a test submission with grade ≥80%', 'yellow');
  log('2. Ensure student has connected wallet', 'yellow');
  log('3. Grade the submission to trigger automatic certificate', 'yellow');
  log('4. Check student portal for certificate display', 'yellow');
}

async function checkBrowserDebugging() {
  logSection('BROWSER DEBUGGING CHECKLIST');
  
  log('\n🌐 Browser Console Debugging:', 'blue');
  log('1. Open student portal and check browser console for errors', 'yellow');
  log('2. Look for failed API calls in Network tab', 'yellow');
  log('3. Check if getMyCertificates() is being called', 'yellow');
  log('4. Verify authentication token is present in requests', 'yellow');
  
  log('\n📱 Local Storage Debugging:', 'blue');
  log('• Check localStorage for currentUser data', 'green');
  log('• Verify auth token is stored correctly', 'green');
  log('• Confirm student ID is available', 'green');
  
  log('\n🔍 React Component Debugging:', 'blue');
  log('• Add console.log() in StudentWeb3Rewards.tsx', 'green');
  log('• Log the certificates array length', 'green');
  log('• Check if fetchRewardsData() is completing successfully', 'green');
  
  log('\n📡 API Response Debugging:', 'blue');
  log('• Use browser dev tools to inspect /web3/student/:id/certificates response', 'green');
  log('• Check response status and payload', 'green');
  log('• Verify authentication headers are included', 'green');
}

async function main() {
  log('🔍 Debugging NFT Certificate Display Issue', 'cyan');
  log('The student portal shows "No Certificates Yet" even with certificates implemented.\n', 'yellow');
  
  await checkDatabaseCertificates();
  await analyzeStudentPortalIssue();
  await generateTestCertificateData();
  await checkBrowserDebugging();
  
  logSection('CONCLUSION');
  log('\n🎯 Most Likely Issues:', 'blue');
  log('1. No student has earned a certificate yet (no 80%+ grades)', 'red');
  log('2. Student authentication/wallet connection issue', 'red');
  log('3. API endpoint authentication failing', 'red');
  
  log('\n🚀 Next Steps:', 'green');
  log('1. Test grade a submission with 85% to trigger certificate awarding', 'yellow');
  log('2. Check browser console and network tab during certificate fetch', 'yellow');
  log('3. Verify student login and wallet connection status', 'yellow');
  log('4. Test the certificate API endpoint directly', 'yellow');
}

if (require.main === module) {
  main().catch(error => {
    log(`❌ Fatal error: ${error.message}`, 'red');
    process.exit(1);
  });
}
