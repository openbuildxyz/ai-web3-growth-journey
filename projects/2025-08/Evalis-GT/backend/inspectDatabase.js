const dotenv = require('dotenv');
const path = require('path');

// Load production environment variables
dotenv.config({ path: path.join(__dirname, '../.env.production') });

const { connectDB, sequelize } = require('./config/db');

const inspectDatabase = async () => {
  try {
    console.log('🔍 INSPECTING DATABASE STRUCTURE');
    console.log('='*50);
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');
    
    // Get current database size
    const sizeQuery = `
      SELECT 
        pg_size_pretty(pg_database_size(current_database())) as db_size,
        pg_database_size(current_database()) as db_bytes
    `;
    
    const dbSize = await sequelize.query(sizeQuery, { type: sequelize.QueryTypes.SELECT });
    console.log(`\nDatabase Size: ${dbSize[0].db_size}`);
    
    // List all tables
    console.log('\n📋 Existing Tables:');
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    const tables = await sequelize.query(tablesQuery, { type: sequelize.QueryTypes.SELECT });
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });
    
    // For each table, get column info and row count
    console.log('\n📊 Table Details:');
    
    for (const table of tables) {
      const tableName = table.table_name;
      
      // Get columns
      const columnsQuery = `
        SELECT column_name, data_type, character_maximum_length 
        FROM information_schema.columns 
        WHERE table_name = '${tableName}' AND table_schema = 'public'
        ORDER BY ordinal_position;
      `;
      
      const columns = await sequelize.query(columnsQuery, { type: sequelize.QueryTypes.SELECT });
      
      // Get row count
      let rowCount = 0;
      try {
        const countResult = await sequelize.query(`SELECT COUNT(*) as count FROM "${tableName}"`, { type: sequelize.QueryTypes.SELECT });
        rowCount = countResult[0].count;
      } catch (e) {
        rowCount = 'Error counting';
      }
      
      // Get table size
      let tableSize = 'Unknown';
      try {
        const sizeResult = await sequelize.query(`
          SELECT pg_size_pretty(pg_total_relation_size('"${tableName}"')) as size
        `, { type: sequelize.QueryTypes.SELECT });
        tableSize = sizeResult[0].size;
      } catch (e) {
        tableSize = 'Error getting size';
      }
      
      console.log(`\n🔹 ${tableName}:`);
      console.log(`   Rows: ${rowCount}`);
      console.log(`   Size: ${tableSize}`);
      console.log('   Columns:');
      columns.forEach(col => {
        const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
        console.log(`     - ${col.column_name}: ${col.data_type}${length}`);
      });
    }
    
    // Check for any large data
    console.log('\n🔍 Looking for Large Data:');
    
    for (const table of tables) {
      const tableName = table.table_name;
      try {
        // Check for text/blob columns that might contain large data
        const largeDataQuery = `
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = '${tableName}' 
          AND table_schema = 'public'
          AND (data_type = 'text' OR data_type = 'bytea' OR character_maximum_length > 1000);
        `;
        
        const largeColumns = await sequelize.query(largeDataQuery, { type: sequelize.QueryTypes.SELECT });
        
        if (largeColumns.length > 0) {
          console.log(`\n📁 ${tableName} has large data columns:`);
          largeColumns.forEach(col => {
            console.log(`   - ${col.column_name}`);
          });
          
          // Sample the data to see sizes
          for (const col of largeColumns) {
            try {
              const sampleQuery = `
                SELECT LENGTH("${col.column_name}") as length, COUNT(*) as count
                FROM "${tableName}" 
                WHERE "${col.column_name}" IS NOT NULL
                GROUP BY LENGTH("${col.column_name}")
                ORDER BY length DESC
                LIMIT 5;
              `;
              
              const samples = await sequelize.query(sampleQuery, { type: sequelize.QueryTypes.SELECT });
              if (samples.length > 0) {
                console.log(`     ${col.column_name} sizes:`);
                samples.forEach(sample => {
                  console.log(`       ${sample.length} chars: ${sample.count} records`);
                });
              }
            } catch (e) {
              console.log(`     ${col.column_name}: Error checking sizes`);
            }
          }
        }
      } catch (e) {
        console.log(`   Error checking ${tableName}: ${e.message}`);
      }
    }
    
    console.log('\n✅ Database inspection completed!');
    
    await sequelize.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Database inspection failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

inspectDatabase();
