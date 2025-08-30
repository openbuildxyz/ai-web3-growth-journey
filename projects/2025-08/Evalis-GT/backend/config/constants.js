/**
 * Application Constants
 * 
 * This file centralizes application constants to avoid hardcoded values
 * throughout the server codebase.
 */

// Default admin credentials for seeder - these should only be used for development
const DEFAULT_ADMIN = {
  username: 'admin',
  name: 'Administrator',
  email: 'admin@example.com',
  password: process.env.DEFAULT_ADMIN_PASSWORD || 'zyExeKhXoMFtd1Gc',
  role: 'admin'
};

// Database defaults - only used if environment variables are not set
const DATABASE_DEFAULTS = {
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
  name: 'evalis',
  user: 'postgres',
  password: '',
  ssl: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

// User roles
const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student'
};

// Default port
const DEFAULT_PORT = 3000;

module.exports = {
  DEFAULT_ADMIN,
  DATABASE_DEFAULTS,
  USER_ROLES,
  DEFAULT_PORT
}; 