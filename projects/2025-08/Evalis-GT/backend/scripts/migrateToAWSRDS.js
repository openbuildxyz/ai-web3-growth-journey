#!/usr/bin/env node

/**
 * Complete AWS RDS Migration Orchestrator
 * This script handles the complete migration process from Neon DB to AWS RDS
 */

const colors = require('colors');
const readline = require('readline');
const { exportAllTables } = require('./exportNeonDB');
const { createTablesAndImportData } = require('./importToAWSRDS');
const { runVerification } = require('./verifyAWSRDS');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function checkPrerequisites() {
  console.log('🔍 Checking migration prerequisites...'.cyan.bold);
  
  const checks = {
    neonDb: !!process.env.NEON_DATABASE_URL || !!process.env.DATABASE_URL,
    awsRds: !!process.env.AWS_RDS_DATABASE_URL,
    backupDir: true // Will be created if needed
  };

  console.log(`  Neon DB URL: ${checks.neonDb ? '✅' : '❌'}`.gray);
  console.log(`  AWS RDS URL: ${checks.awsRds ? '✅' : '❌'}`.gray);
  
  if (!checks.neonDb) {
    console.error('❌ Neon DB connection not found. Please set NEON_DATABASE_URL or DATABASE_URL'.red);
    return false;
  }
  
  if (!checks.awsRds) {
    console.error('❌ AWS RDS connection not found. Please set AWS_RDS_DATABASE_URL'.red);
    return false;
  }
  
  console.log('✅ Prerequisites check passed'.green);
  return true;
}

async function confirmMigration() {
  console.log('\n⚠️  MIGRATION WARNING'.yellow.bold);
  console.log('This will migrate all data from Neon DB to AWS RDS.'.yellow);
  console.log('Please ensure you have:'.yellow);
  console.log('1. Created your AWS RDS instance'.gray);
  console.log('2. Configured security groups for access'.gray);
  console.log('3. Set AWS_RDS_DATABASE_URL environment variable'.gray);
  console.log('4. Tested connectivity to both databases'.gray);
  
  const answer = await question('\nDo you want to proceed? (yes/no): ');
  return answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y';
}

async function migrationStep(stepName, stepFunction, continueOnError = false) {
  try {
    console.log(`\n${'='.repeat(60)}`.cyan);
    console.log(`🚀 ${stepName}`.cyan.bold);
    console.log(`${'='.repeat(60)}`.cyan);
    
    const result = await stepFunction();
    
    console.log(`✅ ${stepName} completed successfully`.green.bold);
    return { success: true, result };
  } catch (error) {
    console.error(`❌ ${stepName} failed: ${error.message}`.red.bold);
    
    if (continueOnError) {
      const answer = await question('\nDo you want to continue anyway? (yes/no): ');
      if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        return { success: false, error: error.message, continued: true };
      }
    }
    
    return { success: false, error: error.message };
  }
}

async function runMigration() {
  try {
    console.log('🎯 Starting AWS RDS Migration Process'.cyan.bold);
    console.log(`Timestamp: ${new Date().toISOString()}\n`.gray);

    // Step 1: Check prerequisites
    const prereqResult = await migrationStep('Prerequisites Check', checkPrerequisites);
    if (!prereqResult.success) {
      console.error('Migration aborted due to failed prerequisites'.red.bold);
      return false;
    }

    // Step 2: Confirm migration
    if (!(await confirmMigration())) {
      console.log('Migration cancelled by user'.yellow);
      return false;
    }

    // Step 3: Export data from Neon DB
    const exportResult = await migrationStep('Data Export from Neon DB', exportAllTables);
    if (!exportResult.success) {
      console.error('Migration failed at export step'.red.bold);
      return false;
    }

    // Step 4: Import data to AWS RDS
    const importResult = await migrationStep(
      'Data Import to AWS RDS', 
      createTablesAndImportData,
      true // Allow continuation on non-critical errors
    );
    
    if (!importResult.success && !importResult.continued) {
      console.error('Migration failed at import step'.red.bold);
      return false;
    }

    // Step 5: Verify migration
    const verifyResult = await migrationStep(
      'Migration Verification',
      runVerification,
      true // Allow continuation for review
    );

    // Migration summary
    console.log('\n' + '='.repeat(60).green);
    console.log('📋 MIGRATION SUMMARY'.green.bold);
    console.log('='.repeat(60).green);
    
    console.log(`Export: ${exportResult.success ? '✅ Success' : '❌ Failed'}`.gray);
    console.log(`Import: ${importResult.success ? '✅ Success' : importResult.continued ? '⚠️ Completed with warnings' : '❌ Failed'}`.gray);
    console.log(`Verification: ${verifyResult.success ? '✅ Success' : verifyResult.continued ? '⚠️ Completed with warnings' : '❌ Failed'}`.gray);

    const overallSuccess = exportResult.success && 
                          (importResult.success || importResult.continued) && 
                          (verifyResult.success || verifyResult.continued);

    if (overallSuccess) {
      console.log('\n🎉 MIGRATION COMPLETED SUCCESSFULLY!'.green.bold);
      console.log('\nNext Steps:'.cyan.bold);
      console.log('1. Update your DATABASE_URL to point to AWS RDS'.yellow);
      console.log('2. Update production environment variables'.yellow);
      console.log('3. Test your application thoroughly'.yellow);
      console.log('4. Update your deployment configurations'.yellow);
      console.log('5. Monitor the new database performance'.yellow);
    } else {
      console.log('\n⚠️ MIGRATION COMPLETED WITH ISSUES'.yellow.bold);
      console.log('Please review the errors above and take appropriate action.'.yellow);
    }

    return overallSuccess;

  } catch (error) {
    console.error(`💥 Migration process failed: ${error.message}`.red.bold);
    return false;
  }
}

// Handle script execution
if (require.main === module) {
  // Load environment variables
  require('dotenv').config();
  
  runMigration()
    .then((success) => {
      console.log(`\nMigration process ${success ? 'completed successfully' : 'failed'}`.bold);
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Unexpected error in migration process:'.red.bold);
      console.error(error);
      process.exit(1);
    })
    .finally(() => {
      rl.close();
    });
}

module.exports = { runMigration };
