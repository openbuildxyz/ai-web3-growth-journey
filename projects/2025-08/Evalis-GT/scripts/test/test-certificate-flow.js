#!/usr/bin/env node

/**
 * Test Certificate Creation and Display
 * This script helps test the complete certificate flow from creation to display
 */

const axios = require('axios');

const API_BASE = process.env.API_BASE || 'http://localhost:3000';

// Test data
const TEST_DATA = {
  teacher: {
    email: 'teacher@test.com',
    password: 'password123',
    name: 'Test Teacher'
  },
  student: {
    email: 'student@test.com', 
    password: 'password123',
    name: 'Test Student',
    walletAddress: '0x742d35Cc6634C0532925a3b8D9D96d8c4b7B45e1' // Sample wallet
  },
  assignment: {
    title: 'Mathematics Test',
    description: 'Basic mathematics assessment',
    subject: 'Mathematics'
  },
  submission: {
    text: 'This is my excellent submission with detailed mathematical solutions.',
    grade: 85 // This should trigger certificate awarding
  }
};

// Color codes
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

async function checkServerStatus() {
  logSection('CHECKING SERVER STATUS');
  
  try {
    const response = await axios.get(`${API_BASE}/api/health`, { timeout: 5000 });
    log(`✅ Server is running (${response.status})`, 'green');
    return true;
  } catch (error) {
    log(`❌ Server is not running: ${error.message}`, 'red');
    log('💡 Please start the server first:', 'yellow');
    log('   npm run dev  (or)  npm start', 'yellow');
    return false;
  }
}

async function simulateCertificateFlow() {
  logSection('SIMULATING CERTIFICATE FLOW');
  
  log('\n📋 Certificate Flow Steps:', 'blue');
  log('1. 🎓 Student submits assignment', 'yellow');
  log('2. 👨‍🏫 Teacher grades with 85% (Gold tier)', 'yellow');
  log('3. ⚡ System automatically awards certificate (score ≥80%)', 'yellow');
  log('4. 💾 Certificate saved to database', 'yellow');
  log('5. 🖥️  Student portal displays certificate', 'yellow');
  
  log('\n🔧 Manual Testing Steps:', 'blue');
  log('To test the certificate system manually:', 'cyan');
  log('', '');
  log('1. Start the server:', 'green');
  log('   npm run dev', 'yellow');
  log('', '');
  log('2. Login as a teacher:', 'green');
  log('   - Go to /teacher/login', 'yellow');
  log('   - Create an assignment', 'yellow');
  log('', '');
  log('3. Login as a student:', 'green');
  log('   - Go to /student/login', 'yellow');
  log('   - Connect wallet (use MetaMask test wallet)', 'yellow');
  log('   - Submit assignment', 'yellow');
  log('', '');
  log('4. Grade the submission as teacher:', 'green');
  log('   - Go to Teacher Portal > Grading tab', 'yellow');
  log('   - Enter grade ≥80% (e.g., 85%)', 'yellow');
  log('   - Click "Submit Grade"', 'yellow');
  log('   - Should see "Badge + NFT" indicator', 'yellow');
  log('', '');
  log('5. Check student portal:', 'green');
  log('   - Go to Student Portal', 'yellow');
  log('   - Look for "NFT Achievement Certificates" section', 'yellow');
  log('   - Should show the awarded certificate', 'yellow');
}

async function checkCertificateDatabase() {
  logSection('CHECKING CERTIFICATE DATABASE');
  
  log('\n🗄️  Database Table: certificates', 'blue');
  log('Expected columns:', 'yellow');
  log('- id (primary key)', 'cyan');
  log('- studentId (foreign key)', 'cyan');
  log('- submissionId (foreign key)', 'cyan');
  log('- tokenId (NFT token ID)', 'cyan');
  log('- contractAddress (smart contract)', 'cyan');
  log('- transactionHash (blockchain tx)', 'cyan');
  log('- metadata (JSON with certificate details)', 'cyan');
  log('- createdAt, updatedAt (timestamps)', 'cyan');
  
  log('\n💡 To check database manually:', 'blue');
  log('1. Connect to your database', 'yellow');
  log('2. Run: SELECT * FROM certificates;', 'yellow');
  log('3. Check if any records exist', 'yellow');
  log('4. If empty, no certificates have been awarded yet', 'yellow');
}

async function debugCertificateAPI() {
  logSection('DEBUGGING CERTIFICATE API');
  
  log('\n🔍 API Endpoints to Check:', 'blue');
  log('1. GET /api/web3/student/:studentId/certificates', 'yellow');
  log('   - Fetches student certificates', 'cyan');
  log('   - Used by student portal', 'cyan');
  log('', '');
  log('2. POST /api/web3/award/badge/:submissionId', 'yellow');
  log('   - Awards badges and auto-certificates', 'cyan');
  log('   - Called when grading with score ≥75%', 'cyan');
  log('', '');
  log('3. POST /api/web3/award/certificate/manual/:submissionId', 'yellow');
  log('   - Manual certificate awarding', 'cyan');
  log('   - Called by teacher manual award button', 'cyan');
  
  log('\n🌐 Frontend Components:', 'blue');
  log('• StudentWeb3Rewards.tsx', 'green');
  log('  - Displays certificates in student portal', 'cyan');
  log('  - Calls getMyCertificates() from studentService', 'cyan');
  log('', '');
  log('• TeacherPortal.tsx', 'green');
  log('  - Shows certificate award options', 'cyan');
  log('  - Auto-awards for ≥80%, manual for others', 'cyan');
}

async function provideSolutions() {
  logSection('SOLUTIONS FOR CERTIFICATE DISPLAY ISSUE');
  
  log('\n🎯 Most Likely Causes:', 'blue');
  log('1. ❌ No certificates awarded yet', 'red');
  log('   → Grade a submission with ≥80% to trigger certificate', 'green');
  log('', '');
  log('2. ❌ Student wallet not connected', 'red');
  log('   → Student must connect wallet before receiving certificates', 'green');
  log('', '');
  log('3. ❌ API authentication issues', 'red');
  log('   → Check browser console for 401/403 errors', 'green');
  log('', '');
  log('4. ❌ Database connection problems', 'red');
  log('   → Check server logs for database errors', 'green');
  
  log('\n🚀 Quick Fix Steps:', 'blue');
  log('1. Start server and open browser dev tools', 'yellow');
  log('2. Login as student and go to portal', 'yellow');
  log('3. Check console for certificate fetch errors', 'yellow');
  log('4. Check Network tab for API call responses', 'yellow');
  log('5. If no errors, create test submission and grade it ≥80%', 'yellow');
  
  log('\n🔧 Development Testing:', 'blue');
  log('For testing in development:', 'cyan');
  log('• Use test wallet: 0x742d35Cc6634C0532925a3b8D9D96d8c4b7B45e1', 'green');
  log('• Set up Sepolia testnet in MetaMask', 'green');
  log('• Use grades: 85% (Gold), 90% (Platinum), 95% (Diamond)', 'green');
  log('• Check both automatic and manual certificate awarding', 'green');
}

async function main() {
  log('🎓 NFT Certificate Display Debugging Tool', 'cyan');
  log('Helping diagnose why certificates aren\'t showing in student portal\n', 'yellow');
  
  const serverRunning = await checkServerStatus();
  
  if (!serverRunning) {
    log('\n⚠️  Server must be running to test certificates properly.', 'yellow');
    log('Start the server first, then run this script again.', 'yellow');
  }
  
  await simulateCertificateFlow();
  await checkCertificateDatabase();
  await debugCertificateAPI();
  await provideSolutions();
  
  logSection('NEXT ACTIONS');
  log('\n📝 Immediate Steps:', 'blue');
  log('1. Start server if not running', 'yellow');
  log('2. Open browser dev tools', 'yellow');
  log('3. Test grading a submission with 85%', 'yellow');
  log('4. Check student portal certificates section', 'yellow');
  log('5. Look for console errors or API failures', 'yellow');
  
  log('\n💡 Remember:', 'green');
  log('Certificates only appear after:', 'cyan');
  log('• Student connects wallet ✅', 'yellow');
  log('• Submission graded ≥80% ✅', 'yellow');
  log('• Blockchain transaction succeeds ✅', 'yellow');
  log('• Database record created ✅', 'yellow');
}

if (require.main === module) {
  main().catch(error => {
    log(`❌ Error: ${error.message}`, 'red');
    process.exit(1);
  });
}
