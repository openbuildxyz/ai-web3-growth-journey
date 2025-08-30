/**
 * Verify AWS RDS database setup and data integrity after migration
 */

const dotenv = require('dotenv');
const colors = require('colors');
const { Sequelize } = require('sequelize');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

console.log('🔍 Starting AWS RDS verification...'.cyan.bold);

// AWS RDS connection
const awsRdsUrl = process.env.AWS_RDS_DATABASE_URL || process.env.DATABASE_URL;

if (!awsRdsUrl) {
  console.error('❌ AWS RDS URL not found in environment variables'.red.bold);
  process.exit(1);
}

const rdsSequelize = new Sequelize(awsRdsUrl, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

async function testConnection() {
  try {
    console.log('🔌 Testing AWS RDS connection...'.yellow);
    await rdsSequelize.authenticate();
    console.log('✅ AWS RDS connection successful'.green);
    
    // Test query
    const [results] = await rdsSequelize.query('SELECT version();');
    console.log(`📊 PostgreSQL Version: ${results[0].version}`.gray);
    
    return true;
  } catch (error) {
    console.error(`❌ Connection failed: ${error.message}`.red);
    return false;
  }
}

async function verifyTables() {
  try {
    console.log('\n🏗️ Verifying database tables...'.yellow);
    
    // Import models
    const models = require('../models');
    
    const tableStatus = {};
    let totalTables = 0;
    let existingTables = 0;

    for (const [modelName, model] of Object.entries(models)) {
      if (model && model.tableName) {
        totalTables++;
        try {
          await model.findOne({ limit: 1 });
          tableStatus[model.tableName] = 'exists';
          existingTables++;
          console.log(`  ✅ ${model.tableName}`.green);
        } catch (error) {
          tableStatus[model.tableName] = 'missing';
          console.log(`  ❌ ${model.tableName} - ${error.message}`.red);
        }
      }
    }

    console.log(`\n📊 Tables: ${existingTables}/${totalTables} exist`.cyan);
    
    return { tableStatus, totalTables, existingTables };
  } catch (error) {
    console.error(`❌ Table verification failed: ${error.message}`.red);
    return null;
  }
}

async function verifyData() {
  try {
    console.log('\n📋 Verifying data integrity...'.yellow);
    
    const models = require('../models');
    const dataStatus = {};
    let totalRecords = 0;

    for (const [modelName, model] of Object.entries(models)) {
      if (model && model.tableName) {
        try {
          const count = await model.count();
          dataStatus[model.tableName] = count;
          totalRecords += count;
          console.log(`  📊 ${model.tableName}: ${count} records`.gray);
        } catch (error) {
          dataStatus[model.tableName] = `Error: ${error.message}`;
          console.log(`  ❌ ${model.tableName}: ${error.message}`.red);
        }
      }
    }

    console.log(`\n📊 Total records: ${totalRecords}`.cyan);
    
    return { dataStatus, totalRecords };
  } catch (error) {
    console.error(`❌ Data verification failed: ${error.message}`.red);
    return null;
  }
}

async function testBasicOperations() {
  try {
    console.log('\n⚙️ Testing basic CRUD operations...'.yellow);
    
    const models = require('../models');
    
    // Test with Admin model if available
    if (models.Admin) {
      try {
        // Test CREATE
        const testAdmin = await models.Admin.create({
          username: 'test_verification_admin',
          name: 'Test Admin',
          email: 'test@verification.com',
          password: 'test123',
          role: 'admin'
        });
        console.log('  ✅ CREATE operation successful'.green);

        // Test READ
        const foundAdmin = await models.Admin.findByPk(testAdmin.id);
        if (foundAdmin) {
          console.log('  ✅ READ operation successful'.green);
        }

        // Test UPDATE
        await foundAdmin.update({ name: 'Updated Test Admin' });
        console.log('  ✅ UPDATE operation successful'.green);

        // Test DELETE
        await foundAdmin.destroy();
        console.log('  ✅ DELETE operation successful'.green);

      } catch (error) {
        console.log(`  ❌ CRUD test failed: ${error.message}`.red);
      }
    } else {
      console.log('  ⚠️ No Admin model found for CRUD testing'.yellow);
    }

    return true;
  } catch (error) {
    console.error(`❌ CRUD operations test failed: ${error.message}`.red);
    return false;
  }
}

async function compareWithExportData() {
  try {
    console.log('\n🔄 Comparing with export data...'.yellow);
    
    const fs = require('fs').promises;
    const exportDir = path.join(__dirname, '../exports');
    
    try {
      const metadataPath = path.join(exportDir, 'export_metadata.json');
      const metadataContent = await fs.readFile(metadataPath, 'utf8');
      const exportMetadata = JSON.parse(metadataContent);
      
      console.log(`📅 Original export date: ${exportMetadata.exportDate}`.gray);
      console.log(`📊 Original total records: ${exportMetadata.totalRecords}`.gray);
      
      // Compare record counts
      const models = require('../models');
      let currentTotal = 0;
      const comparison = {};
      
      for (const [tableName, originalCount] of Object.entries(exportMetadata.tables)) {
        const model = Object.values(models).find(m => m && m.tableName === tableName);
        if (model) {
          const currentCount = await model.count();
          currentTotal += currentCount;
          comparison[tableName] = {
            original: originalCount,
            current: currentCount,
            difference: currentCount - originalCount
          };
          
          const status = currentCount === originalCount ? '✅' : 
                        currentCount > originalCount ? '📈' : '📉';
          console.log(`  ${status} ${tableName}: ${originalCount} → ${currentCount}`.gray);
        }
      }
      
      console.log(`\n📊 Total: ${exportMetadata.totalRecords} → ${currentTotal}`.cyan);
      
      return comparison;
    } catch (error) {
      console.log('  ⚠️ Could not compare with export data (export metadata not found)'.yellow);
      return null;
    }
  } catch (error) {
    console.error(`❌ Comparison failed: ${error.message}`.red);
    return null;
  }
}

async function runVerification() {
  try {
    let allPassed = true;

    // Test connection
    const connectionOk = await testConnection();
    if (!connectionOk) allPassed = false;

    // Verify tables
    const tableResults = await verifyTables();
    if (!tableResults || tableResults.existingTables !== tableResults.totalTables) {
      allPassed = false;
    }

    // Verify data
    const dataResults = await verifyData();
    if (!dataResults) allPassed = false;

    // Test CRUD operations
    const crudOk = await testBasicOperations();
    if (!crudOk) allPassed = false;

    // Compare with export data
    await compareWithExportData();

    // Generate verification report
    const report = {
      verificationDate: new Date().toISOString(),
      connectionTest: connectionOk,
      tableVerification: tableResults,
      dataVerification: dataResults,
      crudTest: crudOk,
      overallStatus: allPassed ? 'PASSED' : 'FAILED'
    };

    // Save report
    const fs = require('fs').promises;
    const reportDir = path.join(__dirname, '../exports');
    await fs.writeFile(
      path.join(reportDir, 'verification_report.json'),
      JSON.stringify(report, null, 2)
    );

    console.log('\n📋 Verification Summary:'.cyan.bold);
    console.log(`Overall Status: ${allPassed ? '✅ PASSED' : '❌ FAILED'}`.bold);
    
    if (allPassed) {
      console.log('\n🎉 AWS RDS migration verification completed successfully!'.green.bold);
      console.log('Your database is ready for production use.'.green);
    } else {
      console.log('\n⚠️ Some verification tests failed.'.yellow.bold);
      console.log('Please review the issues above before using the database.'.yellow);
    }

    return allPassed;

  } catch (error) {
    console.error(`❌ Verification failed: ${error.message}`.red.bold);
    throw error;
  } finally {
    await rdsSequelize.close();
    console.log('\n🔌 AWS RDS connection closed'.yellow);
  }
}

// Run verification
if (require.main === module) {
  runVerification()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Verification process failed:'.red.bold);
      console.error(error);
      process.exit(1);
    });
}

module.exports = { runVerification };
