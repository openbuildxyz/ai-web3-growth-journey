#!/usr/bin/env node

/**
 * AWS RDS Setup Helper
 * This script helps configure AWS RDS connection and test connectivity
 */

const colors = require('colors');
const readline = require('readline');
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function testConnection(url, name) {
  try {
    console.log(`\n🔌 Testing ${name} connection...`.yellow);
    
    const sequelize = new Sequelize(url, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    });

    await sequelize.authenticate();
    console.log(`✅ ${name} connection successful`.green);
    
    // Get database info
    const [results] = await sequelize.query('SELECT version();');
    console.log(`   PostgreSQL Version: ${results[0].version.split(' ')[0]} ${results[0].version.split(' ')[1]}`.gray);
    
    await sequelize.close();
    return true;
  } catch (error) {
    console.error(`❌ ${name} connection failed: ${error.message}`.red);
    return false;
  }
}

async function buildAwsRdsUrl() {
  console.log('\n🔧 AWS RDS Configuration Builder'.cyan.bold);
  console.log('Please provide your AWS RDS instance details:\n'.gray);

  const endpoint = await question('RDS Endpoint (e.g., mydb.cluster-xxx.us-east-1.rds.amazonaws.com): ');
  const port = await question('Port (default: 5432): ') || '5432';
  const database = await question('Database Name (default: evalis): ') || 'evalis';
  const username = await question('Username: ');
  const password = await question('Password: ');
  const region = await question('AWS Region (e.g., us-east-1): ');

  const url = `postgresql://${username}:${password}@${endpoint}:${port}/${database}?sslmode=require`;
  
  console.log('\n📝 Generated connection string:'.cyan);
  const redactedUrl = url.replace(/(:\/\/[^:]+:)([^@]+)(@)/, '$1********$3');
  console.log(redactedUrl.gray);
  
  return url;
}

async function updateEnvironmentFile(awsRdsUrl) {
  const fs = require('fs').promises;
  const path = require('path');
  
  try {
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';
    
    try {
      envContent = await fs.readFile(envPath, 'utf8');
    } catch {
      console.log('📄 Creating new .env file...'.yellow);
    }

    // Add or update AWS RDS URL
    const awsRdsLine = `AWS_RDS_DATABASE_URL=${awsRdsUrl}`;
    
    if (envContent.includes('AWS_RDS_DATABASE_URL=')) {
      envContent = envContent.replace(/AWS_RDS_DATABASE_URL=.*/, awsRdsLine);
    } else {
      envContent += `\n# AWS RDS Configuration\n${awsRdsLine}\n`;
    }

    await fs.writeFile(envPath, envContent);
    console.log('✅ Updated .env file with AWS RDS configuration'.green);
    
  } catch (error) {
    console.error(`❌ Failed to update .env file: ${error.message}`.red);
    console.log('\nPlease manually add this line to your .env file:'.yellow);
    console.log(`AWS_RDS_DATABASE_URL=${awsRdsUrl}`.cyan);
  }
}

async function showMigrationCommands() {
  console.log('\n📋 Available Migration Commands:'.cyan.bold);
  console.log('  npm run export:neondb     - Export data from Neon DB'.gray);
  console.log('  npm run import:awsrds     - Import data to AWS RDS'.gray);
  console.log('  npm run verify:awsrds     - Verify AWS RDS setup'.gray);
  console.log('  npm run migrate:awsrds    - Complete migration process'.gray);
  console.log('\n🚀 Recommended next step:'.cyan.bold);
  console.log('  npm run migrate:awsrds'.green.bold);
}

async function main() {
  try {
    console.log('🎯 AWS RDS Setup Helper'.cyan.bold);
    console.log('This tool will help you configure AWS RDS for your Evalis-GT project\n'.gray);

    // Check existing configuration
    const existingAwsRds = process.env.AWS_RDS_DATABASE_URL;
    const existingNeon = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

    console.log('📊 Current Configuration:'.cyan.bold);
    console.log(`  Neon DB: ${existingNeon ? '✅ Configured' : '❌ Not found'}`.gray);
    console.log(`  AWS RDS: ${existingAwsRds ? '✅ Configured' : '❌ Not found'}`.gray);

    // Test existing connections
    if (existingNeon) {
      await testConnection(existingNeon, 'Neon DB');
    }
    
    if (existingAwsRds) {
      const testExisting = await question('\nTest existing AWS RDS connection? (y/n): ');
      if (testExisting.toLowerCase() === 'y') {
        await testConnection(existingAwsRds, 'AWS RDS');
      }
    }

    // Configure AWS RDS if not exists or user wants to reconfigure
    if (!existingAwsRds) {
      console.log('\n❌ AWS RDS not configured'.yellow);
      const configure = await question('Configure AWS RDS now? (y/n): ');
      
      if (configure.toLowerCase() === 'y') {
        const awsRdsUrl = await buildAwsRdsUrl();
        
        const testNew = await question('\nTest new AWS RDS connection? (y/n): ');
        if (testNew.toLowerCase() === 'y') {
          const connectionSuccess = await testConnection(awsRdsUrl, 'AWS RDS');
          
          if (connectionSuccess) {
            const save = await question('Save configuration to .env file? (y/n): ');
            if (save.toLowerCase() === 'y') {
              await updateEnvironmentFile(awsRdsUrl);
            }
          } else {
            console.log('⚠️ Connection test failed. Please check your RDS configuration.'.yellow);
          }
        } else {
          const save = await question('Save configuration to .env file anyway? (y/n): ');
          if (save.toLowerCase() === 'y') {
            await updateEnvironmentFile(awsRdsUrl);
          }
        }
      }
    } else {
      const reconfigure = await question('\nReconfigure AWS RDS? (y/n): ');
      
      if (reconfigure.toLowerCase() === 'y') {
        const awsRdsUrl = await buildAwsRdsUrl();
        const connectionSuccess = await testConnection(awsRdsUrl, 'AWS RDS');
        
        if (connectionSuccess) {
          const save = await question('Update .env file with new configuration? (y/n): ');
          if (save.toLowerCase() === 'y') {
            await updateEnvironmentFile(awsRdsUrl);
          }
        }
      }
    }

    // Show next steps
    await showMigrationCommands();

  } catch (error) {
    console.error(`❌ Setup failed: ${error.message}`.red.bold);
  } finally {
    rl.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
