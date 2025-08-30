const express = require('express');
const { sessionManager } = require('../utils/sessionManager');
const { logger } = require('../utils/logger');
const router = express.Router();
const { admin } = require('../middleware/authMiddleware');
const os = require('os');

/**
 * @desc    Get system metrics and monitoring data
 * @route   GET /api/admin/monitoring
 * @access  Admin only
 */
router.get('/monitoring', admin, (req, res) => {
  try {
    const systemMetrics = {
      timestamp: new Date().toISOString(),
      system: {
        platform: os.platform(),
        architecture: os.arch(),
        cpuCount: os.cpus().length,
        totalMemory: Math.round(os.totalmem() / 1024 / 1024 / 1024 * 100) / 100 + ' GB',
        freeMemory: Math.round(os.freemem() / 1024 / 1024 / 1024 * 100) / 100 + ' GB',
        loadAverage: os.loadavg(),
        uptime: Math.round(os.uptime() / 3600 * 100) / 100 + ' hours',
        hostname: os.hostname()
      },
      process: {
        pid: process.pid,
        uptime: Math.round(process.uptime() / 3600 * 100) / 100 + ' hours',
        memoryUsage: {
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
          heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
          external: Math.round(process.memoryUsage().external / 1024 / 1024) + ' MB'
        },
        cpuUsage: process.cpuUsage(),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV
      },
      sessions: sessionManager.getSessionStats(),
      activeSessions: sessionManager.getActiveSessions()
    };

    res.json(systemMetrics);
  } catch (error) {
    logger.error('Error getting monitoring data:', error);
    res.status(500).json({ error: 'Failed to retrieve monitoring data' });
  }
});

/**
 * @desc    Get application logs
 * @route   GET /api/admin/logs
 * @access  Admin only
 */
router.get('/logs', admin, (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const { level = 'error', limit = 100 } = req.query;
    const logFile = level === 'error' ? 'error.log' : 'combined.log';
    const logPath = path.join(__dirname, '../logs', logFile);
    
    if (!fs.existsSync(logPath)) {
      return res.json({ logs: [] });
    }
    
    const logs = fs.readFileSync(logPath, 'utf8')
      .split('\n')
      .filter(line => line.trim())
      .slice(-limit)
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return { message: line, timestamp: new Date().toISOString() };
        }
      });
    
    res.json({ logs });
  } catch (error) {
    logger.error('Error reading logs:', error);
    res.status(500).json({ error: 'Failed to retrieve logs' });
  }
});

/**
 * @desc    Force logout a user session
 * @route   POST /api/admin/force-logout
 * @access  Admin only
 */
router.post('/force-logout', admin, (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const result = sessionManager.invalidateSession(userId);
    
    if (result) {
      logger.info(`Admin ${req.user.username} force logged out user ${userId}`);
      res.json({ message: `User ${userId} has been logged out` });
    } else {
      res.status(404).json({ error: 'User session not found' });
    }
  } catch (error) {
    logger.error('Error force logging out user:', error);
    res.status(500).json({ error: 'Failed to logout user' });
  }
});

/**
 * @desc    Get database health and statistics
 * @route   GET /api/admin/database-stats
 * @access  Admin only
 */
router.get('/database-stats', admin, async (req, res) => {
  try {
    const { sequelize, Student, Teacher, Admin, Subject, Batch, Assignment, Submission } = require('../models');
    
    // Get connection info
    const dialect = sequelize.getDialect();
    const databaseVersion = await sequelize.getDatabaseVersion();
    
    // Get table counts
    const stats = await Promise.all([
      Student.count(),
      Teacher.count(),
      Admin.count(),
      Subject.count(),
      Batch.count(),
      Assignment.count(),
      Submission.count()
    ]);
    
    const [studentCount, teacherCount, adminCount, subjectCount, batchCount, assignmentCount, submissionCount] = stats;
    
    // Test connection
    await sequelize.authenticate();
    
    res.json({
      connection: {
        dialect,
        version: databaseVersion,
        status: 'connected'
      },
      tables: {
        students: studentCount,
        teachers: teacherCount,
        admins: adminCount,
        subjects: subjectCount,
        batches: batchCount,
        assignments: assignmentCount,
        submissions: submissionCount
      },
      total: studentCount + teacherCount + adminCount + subjectCount + batchCount + assignmentCount + submissionCount
    });
  } catch (error) {
    logger.error('Error getting database stats:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve database statistics',
      connection: { status: 'error', message: error.message }
    });
  }
});

module.exports = router;
