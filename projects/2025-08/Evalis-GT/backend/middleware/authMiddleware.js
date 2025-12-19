const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { Student, Teacher, Admin } = require('../models');
const { validateSession } = require('../utils/sessionManager');
const { verifyClerkToken, mapClerkUserToLocal } = require('../utils/clerk');
const { logger } = require('../utils/logger');

// Enhanced token cache with user role separation to prevent conflicts
// Key format: "token:role" to ensure different user types don't conflict
const tokenCache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds (increased from 15 minutes)

// Periodically clean expired cache entries
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of tokenCache.entries()) {
    if (now > value.expiresAt) {
      tokenCache.delete(key);
    }
  }
}, 60000); // Clean every minute

// Middleware to protect routes that require authentication
const protect = asyncHandler(async (req, res, next) => {
  let token;
  
  // Skip detailed logging in production to improve performance
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    logger.debug('Auth middleware checking token...');
    logger.debug('Headers:', req.headers.authorization ? 'Authorization header present' : 'No authorization header');
  }
  
  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      if (!token) {
        logger.warn('Token is empty or invalid');
        res.status(401);
        throw new Error('Not authorized, invalid token');
      }

      // Check cache first - but with role-specific key to prevent conflicts
      let cachedUser = null;
      let userRole = null;
      
      // Try to decode token first to get role information
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userRole = decoded.role;
        const cacheKey = `${token}:${userRole}`;
        cachedUser = tokenCache.get(cacheKey);
      } catch (err) {
        // Token invalid, will be handled below
      }
      
      if (cachedUser && cachedUser.expiresAt > Date.now()) {
        // Use cached user info
        req.user = cachedUser.user;
        req.user.role = cachedUser.role;
        
        // Set role-specific property
        if (cachedUser.role === 'student') req.student = cachedUser.user;
        if (cachedUser.role === 'teacher') req.teacher = cachedUser.user;
        if (cachedUser.role === 'admin') req.admin = cachedUser.user;
        
        if (isDev) logger.debug(`User authenticated from cache: ${req.user.id}, role: ${req.user.role}`);
        return next();
      }
      
      if (isDev) console.log('Token extracted from header: [REDACTED]');
      
      // First try Clerk session token (primary auth provider)
      try {
        const desiredRoleHeader = req.headers['x-portal-role'] || req.headers['x-user-role'] || '';
        const desiredRole = Array.isArray(desiredRoleHeader) ? desiredRoleHeader[0] : desiredRoleHeader;
        const clerkUser = await verifyClerkToken(token);
        if (clerkUser) {
          const mapped = await mapClerkUserToLocal(clerkUser, { Student, Teacher, Admin }, { desiredRole });
          if (mapped) {
            const { user, role } = mapped;
            req.user = user;
            req.user.role = role;
            if (role === 'student') req.student = user;
            if (role === 'teacher') req.teacher = user;
            if (role === 'admin') req.admin = user;
            // Cache
            const cacheKey = `${token}:${role}`;
            tokenCache.set(cacheKey, { user, role, expiresAt: Date.now() + CACHE_TTL });
            if (isDev) logger.debug(`User authenticated via Clerk: ${user.id}, role: ${role}`);
            return next();
          } else {
            // If Clerk verified but no DB match, don't fall through to JWT
            if (isDev) logger.debug('Valid Clerk session but no matching DB user for desired role:', desiredRole || '(none)');
            return res.status(403).json({ message: 'Access denied: account not linked to this portal' });
          }
        }
      } catch (clerkErr) {
        if (isDev) logger.debug(`Clerk verification failed: ${clerkErr.message || clerkErr}`);
        // continue to JWT
      }

      // Then try to verify as a JWT token (legacy)
      try {
        // Decode JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('JWT token verified, user role:', decoded.role);
        
        // Check if the user exists in any of the models
        // Check user role from the token to determine which model to use
        const role = decoded.role || '';
        let user;
        
        if (role === 'student') {
          user = await Student.findOne({ 
            where: { id: decoded.id },
            attributes: { exclude: ['password'] }
          });
          
          if (user) {
            req.user = user;
            req.user.role = 'student';
            req.student = user;
            logger.info('User authenticated as student:', req.user.id);
            
            // Cache the user with role-specific key
            const cacheKey = `${token}:student`;
            tokenCache.set(cacheKey, {
              user,
              role: 'student',
              expiresAt: Date.now() + CACHE_TTL
            });
            
            return next();
          }
        } else if (role === 'teacher') {
          user = await Teacher.findOne({ 
            where: { id: decoded.id },
            attributes: { exclude: ['password'] }
          });
          
          if (user) {
            req.user = user;
            req.user.role = 'teacher';
            req.teacher = user;
            logger.info('User authenticated as teacher:', req.user.id);
            
            // Cache the user with role-specific key
            const cacheKey = `${token}:teacher`;
            tokenCache.set(cacheKey, {
              user,
              role: 'teacher',
              expiresAt: Date.now() + CACHE_TTL
            });
            
            return next();
          }
        } else if (role === 'admin') {
          // Support both legacy tokens (using admin numeric id) and new tokens (using username)
          user = await Admin.findOne({ 
            where: { username: decoded.id },
            attributes: { exclude: ['password'] }
          });
          if (!user) {
            // Fallback: try by primary key id if decoded.id was numeric ID
            user = await Admin.findOne({
              where: { id: decoded.id },
              attributes: { exclude: ['password'] }
            });
          }
          
          if (user) {
            req.user = user;
            req.user.role = 'admin';
            req.admin = user;
            logger.info('User authenticated as admin:', req.user.username);
            
            // Cache the user with role-specific key
            const cacheKey = `${token}:admin`;
            tokenCache.set(cacheKey, {
              user,
              role: 'admin',
              expiresAt: Date.now() + CACHE_TTL
            });
            
            return next();
          }
        } else {
          // If no role or unrecognized role, try all models
          logger.debug('No specific role found in token, trying all models...');
          
          // First try student model
          user = await Student.findOne({ 
            where: { id: decoded.id },
            attributes: { exclude: ['password'] }
          });
          
          if (user) {
            req.user = user;
            req.user.role = 'student';
            req.student = user;
            logger.info('User authenticated as student:', req.user.id);
            
            // Cache the user with role-specific key
            const cacheKey = `${token}:student`;
            tokenCache.set(cacheKey, {
              user,
              role: 'student',
              expiresAt: Date.now() + CACHE_TTL
            });
            
            return next();
          }

          // If not found in students, try teacher model
          user = await Teacher.findOne({ 
            where: { id: decoded.id },
            attributes: { exclude: ['password'] }
          });

          if (user) {
            req.user = user;
            req.user.role = 'teacher';
            req.teacher = user;
            logger.info('User authenticated as teacher:', req.user.id);
            
            // Cache the user with role-specific key
            const cacheKey = `${token}:teacher`;
            tokenCache.set(cacheKey, {
              user,
              role: 'teacher',
              expiresAt: Date.now() + CACHE_TTL
            });
            
            return next();
          }

          // Finally try admin model (by username first, then id fallback)
          user = await Admin.findOne({ 
            where: { username: decoded.id },
            attributes: { exclude: ['password'] }
          }) || await Admin.findOne({
            where: { id: decoded.id },
            attributes: { exclude: ['password'] }
          });

          if (user) {
            req.user = user;
            req.user.role = 'admin';
            req.admin = user;
            logger.info('User authenticated as admin:', req.user.username);
            
            // Cache the user with role-specific key
            const cacheKey = `${token}:admin`;
            tokenCache.set(cacheKey, {
              user,
              role: 'admin',
              expiresAt: Date.now() + CACHE_TTL
            });
            
            return next();
          }
        }

        // If user not found in any model
        console.log('No user found with decoded ID:', decoded.id);
        res.status(404);
        throw new Error('User not found');
      } catch (jwtError) {
        if (isDev) logger.debug(`JWT token verification error: ${jwtError.message}`);
        throw new Error('Invalid token format');
      }
    } catch (error) {
      console.error('Token verification error:', error.message);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    console.log('No token provided in Authorization header');
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Middleware to check if user is an admin
const admin = (req, res, next) => {
  console.log('Checking admin rights...');
  console.log('User:', req.user ? `ID: ${req.user.id}, Role: ${req.user.role}` : 'No user in request');
  
  if (req.user && req.user.role === 'admin') {
    console.log('Admin access granted');
    next();
  } else {
    console.log('Admin access denied');
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
};

// Alias for admin middleware - alternative naming for better readability
const adminOnly = admin;

// Middleware to check if user is a teacher
const teacher = (req, res, next) => {
  if (req.user && (req.user.role === 'teacher' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as a teacher');
  }
};

// Middleware to check if user is a student
const student = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as a student');
  }
};

module.exports = { protect, admin, adminOnly, teacher, student }; 