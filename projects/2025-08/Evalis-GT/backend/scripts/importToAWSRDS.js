/**
 * Import data from exported JSON files to AWS RDS
 * This script will create tables and import all data
 */

const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');
const colors = require('colors');
const { Sequelize } = require('sequelize');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

console.log('🚀 Starting AWS RDS data import...'.cyan.bold);

// AWS RDS connection
const awsRdsUrl = process.env.AWS_RDS_DATABASE_URL;

if (!awsRdsUrl) {
  console.error('❌ AWS RDS URL not found in environment variables'.red.bold);
  console.error('Please set AWS_RDS_DATABASE_URL in your .env file'.yellow);
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
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Import directory
const importDir = path.join(__dirname, '../exports');

async function checkExportFiles() {
  try {
    await fs.access(importDir);
    const files = await fs.readdir(importDir);
    const jsonFiles = files.filter(file => file.endsWith('.json') && file !== 'export_metadata.json');
    
    if (jsonFiles.length === 0) {
      throw new Error('No export files found. Please run exportNeonDB.js first.');
    }
    
    console.log(`📁 Found ${jsonFiles.length} export files`.green);
    return jsonFiles;
  } catch (error) {
    console.error(`❌ Error checking export files: ${error.message}`.red);
    throw error;
  }
}

async function loadMetadata() {
  try {
    const metadataPath = path.join(importDir, 'export_metadata.json');
    const metadataContent = await fs.readFile(metadataPath, 'utf8');
    const metadata = JSON.parse(metadataContent);
    
    console.log('📋 Export Metadata:'.cyan);
    console.log(`  Export Date: ${metadata.exportDate}`.gray);
    console.log(`  Total Records: ${metadata.totalRecords}`.gray);
    console.log(`  Source: ${metadata.source}`.gray);
    
    return metadata;
  } catch (error) {
    console.warn('⚠️ Could not load export metadata'.yellow);
    return null;
  }
}

async function createTablesAndImportData() {
  try {
    // Connect to AWS RDS
    console.log('🔌 Connecting to AWS RDS...'.yellow);
    await rdsSequelize.authenticate();
    console.log('✅ Connected to AWS RDS'.green);

    // Import models to ensure table structure
    console.log('🏗️ Creating database tables...'.yellow);
    const models = require('../models');
    
    // Create all tables (force: false to avoid dropping existing data)
    await rdsSequelize.sync({ force: false });
    console.log('✅ Database tables created/verified'.green);

    // Load export metadata
    const metadata = await loadMetadata();
    
    // Check export files
    const exportFiles = await checkExportFiles();
    
    const importSummary = {};
    let totalImported = 0;
    let totalSkipped = 0;

    // Import data for each table
    for (const filename of exportFiles) {
      const tableName = path.basename(filename, '.json');
      
      try {
        console.log(`📥 Importing ${tableName}...`.yellow);
        
        const filePath = path.join(importDir, filename);
        const fileContent = await fs.readFile(filePath, 'utf8');
        const tableData = JSON.parse(fileContent);
        
        if (tableData.length === 0) {
          console.log(`⚠️ No data found for ${tableName}`.yellow);
          importSummary[tableName] = { imported: 0, skipped: 0 };
          continue;
        }

        // Find corresponding model
        const model = Object.values(models).find(m => m && m.tableName === tableName);
        
        if (!model) {
          console.warn(`⚠️ No model found for table ${tableName}, skipping...`.yellow);
          continue;
        }

        let imported = 0;
        let skipped = 0;

        // Import records with error handling
        for (const record of tableData) {
          try {
            // Use upsert to handle potential conflicts
            await model.upsert(record, {
              validate: true,
              returning: false
            });
            imported++;
          } catch (error) {
            console.warn(`⚠️ Skipped record in ${tableName}: ${error.message}`.yellow);
            skipped++;
          }
        }

        importSummary[tableName] = { imported, skipped };
        totalImported += imported;
        totalSkipped += skipped;
        
        console.log(`✅ Imported ${imported} records to ${tableName} (${skipped} skipped)`.green);
        
      } catch (error) {
        console.error(`❌ Error importing ${tableName}: ${error.message}`.red);
        importSummary[tableName] = { error: error.message };
      }
    }

    // Create import summary
    const importMetadata = {
      importDate: new Date().toISOString(),
      source: 'Neon DB Export',
      destination: 'AWS RDS',
      tables: importSummary,
      totalImported,
      totalSkipped,
      originalExport: metadata
    };

    await fs.writeFile(
      path.join(importDir, 'import_summary.json'),
      JSON.stringify(importMetadata, null, 2)
    );

    console.log('\n📋 Import Summary:'.cyan.bold);
    console.log(`Total records imported: ${totalImported}`.green);
    console.log(`Total records skipped: ${totalSkipped}`.yellow);
    
    Object.entries(importSummary).forEach(([table, stats]) => {
      if (stats.error) {
        console.log(`  ${table}: Error - ${stats.error}`.red);
      } else {
        console.log(`  ${table}: ${stats.imported} imported, ${stats.skipped} skipped`.gray);
      }
    });

    console.log('\n✅ Data import completed successfully!'.green.bold);

  } catch (error) {
    console.error(`❌ Import failed: ${error.message}`.red.bold);
    throw error;
  } finally {
    await rdsSequelize.close();
    console.log('🔌 AWS RDS connection closed'.yellow);
  }
}

// Run import
if (require.main === module) {
  createTablesAndImportData()
    .then(() => {
      console.log('🎉 Import process completed!'.green.bold);
      console.log('\n🔄 Next steps:'.cyan.bold);
      console.log('1. Update DATABASE_URL to point to AWS RDS'.yellow);
      console.log('2. Run verification script: npm run verify:awsrds'.yellow);
      console.log('3. Test your application with the new database'.yellow);
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Import process failed:'.red.bold);
      console.error(error);
      process.exit(1);
    });
}

module.exports = { createTablesAndImportData };
