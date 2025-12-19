const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { rateLimit, authRateLimit } = require('./middleware/rateLimitMiddleware');
const models = require('./models');
const { DEFAULT_PORT } = require('./config/constants') ;
const fs = require('fs');
const { logger, requestLogger } = require('./utils/logger');
const healthRoutes = require('./routes/healthRoutes');
const { validateSession } = require('./utils/sessionManager');

// Load environment variables (order matters: base -> env-specific -> local -> extras)
dotenv.config({ path: path.join(__dirname, '../.env') });
// Load environment-specific files if present
const nodeEnv = process.env.NODE_ENV || 'development';
if (nodeEnv === 'development') {
  dotenv.config({ path: path.join(__dirname, '../.env.development') });
} else if (nodeEnv === 'production') {
  dotenv.config({ path: path.join(__dirname, '../.env.production') });
}
// Load local overrides last
dotenv.config({ path: path.join(__dirname, '../.env.local') });
// Optionally load dedicated Clerk env file if present
dotenv.config({ path: path.join(__dirname, '../.env.clerk') });

// Log environment variables
logger.info('Starting Evalis Server...');
logger.info(`Environment: ${process.env.NODE_ENV}`);
logger.info(`Database configured: ${process.env.DATABASE_URL ? 'Yes' : 'No'}`);
logger.info(`Port: ${process.env.PORT || DEFAULT_PORT}`);
logger.info(`Clerk secret configured: ${process.env.CLERK_SECRET_KEY ? 'Yes' : 'No'}`);

// Routes
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const batchRoutes = require('./routes/batchRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const semesterRoutes = require('./routes/semesterRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const governanceRoutes = require('./routes/governanceRoutes');
const { startGovernanceListener } = require('./web3/governanceListener');

// Function to try binding to ports recursively
const startServerOnPort = (app, port, maxAttempts = 10) => {
  if (maxAttempts <= 0) {
    logger.error('Exceeded maximum port attempts. Cannot start server.');
    return Promise.reject(new Error('Max port attempts exceeded'));
  }

  return new Promise((resolve, reject) => {
    const server = app.listen(port)
      .on('listening', () => {
        logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${port}`);
        resolve(server);
      })
      .on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          // If we have remaining attempts, recurse (incremental search mode)
          if (maxAttempts > 1) {
            logger.warn(`Port ${port} is in use, trying port ${parseInt(port,10) + 1}...`);
            server.close();
            startServerOnPort(app, parseInt(port,10) + 1, maxAttempts - 1)
              .then(resolve)
              .catch(reject);
          } else {
            // No remaining attempts for this invocation (e.g. candidatePorts path with maxAttempts=1)
            logger.warn(`Port ${port} is in use (single-attempt mode); moving to next candidate if available.`);
            server.close();
            reject(err); // allow outer candidatePorts loop to continue
          }
        } else {
          logger.error(`Failed to start server: ${err.message}`);
          reject(err);
        }
      });
      
    // Set timeouts for idle connections to prevent resource exhaustion
    server.keepAliveTimeout = 65000; // Close idle connections after 65 seconds
    server.headersTimeout = 66000;   // Slightly longer than keepAliveTimeout
      
    // Set server connection limits if needed
    if (process.env.MAX_CONNECTIONS) {
      server.maxConnections = parseInt(process.env.MAX_CONNECTIONS, 10);
      logger.info(`Server connection limit set to: ${server.maxConnections}`);
    }
      
    // Monitor active connections (development only)
    if (process.env.NODE_ENV === 'development') {
      let connections = 0;
      server.on('connection', () => {
        connections++;
        logger.debug(`New connection established. Total connections: ${connections}`);
      });
      
      // Log when connections are closed
      server.on('close', () => {
        connections--;
        logger.debug(`Connection closed. Total connections: ${connections}`);
      });
    }

    // Graceful shutdown handling
    const gracefulShutdown = (signal) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);
      
      server.close((err) => {
        if (err) {
          logger.error('Error during server shutdown:', err);
          process.exit(1);
        }
        
        logger.info('HTTP server closed.');
        
        // Close database connections
        models.sequelize.close()
          .then(() => {
            logger.info('Database connections closed.');
            process.exit(0);
          })
          .catch((dbErr) => {
            logger.error('Error closing database connections:', dbErr);
            process.exit(1);
          });
      });
      
      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after 30 seconds');
        process.exit(1);
      }, 30000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  });
};

// Connect to database
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Sync models with database
    // In production, you shouldn't use force: true
    const isDev = process.env.NODE_ENV === 'development';
    logger.info(`Syncing database in ${isDev ? 'development' : 'production'} mode...`);
    
    await models.sequelize.sync({ alter: true });
    logger.info('Database synced successfully');
    
    const app = express();
    
    // Request logging middleware (only in development or if explicitly enabled)
    if (isDev || process.env.ENABLE_REQUEST_LOGGING === 'true') {
      app.use(requestLogger);
    }

    // CORS must run BEFORE session validation so even 401 responses get headers
    const devOrigins = ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];
    const rawConfiguredOrigins = (process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : []).filter(Boolean);
    const allowLocalhost = process.env.CORS_ALLOW_LOCALHOST === 'true';

    // Validate and normalize configured origins to avoid runtime URL parsing errors
    const validConfiguredOrigins = [];
    for (const o of rawConfiguredOrigins) {
      const trimmed = o.trim();
      if (!trimmed) continue;
      try {
        const u = new URL(trimmed);
        if (!/^https?:$/.test(u.protocol)) {
          logger.warn(`Ignoring FRONTEND_URL entry (unsupported protocol): ${trimmed}`);
          continue;
        }
        // Normalize by removing trailing slashes
        const normalized = `${u.protocol}//${u.host}`;
        validConfiguredOrigins.push(normalized);
      } catch (e) {
        logger.warn(`Invalid FRONTEND_URL entry ignored: ${trimmed} -> ${e.message}`);
      }
    }

    const baseAllowed = new Set([...(process.env.NODE_ENV === 'development' ? devOrigins : []), ...validConfiguredOrigins]);

    // Expose current allowed origins for debugging
    logger.info(`CORS allowed (base) origins: ${Array.from(baseAllowed).join(', ') || '(none)'}`);
    if (allowLocalhost) logger.info('CORS localhost wildcard enabled');
    if (process.env.CORS_ALLOW_ANY === 'true') logger.warn('CORS_ALLOW_ANY=true (permissive)');

    const corsOriginFn = (origin, callback) => {
      if (!origin) return callback(null, true); // non-browser / curl
      if (baseAllowed.has(origin)) return callback(null, true);
      if (allowLocalhost && /^(http:\/\/localhost:\d+|http:\/\/127\.0\.0\.1:\d+)/.test(origin)) return callback(null, true);
      if (process.env.CORS_ALLOW_ANY === 'true') return callback(null, true);
      logger.debug(`CORS reject origin: ${origin}`);
      return callback(new Error(`CORS blocked for origin ${origin}`));
    };

    app.use(cors({
      origin: corsOriginFn,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Portal-Role', 'X-User-Role'],
      exposedHeaders: ['Content-Type'],
      maxAge: 86400
    }));

    // Session validation AFTER CORS
    app.use(validateSession);

    // Manual OPTIONS handler for reliability (uses same logic as primary CORS)
    app.options('*', (req, res) => {
      const origin = req.headers.origin;
      if (!origin) {
        return res.sendStatus(204);
      }
      corsOriginFn(origin, (err) => {
        if (!err) {
          res.header('Access-Control-Allow-Origin', origin);
          res.header('Vary', 'Origin');
        }
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Portal-Role, X-User-Role');
        res.sendStatus(204);
      });
    });
    app.use(express.json({ limit: process.env.MAX_FILE_SIZE || '10mb' })); // Configurable JSON payload size
    app.use(express.urlencoded({ extended: true, limit: process.env.MAX_FILE_SIZE || '10mb' })); // Configurable form data size
    
    // Apply rate limiting
    app.use(rateLimit);
    
    // Health check routes (before other routes)
    app.use('/api', healthRoutes);
    
    // Serve static files from the uploads directory - use absolute path
    const uploadsPath = path.join(__dirname, 'uploads');
    logger.debug('Serving uploads from:', uploadsPath);
    app.use('/uploads', express.static(uploadsPath));
    
    // Also serve from /api/uploads to handle frontend requests that include /api prefix
    app.use('/api/uploads', express.static(uploadsPath));
    logger.debug('Also serving uploads from /api/uploads (for frontend compatibility)');
    
    // Also try with relative path as fallback
    app.use('/uploads', express.static('backend/uploads'));
    logger.debug('Also serving uploads from: backend/uploads (relative path)');
    
    // Add a test endpoint for uploads
    app.get('/api/check-uploads', (req, res) => {
      const files = [];
      try {
        if (fs.existsSync(uploadsPath)) {
          const items = fs.readdirSync(uploadsPath);
          items.forEach(item => {
            const itemPath = path.join(uploadsPath, item);
            if (fs.statSync(itemPath).isDirectory()) {
              const subItems = fs.readdirSync(itemPath);
              files.push(`Directory ${item}: ${subItems.length} files`);
              subItems.forEach(subItem => {
                files.push(`  - ${subItem}`);
              });
            } else {
              files.push(`File: ${item}`);
            }
          });
        } else {
          files.push('Uploads directory does not exist');
        }
      } catch (error) {
        files.push(`Error reading uploads: ${error.message}`);
      }
      
      res.json({
        uploadsPath,
        exists: fs.existsSync(uploadsPath),
        files
      });
    });
    
    // Debug route to inspect current CORS configuration (development only)
    if (process.env.NODE_ENV === 'development') {
      app.get('/api/debug/cors-origins', (req, res) => {
        res.json({
          baseAllowed: Array.from(baseAllowed),
          allowLocalhost,
            allowAny: process.env.CORS_ALLOW_ANY === 'true',
          rawConfiguredOrigins,
          validConfiguredOrigins
        });
      });
    }

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/students', studentRoutes);
    app.use('/api/teachers', teacherRoutes);
    app.use('/api/subjects', subjectRoutes);
    app.use('/api/batches', batchRoutes);
    app.use('/api/submissions', submissionRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/semesters', semesterRoutes);
    app.use('/api/assignments', assignmentRoutes);
    const web3Routes = require('./routes/web3Routes');
    app.use('/api/web3', web3Routes);
    const certificateRoutes = require('./routes/certificateRoutes');
    app.use('/api/certificates', certificateRoutes);
  app.use('/api/governance', governanceRoutes);
    
    // Optionally start on-chain governance listener
    if (process.env.GOVERNOR_ADDRESS && process.env.CHAIN_RPC_URL) {
      startGovernanceListener({ rpcUrl: process.env.CHAIN_RPC_URL, governorAddress: process.env.GOVERNOR_ADDRESS })
        .then(() => logger.info('Governance listener started'))
        .catch((e) => logger.warn('Governance listener failed to start: ' + e.message));
    }

    // Test route for debugging CORS issues
    app.get('/api/test', (req, res) => {
      res.json({ message: 'CORS is working properly!' });
    });
    
    // Error middleware
    app.use(notFound);
    app.use(errorHandler);
    
    // Port selection logic
        // Support a FIXED_PORT to disable auto-increment logic (useful for docker / predictable local dev)
        if (process.env.FIXED_PORT) {
          const fixed = parseInt(process.env.FIXED_PORT,10);
          if (!isNaN(fixed)) {
            logger.info(`FIXED_PORT detected (${fixed}) - skipping candidate/auto increment logic`);
            await startServerOnPort(app, fixed, 1);
            return; // Stop further port logic
          }
        }

        const initialPort = parseInt(process.env.PORT) || DEFAULT_PORT;
    const candidatePorts = (process.env.PORT_CANDIDATES || '')
      .split(',')
      .map(p => p.trim())
      .filter(Boolean)
      .map(p => parseInt(p, 10))
      .filter(n => !isNaN(n) && n > 0 && n < 65536);

    if (candidatePorts.length) {
      logger.info(`Attempting candidate ports (PORT_CANDIDATES): ${candidatePorts.join(', ')}`);
      let started = false;
      for (const p of candidatePorts) {
        try {
          await startServerOnPort(app, p, 1); // single attempt for each specified port
          started = true;
          break;
        } catch (e) {
          logger.warn(`Failed to bind candidate port ${p}: ${e.code || e.message}`);
        }
      }
      if (!started) {
        logger.warn('All candidate ports failed, falling back to incremental search starting at ' + initialPort);
        await startServerOnPort(app, initialPort);
      } else {
        logger.info('Server started on one of the candidate ports successfully.');
      }
    } else {
      // Start the server with incremental retry mechanism
      await startServerOnPort(app, initialPort);
    }
  } catch (error) {
    logger.error(`Error starting server: ${error.message}`);
    process.exit(1);
  }
};

startServer();