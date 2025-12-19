const express = require('express');
const { logger } = require('../utils/logger');
const { connectDB } = require('../config/db');
const os = require('os');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Health check endpoint
router.get('/health', async (req, res) => {
  const startTime = Date.now();
  const healthStatus = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks: {}
  };

  try {
    // Database health check
    try {
      const { sequelize } = require('../models');
      await sequelize.authenticate();
      healthStatus.checks.database = {
        status: 'OK',
        message: 'Database connection successful'
      };
    } catch (dbError) {
      healthStatus.checks.database = {
        status: 'ERROR',
        message: dbError.message
      };
      healthStatus.status = 'ERROR';
    }

    // Memory usage check
    const memUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const memoryUsagePercent = ((totalMemory - freeMemory) / totalMemory) * 100;
    
    healthStatus.checks.memory = {
      status: memoryUsagePercent > 90 ? 'WARNING' : 'OK',
      usage: {
        rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
        systemUsage: Math.round(memoryUsagePercent) + '%'
      }
    };

    // Disk space check
    try {
      const stats = fs.statSync(__dirname);
      healthStatus.checks.disk = {
        status: 'OK',
        message: 'Disk accessible'
      };
    } catch (diskError) {
      healthStatus.checks.disk = {
        status: 'ERROR',
        message: 'Disk access error'
      };
      healthStatus.status = 'ERROR';
    }

    // Response time
    healthStatus.responseTime = Date.now() - startTime + 'ms';

    // Set appropriate status code
    const statusCode = healthStatus.status === 'OK' ? 200 : 503;
    
    res.status(statusCode).json(healthStatus);
    
    // Log health check if there are issues
    if (healthStatus.status !== 'OK') {
      logger.warn('Health check failed', healthStatus);
    }

  } catch (error) {
    logger.error('Health check error:', error);
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Readiness probe (for Kubernetes)
router.get('/ready', async (req, res) => {
  try {
    // Check if application is ready to serve traffic
    const { sequelize } = require('../models');
    await sequelize.authenticate();
    
    res.status(200).json({
      status: 'READY',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'NOT_READY',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Liveness probe (for Kubernetes)
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'ALIVE',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// System metrics endpoint
router.get('/metrics', (req, res) => {
  const metrics = {
    timestamp: new Date().toISOString(),
    system: {
      platform: os.platform(),
      architecture: os.arch(),
      cpus: os.cpus().length,
      loadAverage: os.loadavg(),
      uptime: os.uptime(),
      hostname: os.hostname()
    },
    process: {
      pid: process.pid,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      version: process.version,
      nodeVersion: process.versions.node
    },
    application: {
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0'
    }
  };

  res.json(metrics);
});

module.exports = router;
