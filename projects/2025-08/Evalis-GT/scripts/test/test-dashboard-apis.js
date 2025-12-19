#!/usr/bin/env node

/**
 * Test Certificate and Subject APIs
 * Tests both certificate fetching and subject fetching for student dashboard
 */

const axios = require('axios');

const API_BASE = process.env.API_BASE || 'http://localhost:3000';

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

async function testEndpointsWithoutAuth() {
  logSection('TESTING API ENDPOINTS (WITHOUT AUTH)');
  
  const endpoints = [
    { url: '/api/health', name: 'Health Check', expectStatus: 200 },
    { url: '/api/students/subjects', name: 'Student Subjects', expectStatus: 401 },
    { url: '/api/web3/student/1/certificates', name: 'Student Certificates', expectStatus: 401 }
  ];
  
  for (const endpoint of endpoints) {
    try {
      log(`\n🔍 Testing: ${endpoint.name}`, 'blue');
      const response = await axios.get(`${API_BASE}${endpoint.url}`, {
        timeout: 5000,
        validateStatus: () => true // Accept any status
      });
      
      if (response.status === endpoint.expectStatus) {
        log(`✅ ${endpoint.name}: ${response.status} (Expected)`, 'green');
      } else {
        log(`⚠️  ${endpoint.name}: ${response.status} (Expected ${endpoint.expectStatus})`, 'yellow');
      }
      
      // Log response for debugging
      if (response.data && typeof response.data === 'object') {
        log(`   Response: ${JSON.stringify(response.data).substring(0, 100)}...`, 'cyan');
      }
      
    } catch (error) {
      log(`❌ ${endpoint.name}: ${error.message}`, 'red');
    }
  }
}

async function simulateStudentLogin() {
  logSection('SIMULATING STUDENT AUTHENTICATION');
  
  log('\n🔐 Student Authentication Flow:', 'blue');
  log('1. Student logs in via /student/login', 'yellow');
  log('2. Auth token stored in localStorage', 'yellow');
  log('3. Student portal loads and calls APIs with auth headers', 'yellow');
  log('4. APIs validate token and return data', 'yellow');
  
  log('\n📝 To test with real authentication:', 'blue');
  log('1. Open browser dev tools (F12)', 'green');
  log('2. Login to student portal', 'green');
  log('3. Check localStorage for currentUser and token', 'green');
  log('4. Check Network tab for API calls', 'green');
  log('5. Look for failed requests with 401/403 status', 'green');
}

async function checkDatabaseTables() {
  logSection('DATABASE TABLE ANALYSIS');
  
  log('\n📊 Required Tables for Student Dashboard:', 'blue');
  
  log('\n🎓 Subjects Table:', 'yellow');
  log('• subjects (id, name, code, batchId, semesterId)', 'cyan');
  log('• Must have records for student\'s batch', 'cyan');
  log('• Check: SELECT * FROM subjects WHERE batchId = [student_batch];', 'cyan');
  
  log('\n🏆 Certificates Table:', 'yellow');
  log('• certificates (id, studentId, submissionId, tokenId)', 'cyan');
  log('• Must have records for specific student', 'cyan');
  log('• Check: SELECT * FROM certificates WHERE studentId = [student_id];', 'cyan');
  
  log('\n👤 Students Table:', 'yellow');
  log('• students (id, batch, activeSemesterId)', 'cyan');
  log('• Student must have batch assigned', 'cyan');
  log('• Check: SELECT batch, activeSemesterId FROM students WHERE id = [student_id];', 'cyan');
  
  log('\n📝 Assignments/Submissions:', 'yellow');
  log('• assignments (id, subjectId, title)', 'cyan');
  log('• submissions (id, studentId, assignmentId, score)', 'cyan');
  log('• Check for graded submissions with score ≥80%', 'cyan');
}

async function provideFrontendFixes() {
  logSection('FRONTEND FIXES FOR CERTIFICATE DISPLAY');
  
  log('\n🔧 Issue 1: Certificates Not Showing', 'blue');
  log('Problem: getMyCertificates() returning empty array', 'red');
  log('Solutions:', 'green');
  log('• Check browser console for API errors', 'yellow');
  log('• Verify student authentication token', 'yellow');
  log('• Create test certificates in database', 'yellow');
  log('• Add fallback demo certificate for testing', 'yellow');
  
  log('\n🔧 Issue 2: Subjects Not Showing', 'blue');
  log('Problem: getStudentSubjects() returning empty array', 'red');
  log('Solutions:', 'green');
  log('• Check if student has batch assigned', 'yellow');
  log('• Verify subjects exist for student batch', 'yellow');
  log('• Add default subjects to database', 'yellow');
  log('• Check API endpoint authentication', 'yellow');
  
  log('\n🚀 Quick Test Solutions:', 'blue');
  log('1. Add demo data to StudentWeb3Rewards component', 'green');
  log('2. Create mock certificates for testing', 'green');
  log('3. Add sample subjects to student dashboard', 'green');
  log('4. Enable detailed console logging', 'green');
}

async function createMockData() {
  logSection('MOCK DATA FOR TESTING');
  
  log('\n📄 Mock Certificate Data:', 'blue');
  const mockCertificate = {
    id: 1,
    studentId: 1,
    submissionId: 1,
    tokenId: '1',
    contractAddress: '0x8f907106a386aF9b9a3a7A3bF74BbBa45fdEc5a0',
    transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
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
    createdAt: new Date().toISOString(),
    Submission: {
      Assignment: { title: 'Mathematics Quiz' },
      score: 85,
      letterGrade: 'A'
    }
  };
  
  log(JSON.stringify(mockCertificate, null, 2), 'cyan');
  
  log('\n📚 Mock Subject Data:', 'blue');
  const mockSubjects = [
    { id: 1, name: 'Mathematics', code: 'MATH101', batchId: 1 },
    { id: 2, name: 'Computer Science', code: 'CS101', batchId: 1 },
    { id: 3, name: 'Physics', code: 'PHY101', batchId: 1 }
  ];
  
  log(JSON.stringify(mockSubjects, null, 2), 'cyan');
}

async function main() {
  log('🔍 Testing Student Dashboard APIs', 'cyan');
  log('Checking certificate and subject endpoints\n', 'yellow');
  
  await testEndpointsWithoutAuth();
  await simulateStudentLogin();
  await checkDatabaseTables();
  await provideFrontendFixes();
  await createMockData();
  
  logSection('IMMEDIATE ACTION PLAN');
  log('\n📋 Step-by-Step Fix:', 'blue');
  log('1. Open browser dev tools and login to student portal', 'yellow');
  log('2. Check console for API errors and certificate/subject fetch logs', 'yellow');
  log('3. If APIs fail: Fix authentication or endpoint issues', 'yellow');
  log('4. If APIs succeed but return empty: Add test data to database', 'yellow');
  log('5. If no test data: Create demo certificates and subjects in frontend', 'yellow');
  
  log('\n🎯 Expected Results After Fix:', 'green');
  log('• Student dashboard shows list of enrolled subjects', 'cyan');
  log('• Certificate section shows earned certificates with details', 'cyan');
  log('• Debug panel shows certificates found > 0', 'cyan');
  log('• No API errors in browser console', 'cyan');
}

if (require.main === module) {
  main().catch(error => {
    log(`❌ Error: ${error.message}`, 'red');
    process.exit(1);
  });
}
