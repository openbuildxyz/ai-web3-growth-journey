/**
 * This script migrates data from MongoDB to NeonDB (PostgreSQL)
 * It handles any collections that were previously in MongoDB and inserts them into PostgreSQL
 */

require('dotenv').config();
const mongoose = require('mongoose');
const colors = require('colors');
const { sequelize } = require('./config/db');
const { Batch } = require('./models');

// MongoDB models - import only what you were using in MongoDB
const MongoBatch = require('./models/Batch');

// MongoDB connection options
const mongoOptions = {
  serverSelectionTimeoutMS: 60000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 60000
};

async function migrateData() {
  try {
    console.log('Migration process starting...'.yellow);
    
    // Step 1: Connect to MongoDB
    console.log('Connecting to MongoDB...'.cyan);
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI not defined in .env file'.red);
      process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGODB_URI, mongoOptions);
    console.log('Successfully connected to MongoDB'.green);
    
    // Step 2: Connect to NeonDB via Sequelize
    console.log('Connecting to NeonDB...'.cyan);
    await sequelize.authenticate();
    console.log('Successfully connected to NeonDB'.green);
    
    // Step 3: Migrate Batch data
    console.log('Migrating Batch data...'.cyan);
    const mongoBatches = await MongoBatch.find({});
    console.log(`Found ${mongoBatches.length} batches in MongoDB`.cyan);
    
    // Sync the table first (create if not exists)
    await sequelize.models.Batch.sync({ alter: true });
    
    let migratedCount = 0;
    
    for (const batch of mongoBatches) {
      const batchData = {
        id: batch._id.toString(), // Convert ObjectId to string
        name: batch.name,
        department: batch.department,
        startYear: batch.startYear,
        endYear: batch.endYear,
        active: batch.active,
        createdAt: batch.createdAt,
        updatedAt: batch.updatedAt
      };
      
      try {
        await sequelize.models.Batch.findOrCreate({
          where: { id: batchData.id },
          defaults: batchData
        });
        migratedCount++;
      } catch (error) {
        console.error(`Error migrating batch ${batch.name}: ${error.message}`.red);
      }
    }
    
    console.log(`Successfully migrated ${migratedCount} batches to NeonDB`.green);
    
    // Step 4: Add additional collection migrations here
    // e.g., migrate students, submissions, etc.
    
    console.log('Migration completed successfully! 🎉'.green.bold);
    
  } catch (error) {
    console.error(`Migration failed: ${error.message}`.red.bold);
    console.error(error.stack);
  } finally {
    // Close connections
    if (mongoose.connection) await mongoose.disconnect();
    if (sequelize) await sequelize.close();
    
    console.log('Connections closed'.yellow);
  }
}

// Run migration
migrateData();