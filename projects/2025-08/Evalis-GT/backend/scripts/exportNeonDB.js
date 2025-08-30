/**
 * Export data from Neon DB to JSON files for migration to AWS RDS
 * This script will export all tables and their data
 */

const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');
const colors = require('colors');
const { Sequelize } = require('sequelize');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

console.log('🚀 Starting Neon DB data export...'.cyan.bold);

// Neon DB connection
const neonDbUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

if (!neonDbUrl) {
  console.error('❌ Neon DB URL not found in environment variables'.red.bold);
  process.exit(1);
}

const neonSequelize = new Sequelize(neonDbUrl, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

// Export directory
const exportDir = path.join(__dirname, '../exports');

async function ensureExportDirectory() {
  try {
    await fs.access(exportDir);
  } catch {
    await fs.mkdir(exportDir, { recursive: true });
    console.log(`📁 Created export directory: ${exportDir}`.green);
  }
}

async function exportTableData(tableName, model) {
  try {
    console.log(`📊 Exporting ${tableName}...`.yellow);
    
    const data = await model.findAll({
      raw: true,
      nest: false
    });
    
    const exportPath = path.join(exportDir, `${tableName}.json`);
    await fs.writeFile(exportPath, JSON.stringify(data, null, 2));
    
    console.log(`✅ Exported ${data.length} records from ${tableName}`.green);
    return data.length;
  } catch (error) {
    console.error(`❌ Error exporting ${tableName}: ${error.message}`.red);
    throw error;
  }
}

async function exportAllTables() {
  try {
    // Connect to Neon DB
    console.log('🔌 Connecting to Neon DB...'.yellow);
    await neonSequelize.authenticate();
    console.log('✅ Connected to Neon DB'.green);

    // Import models
    const models = require('../models');
    
    // Ensure export directory exists
    await ensureExportDirectory();

    const exportSummary = {};
    let totalRecords = 0;

    // Export each model
    for (const [modelName, model] of Object.entries(models)) {
      if (model && model.tableName) {
        const recordCount = await exportTableData(model.tableName, model);
        exportSummary[model.tableName] = recordCount;
        totalRecords += recordCount;
      }
    }

    // Create export metadata
    const metadata = {
      exportDate: new Date().toISOString(),
      source: 'Neon DB',
      destination: 'AWS RDS',
      tables: exportSummary,
      totalRecords,
      sourceUrl: neonDbUrl.replace(/(:\/\/[^:]+:)([^@]+)(@)/, '$1********$3')
    };

    await fs.writeFile(
      path.join(exportDir, 'export_metadata.json'),
      JSON.stringify(metadata, null, 2)
    );

    console.log('\n📋 Export Summary:'.cyan.bold);
    console.log(`Total records exported: ${totalRecords}`.green);
    console.log(`Export location: ${exportDir}`.green);
    
    Object.entries(exportSummary).forEach(([table, count]) => {
      console.log(`  ${table}: ${count} records`.gray);
    });

    console.log('\n✅ Data export completed successfully!'.green.bold);

  } catch (error) {
    console.error(`❌ Export failed: ${error.message}`.red.bold);
    throw error;
  } finally {
    await neonSequelize.close();
    console.log('🔌 Neon DB connection closed'.yellow);
  }
}

// Run export
if (require.main === module) {
  exportAllTables()
    .then(() => {
      console.log('🎉 Export process completed!'.green.bold);
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Export process failed:'.red.bold);
      console.error(error);
      process.exit(1);
    });
}

module.exports = { exportAllTables };
