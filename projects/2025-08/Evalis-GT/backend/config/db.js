const { Sequelize } = require('sequelize');
const colors = require('colors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from root directory (ignored in production deploy unless present)
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Helper to fetch DB URL each time (avoids capturing an undefined early value)
function resolveDatabaseUrl() {
  const raw = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.PG_URL;
  // Some hosting dashboards accidentally inject the literal string "null" or empty string
  if (!raw || raw === 'null' || raw === 'undefined') return undefined;
  return raw.trim();
}

// Determine if we're running in a serverless platform (Vercel) to tune connection pooling
const isVercelServerless = !!process.env.VERCEL;

// Lazy singleton for database connection
let sequelize;
let initialized = false;

function buildSequelize() {
  if (sequelize) return sequelize;
  const dbUrl = resolveDatabaseUrl();

  if (!dbUrl) {
    console.error('❌ Database URL not found in environment variables (DATABASE_URL / POSTGRES_URL / PG_URL)'.red.bold);
    console.error('   Current keys present:', Object.keys(process.env).filter(k => /(DATABASE_URL|POSTGRES|PG_?URL)/i.test(k)).join(', ') || 'none');
    throw new Error('Missing database connection string');
  }

  if (typeof dbUrl !== 'string') {
    throw new Error(`Database URL is not a string (type=${typeof dbUrl})`);
  }

  // AWS RDS connection pooling - smaller pool for Vercel serverless functions, larger for traditional servers
  const poolConfig = isVercelServerless 
    ? { max: 2, min: 0, idle: 10000, acquire: 30000, evict: 5000 } // Vercel serverless
    : { max: 10, min: 2, acquire: 60000, idle: 10000, evict: 1000 }; // Traditional server

  console.log(`[DB] Initializing AWS RDS connection (Vercel=${isVercelServerless})`.gray);
  const enableSqlLogs = (process.env.DB_LOG_SQL === 'true');
  const useSsl = (process.env.POSTGRES_SSL || process.env.DB_SSL || 'true').toLowerCase() === 'true';
  sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    logging: enableSqlLogs ? (msg) => console.log('[SQL]', msg) : (process.env.NODE_ENV === 'development' ? console.log : false),
    dialectOptions: {
      ssl: useSsl ? { require: true, rejectUnauthorized: false } : false
    },
    pool: poolConfig,
    retry: {
      max: 3
    }
  });
  return sequelize;
}

const connectDB = async () => {
  let instance;
  try {
    instance = buildSequelize();
  } catch (e) {
    // Provide clearer diagnostics in serverless logs
    console.error('Failed to build Sequelize instance before authenticate():', e.message);
    throw e; // serverless will surface this
  }
  if (initialized) return instance;
  
  try {
    const activeUrl = resolveDatabaseUrl();
    if (!activeUrl) {
      throw new Error('Missing database connection string (set DATABASE_URL in environment)');
    }
    
    console.log('Database configuration:'.yellow);
    console.log(`Using AWS RDS PostgreSQL (always-on instance)${isVercelServerless ? ' via Vercel serverless' : ''}`.cyan);
    const redacted = activeUrl.replace(/(:\/\/[^:]+:)([^@]+)(@)/, '$1********$3');
    console.log(`Connecting with URL (redacted): ${redacted}`.gray);
    
    // Add connection timeout for serverless environment
    const connectTimeout = isVercelServerless ? 15000 : 30000; // 15s for Vercel, 30s for others
    const authPromise = instance.authenticate();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Database connection timeout after ${connectTimeout}ms`)), connectTimeout);
    });
    
    await Promise.race([authPromise, timeoutPromise]);
    
    console.log('✅ AWS RDS PostgreSQL Connected'.cyan.underline);
    initialized = true;
    return instance;
  } catch (error) {
    console.error(`Error connecting to AWS RDS PostgreSQL: ${error.message}`.red.bold);
    console.error('Troubleshooting checklist:');
    console.error('1. Ensure the DATABASE_URL is set in Vercel project settings');
    console.error('2. Confirm the AWS RDS security group allows connections from 0.0.0.0/0');
    console.error('3. Make sure AWS RDS instance is running and publicly accessible');
    console.error('4. Verify the connection string format and credentials');
    console.error('5. Check if the database accepts new connections (connection limit)');
    
    // Log additional debug info for serverless
    if (isVercelServerless) {
      console.error('Vercel serverless environment detected');
      console.error('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);
      console.error('Available memory:', process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE || 'unknown');
    }
    
    if (isVercelServerless) {
      // In Vercel serverless do NOT exit; throw so the platform can return a 500 and we can retry on next invocation
      throw error;
    } else {
      process.exit(1);
    }
  }
};

module.exports = { connectDB, sequelize: buildSequelize() };
