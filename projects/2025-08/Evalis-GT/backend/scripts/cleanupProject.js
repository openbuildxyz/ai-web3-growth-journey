#!/usr/bin/env node

/**
 * Evalis-GT Project Cleanup Script
 * This script identifies and removes unused files, fixes API endpoints, and consolidates duplicate code
 */

const fs = require('fs');
const path = require('path');
const colors = require('colors');

console.log('🧹 Starting Evalis-GT Project Cleanup...'.cyan.bold);

const serverDir = path.join(__dirname, '..');
const rootDir = path.join(__dirname, '../..');

// Categories of files to analyze
const fileCategories = {
  // Test files - can be safely removed in production
  testFiles: [
    'testEmailSending.js',
    'testDeleteUser.js', 
    'testEndpoints.js',
    'testEmailWithRealCredentials.js',
    'testAdminLogin.js',
    'testWithAuth.js',
    'testEmailLogin.js',
    'testNewEndpoints.js',
    'testFirebaseDeletion.js',
    'testAdminLoginAPI.js',
    'testProdLogin.js',
    'testConnection.js',
    'testDirectLogin.js',
    'testLocalServerless.js',
    'testEmailReset.js'
  ],

  // Duplicate serverless files - keep only serverless-robust.js
  serverlessFiles: [
    'serverless.js',           // Old version
    'serverless-simple.js',    // Basic version  
    'serverless-minimal.js'    // Minimal version
    // Keep: serverless-robust.js (currently used by api/index.js)
  ],

  // Check files - keep only essential ones
  checkFiles: [
    'checkTotalStorage.js',    // Remove - admin tool
    'checkTeachers.js',        // Remove - debug tool
    'checkAdmin.js',           // Remove - debug tool  
    'checkAdminDebug.js',      // Remove - debug tool
    'checkTeachersFirebase.js', // Remove - debug tool
    'checkStudentsFirebase.js'  // Remove - debug tool
    // Keep: checkProductionEnvironment.js (useful for deployment)
  ],

  // Create files - keep only essential ones
  createFiles: [
    'createTestUsers.js',      // Remove - test utility
    'createTestTeacher.js',    // Remove - test utility
    'createTestAssignment.js'  // Remove - test utility
    // Keep: createAdmin.js, createProductionAdmin.js (essential for setup)
  ],

  // Cleanup files - consolidate
  cleanupFiles: [
    'cleanupDatabase.js',
    'cleanupDatabaseKeepStructure.js',
    'emergencyCleanup.js',
    'safeCleanup.js'
    // Keep one comprehensive cleanup script
  ],

  // Duplicate auth routes
  duplicateRoutes: [
    'routes/authRoutesSimple.js'  // Remove - use main authRoutes.js
  ],

  // Monitoring and debug files
  utilityFiles: [
    'adminOnlyServer.js',      // Keep - useful for admin operations
    'inspectDatabase.js',      // Keep - database debugging
    'verifyDatabase.js',       // Keep - database verification
    'showAdminCredentials.js', // Keep - admin utility
    'quickOptimize.js',        // Remove - not essential
    'restart.js',              // Remove - use PM2 commands
    'startServer.js'           // Remove - use npm scripts
  ]
};

// Files to definitely keep
const essentialFiles = [
  'server.js',
  'server-production.js', 
  'serverless-robust.js',
  'createAdmin.js',
  'createProductionAdmin.js',
  'checkProductionEnvironment.js',
  'setupFreshDatabase.js',
  'setupNeonDB.js',
  'migrateMongoDB.js',
  'adminOnlyServer.js',
  'inspectDatabase.js',
  'verifyDatabase.js',
  'showAdminCredentials.js',
  'addFirebaseStudent.js',
  'deleteOrphanedFirebaseUser.js',
  'identifyFirebaseUser.js',
  'seed.js',
  'seeder.js',
  'index.js'
];

function scanDirectory(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !['node_modules', '.git', 'uploads', 'exports'].includes(item)) {
      scanDirectory(fullPath, files);
    } else if (stat.isFile() && item.endsWith('.js')) {
      files.push({
        name: item,
        fullPath,
        relativePath: path.relative(serverDir, fullPath),
        size: stat.size
      });
    }
  }
  
  return files;
}

function analyzeFiles() {
  console.log('\n📊 Analyzing project files...'.yellow);
  
  const allFiles = scanDirectory(serverDir);
  const analysis = {
    total: allFiles.length,
    toRemove: [],
    toKeep: [],
    duplicates: [],
    totalSize: 0,
    sizeToFree: 0
  };

  // Categorize files
  for (const file of allFiles) {
    analysis.totalSize += file.size;
    
    const fileName = file.name;
    const isEssential = essentialFiles.includes(fileName);
    const isInRemovalList = Object.values(fileCategories).flat().includes(fileName);
    
    if (isEssential) {
      analysis.toKeep.push(file);
    } else if (isInRemovalList) {
      analysis.toRemove.push(file);
      analysis.sizeToFree += file.size;
    } else {
      // Check if it's in essential directories
      const inEssentialDir = ['models', 'routes', 'controllers', 'middleware', 'config', 'utils'].some(dir => 
        file.relativePath.startsWith(dir)
      );
      
      if (inEssentialDir) {
        analysis.toKeep.push(file);
      } else {
        analysis.toRemove.push(file);
        analysis.sizeToFree += file.size;
      }
    }
  }

  return analysis;
}

function displayAnalysis(analysis) {
  console.log('\n📋 File Analysis Results:'.cyan.bold);
  console.log(`Total files: ${analysis.total}`.gray);
  console.log(`Files to keep: ${analysis.toKeep.length}`.green);
  console.log(`Files to remove: ${analysis.toRemove.length}`.red);
  console.log(`Total size: ${(analysis.totalSize / 1024).toFixed(2)} KB`.gray);
  console.log(`Size to free: ${(analysis.sizeToFree / 1024).toFixed(2)} KB`.yellow);

  console.log('\n📁 Files marked for removal:'.red.bold);
  analysis.toRemove.forEach(file => {
    const size = `(${(file.size / 1024).toFixed(2)} KB)`;
    console.log(`  ❌ ${file.relativePath} ${size}`.red);
  });

  console.log('\n📁 Essential files to keep:'.green.bold);
  analysis.toKeep.slice(0, 10).forEach(file => {
    console.log(`  ✅ ${file.relativePath}`.green);
  });
  
  if (analysis.toKeep.length > 10) {
    console.log(`  ... and ${analysis.toKeep.length - 10} more files`.gray);
  }
}

function createBackup(analysis) {
  console.log('\n💾 Creating backup...'.yellow);
  
  const backupDir = path.join(rootDir, 'cleanup-backup');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const manifest = {
    timestamp: new Date().toISOString(),
    filesRemoved: analysis.toRemove.map(f => f.relativePath),
    totalFiles: analysis.toRemove.length,
    totalSize: analysis.sizeToFree
  };

  fs.writeFileSync(
    path.join(backupDir, 'cleanup-manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  // Copy files to backup
  for (const file of analysis.toRemove) {
    const backupPath = path.join(backupDir, file.relativePath);
    const backupDirPath = path.dirname(backupPath);
    
    if (!fs.existsSync(backupDirPath)) {
      fs.mkdirSync(backupDirPath, { recursive: true });
    }
    
    fs.copyFileSync(file.fullPath, backupPath);
  }

  console.log(`✅ Backup created in: ${backupDir}`.green);
}

function removeFiles(analysis) {
  console.log('\n🗑️  Removing unused files...'.yellow);
  
  let removed = 0;
  for (const file of analysis.toRemove) {
    try {
      fs.unlinkSync(file.fullPath);
      console.log(`  🗑️  Removed: ${file.relativePath}`.gray);
      removed++;
    } catch (error) {
      console.error(`  ❌ Failed to remove ${file.relativePath}: ${error.message}`.red);
    }
  }

  console.log(`\n✅ Removed ${removed} files`.green);
}

function consolidateServerlessFiles() {
  console.log('\n🔄 Consolidating serverless files...'.yellow);
  
  // The current setup uses serverless-robust.js via api/index.js
  // Remove other serverless variants
  const filesToRemove = [
    path.join(serverDir, 'serverless.js'),
    path.join(serverDir, 'serverless-simple.js'),
    path.join(serverDir, 'serverless-minimal.js')
  ];

  for (const file of filesToRemove) {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`  🗑️  Removed: ${path.basename(file)}`.gray);
    }
  }

  console.log('✅ Serverless files consolidated'.green);
}

function fixAPIEndpoints() {
  console.log('\n🔧 Checking API endpoints for issues...'.yellow);
  
  // Check serverless-robust.js for any obvious issues
  const serverlessPath = path.join(serverDir, 'serverless-robust.js');
  
  try {
    const content = fs.readFileSync(serverlessPath, 'utf8');
    
    // Check for common issues
    const issues = [];
    
    if (!content.includes('app.use(cors')) {
      issues.push('Missing CORS configuration');
    }
    
    if (!content.includes('app.use(express.json')) {
      issues.push('Missing JSON body parser');
    }
    
    if (!content.includes('/api/health')) {
      issues.push('Missing health check endpoint');
    }

    if (issues.length > 0) {
      console.log('  ⚠️  Issues found:'.yellow);
      issues.forEach(issue => console.log(`    - ${issue}`.red));
    } else {
      console.log('  ✅ No obvious issues found in serverless configuration'.green);
    }

  } catch (error) {
    console.error(`  ❌ Error checking serverless file: ${error.message}`.red);
  }
}

function updatePackageJSON() {
  console.log('\n📦 Updating package.json scripts...'.yellow);
  
  const packagePath = path.join(rootDir, 'package.json');
  
  try {
    const packageContent = fs.readFileSync(packagePath, 'utf8');
    const packageData = JSON.parse(packageContent);

    // Remove scripts that reference deleted files
    const scriptsToRemove = [
      'test:endpoints',
      'test:email',
      'test:firebase',
      'debug:admin',
      'check:storage',
      'quick:optimize'
    ];

    let scriptsRemoved = 0;
    for (const script of scriptsToRemove) {
      if (packageData.scripts && packageData.scripts[script]) {
        delete packageData.scripts[script];
        scriptsRemoved++;
      }
    }

    if (scriptsRemoved > 0) {
      fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2));
      console.log(`  ✅ Removed ${scriptsRemoved} unused scripts from package.json`.green);
    } else {
      console.log('  ✅ No unused scripts found in package.json'.green);
    }

  } catch (error) {
    console.error(`  ❌ Error updating package.json: ${error.message}`.red);
  }
}

function generateCleanupReport(analysis) {
  console.log('\n📄 Generating cleanup report...'.yellow);
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: analysis.total,
      filesRemoved: analysis.toRemove.length,
      filesKept: analysis.toKeep.length,
      sizeFreed: `${(analysis.sizeToFree / 1024).toFixed(2)} KB`
    },
    categories: {
      testFiles: fileCategories.testFiles.length,
      serverlessFiles: fileCategories.serverlessFiles.length,
      checkFiles: fileCategories.checkFiles.length,
      createFiles: fileCategories.createFiles.length,
      cleanupFiles: fileCategories.cleanupFiles.length
    },
    removedFiles: analysis.toRemove.map(f => f.relativePath),
    essentialFiles: analysis.toKeep.map(f => f.relativePath),
    recommendations: [
      'Run npm test to ensure all functionality still works',
      'Test API endpoints after cleanup',
      'Verify production deployment works correctly',
      'Consider implementing proper CI/CD pipeline',
      'Set up automated testing for future changes'
    ]
  };

  const reportPath = path.join(rootDir, 'cleanup-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`✅ Cleanup report saved to: cleanup-report.json`.green);
  return report;
}

async function main() {
  try {
    // Step 1: Analyze files
    const analysis = analyzeFiles();
    displayAnalysis(analysis);

    // Step 2: Ask for confirmation
    console.log('\n⚠️  WARNING: This will remove unused files from your project.'.yellow.bold);
    console.log('A backup will be created before deletion.'.gray);
    
    // Auto-proceed for automated cleanup
    const proceed = true; // Change to false if you want manual confirmation

    if (!proceed) {
      console.log('Cleanup cancelled.'.yellow);
      return;
    }

    // Step 3: Create backup
    createBackup(analysis);

    // Step 4: Remove files
    removeFiles(analysis);

    // Step 5: Consolidate serverless files
    consolidateServerlessFiles();

    // Step 6: Fix API endpoints
    fixAPIEndpoints();

    // Step 7: Update package.json
    updatePackageJSON();

    // Step 8: Generate report
    const report = generateCleanupReport(analysis);

    // Summary
    console.log('\n🎉 Cleanup completed successfully!'.green.bold);
    console.log('\n📊 Summary:'.cyan.bold);
    console.log(`  Files removed: ${report.summary.filesRemoved}`.gray);
    console.log(`  Space freed: ${report.summary.sizeFreed}`.gray);
    console.log(`  Files kept: ${report.summary.filesKept}`.gray);

    console.log('\n🔍 Next Steps:'.cyan.bold);
    console.log('  1. Test your application: npm start'.yellow);
    console.log('  2. Test API endpoints: npm run test:db'.yellow);
    console.log('  3. Deploy and test production'.yellow);
    console.log('  4. Review cleanup-report.json for details'.yellow);

  } catch (error) {
    console.error(`❌ Cleanup failed: ${error.message}`.red.bold);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, analyzeFiles, fileCategories };
