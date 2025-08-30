/**
 * AWS RDS Database Configuration
 * Alternative to the main db.js for AWS RDS specific settings
 */

const { Sequelize } = require('sequelize');
const colors = require('colors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Helper to resolve AWS RDS database URL
function resolveAwsRdsUrl() {
  const url = process.env.AWS_RDS_DATABASE_URL || 
              process.env.DATABASE_URL || 
              process.env.RDS_DATABASE_URL;
  
  if (!url || url === 'null' || url === 'undefined') {
    return undefined;
  }
  return url.trim();
}

// AWS RDS optimized configuration
function createAwsRdsSequelize() {
  const dbUrl = resolveAwsRdsUrl();

  if (!dbUrl) {
    throw new Error('AWS RDS database URL not found. Please set AWS_RDS_DATABASE_URL or DATABASE_URL');
  }

  if (typeof dbUrl !== 'string') {
    throw new Error(`Database URL is not a string (type=${typeof dbUrl})`);
  }

  console.log('[AWS RDS] Initializing Sequelize connection'.gray);
  
  // AWS RDS optimized pool configuration
  const poolConfig = {
    max: 20,           // Maximum number of connections
    min: 0,            // Minimum number of connections
    acquire: 60000,    // Maximum time to try connecting (60s)
    idle: 300000,      // Maximum time a connection can be idle (5min)
    evict: 5000,       // Check for idle connections every 5s
    handleDisconnects: true
  };

  const sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    
    // AWS RDS SSL configuration
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      },
      // Connection timeout
      connectTimeout: 60000,
      // Socket timeout
      socketTimeout: 60000,
      // Keep alive
      keepAlive: true,
      keepAliveInitialDelayMillis: 0
    },
    
    // Connection pool
    pool: poolConfig,
    
    // Query timeout
    query: {
      timeout: 30000
    },
    
    // Retry configuration
    retry: {
      match: [
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /ETIMEDOUT/,
        /ESOCKETTIMEDOUT/,
        /EHOSTUNREACH/,
        /EPIPE/,
        /EAI_AGAIN/,
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/
      ],
      max: 3
    },
    
    // Additional options for AWS RDS
    define: {
      charset: 'utf8',
      dialectOptions: {
        collate: 'utf8_general_ci'
      },
      timestamps: true,
      paranoid: false
    }
  });

  return sequelize;
}

// Connection management
let sequelize;
let initialized = false;

async function connectAwsRds() {
  if (initialized && sequelize) {
    return sequelize;
  }

  try {
    sequelize = createAwsRdsSequelize();
    
    const dbUrl = resolveAwsRdsUrl();
    console.log('Database configuration:'.yellow);
    console.log('Using AWS RDS PostgreSQL'.cyan);
    
    // Redact sensitive information in URL
    const redactedUrl = dbUrl.replace(/(:\/\/[^:]+:)([^@]+)(@)/, '$1********$3');
    console.log(`Connection URL (redacted): ${redactedUrl}`.gray);
    
    // Test connection
    await sequelize.authenticate();
    console.log('AWS RDS PostgreSQL Connected Successfully'.cyan.underline);
    
    initialized = true;
    return sequelize;
    
  } catch (error) {
    console.error(`Error connecting to AWS RDS: ${error.message}`.red.bold);
    
    // Enhanced error reporting for AWS RDS
    if (error.message.includes('timeout')) {
      console.error('Troubleshooting: Connection timeout issues'.yellow);
      console.error('1. Check security group allows connections on port 5432'.gray);
      console.error('2. Verify VPC and subnet configuration'.gray);
      console.error('3. Ensure RDS instance is in "available" state'.gray);
    } else if (error.message.includes('authentication')) {
      console.error('Troubleshooting: Authentication issues'.yellow);
      console.error('1. Verify username and password are correct'.gray);
      console.error('2. Check if user has necessary permissions'.gray);
      console.error('3. Ensure database name exists'.gray);
    } else if (error.message.includes('SSL')) {
      console.error('Troubleshooting: SSL connection issues'.yellow);
      console.error('1. Ensure SSL is enabled on RDS instance'.gray);
      console.error('2. Check if ?sslmode=require is in connection string'.gray);
    }
    
    throw error;
  }
}

// Graceful shutdown
async function closeAwsRdsConnection() {
  if (sequelize) {
    try {
      await sequelize.close();
      console.log('AWS RDS connection closed'.yellow);
      initialized = false;
      sequelize = null;
    } catch (error) {
      console.error(`Error closing AWS RDS connection: ${error.message}`.red);
    }
  }
}

// Health check
async function healthCheck() {
  try {
    if (!sequelize || !initialized) {
      await connectAwsRds();
    }
    
    await sequelize.authenticate();
    return {
      status: 'healthy',
      database: 'AWS RDS PostgreSQL',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      database: 'AWS RDS PostgreSQL',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Export functions
module.exports = {
  connectAwsRds,
  closeAwsRdsConnection,
  healthCheck,
  get sequelize() {
    if (!sequelize) {
      sequelize = createAwsRdsSequelize();
    }
    return sequelize;
  }
};
