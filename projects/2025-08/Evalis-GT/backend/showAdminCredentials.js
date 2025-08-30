#!/usr/bin/env node
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('🔐 EVALIS ADMIN LOGIN CREDENTIALS');
console.log('================================');
console.log('Username:', 'admin');
console.log('Password:', process.env.DEFAULT_ADMIN_PASSWORD || 'zyExeKhXoMFtd1Gc');
console.log('================================');
console.log('✅ Use these credentials to login to the admin portal');
