const dotenv = require('dotenv');
const path = require('path');
const colors = require('colors');

// Load production environment variables
dotenv.config({ path: path.join(__dirname, '../.env.production') });

const checkProductionEnvironment = async () => {
  console.log('🔍 Checking Production Environment Configuration'.yellow.bold);
  console.log('='*60);
  
  const requiredVars = [
    'NODE_ENV',
    'DATABASE_URL', 
    'JWT_SECRET',
    'DEFAULT_ADMIN_PASSWORD',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL'
  ];
  
  const optionalVars = [
    'FIREBASE_PRIVATE_KEY_B64',
    'FIREBASE_SERVICE_ACCOUNT_JSON',
    'EMAIL_USER',
    'EMAIL_PASS'
  ];
  
  let allGood = true;
  
  console.log('\n📋 Required Environment Variables:'.blue.bold);
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: ${'*'.repeat(Math.min(value.length, 20))}`.green);
    } else {
      console.log(`❌ ${varName}: MISSING`.red);
      allGood = false;
    }
  });
  
  console.log('\n📋 Optional Environment Variables:'.blue.bold);
  optionalVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: ${'*'.repeat(Math.min(value.length, 20))}`.green);
    } else {
      console.log(`⚠️  ${varName}: Not set`.yellow);
    }
  });
  
  // Test database connection
  console.log('\n🗄️  Testing Database Connection:'.blue.bold);
  try {
    const { connectDB } = require('./config/db');
    await connectDB();
    console.log('✅ Database connection successful'.green);
    
    // Test admin user
    const { Admin } = require('./models');
    const admin = await Admin.findOne({ where: { username: 'admin' } });
    if (admin) {
      console.log('✅ Admin user found in database'.green);
      console.log(`   Username: ${admin.username}`.gray);
      console.log(`   Email: ${admin.email}`.gray);
    } else {
      console.log('❌ Admin user not found in database'.red);
      allGood = false;
    }
    
  } catch (error) {
    console.log(`❌ Database connection failed: ${error.message}`.red);
    allGood = false;
  }
  
  // Test Firebase configuration
  console.log('\n🔥 Testing Firebase Configuration:'.blue.bold);
  try {
    const { adminAuth } = require('./config/firebase');
    if (adminAuth) {
      console.log('✅ Firebase Admin SDK initialized'.green);
    } else {
      console.log('⚠️  Firebase Admin SDK not initialized'.yellow);
    }
  } catch (error) {
    console.log(`❌ Firebase configuration error: ${error.message}`.red);
  }
  
  console.log('\n' + '='*60);
  if (allGood) {
    console.log('🎉 Production environment looks good!'.green.bold);
  } else {
    console.log('⚠️  Some issues found in production environment'.yellow.bold);
  }
  
  process.exit(allGood ? 0 : 1);
};

checkProductionEnvironment().catch(error => {
  console.error('❌ Environment check failed:', error);
  process.exit(1);
});
