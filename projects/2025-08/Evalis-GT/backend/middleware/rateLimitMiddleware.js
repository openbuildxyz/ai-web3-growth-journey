/**
 * Rate Limiting Middleware
 * 
 * Simple in-memory rate limiting to prevent API abuse and server overload.
 * For production, consider using Redis or a dedicated rate-limiting service.
 */

const requestCounts = new Map();
const authRequestCounts = new Map();
const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 100; // Adjust as needed
const AUTH_MAX_REQUESTS_PER_WINDOW = 5; // Stricter limit for auth endpoints

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now - data.startTime > WINDOW_MS) {
      requestCounts.delete(key);
    }
  }
  for (const [key, data] of authRequestCounts.entries()) {
    if (now - data.startTime > WINDOW_MS) {
      authRequestCounts.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean every 5 minutes

const rateLimit = (req, res, next) => {
  // Skip rate limiting in development mode
  if (process.env.NODE_ENV === 'development' && process.env.SKIP_RATE_LIMIT === 'true') {
    return next();
  }
  
  // Get client IP or use fallback
  const clientIp = req.headers['x-forwarded-for'] || 
                  req.connection.remoteAddress || 
                  'unknown';
                  
  // Include token in key if authenticated to enforce per-user limits
  const token = req.headers.authorization ? 
    req.headers.authorization.split(' ')[1].substring(0, 10) : '';
  const key = `${clientIp}-${token}`;
  
  const now = Date.now();
  
  if (!requestCounts.has(key)) {
    // First request from this client
    requestCounts.set(key, {
      count: 1,
      startTime: now
    });
    return next();
  }
  
  const clientData = requestCounts.get(key);
  
  // Reset counter if window has passed
  if (now - clientData.startTime > WINDOW_MS) {
    clientData.count = 1;
    clientData.startTime = now;
    return next();
  }
  
  // Increment and check
  clientData.count++;
  
  if (clientData.count > MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({ 
      success: false,
      message: 'Too many requests, please try again later.'
    });
  }
  
  next();
};

// Strict rate limiting for authentication endpoints
const authRateLimit = (req, res, next) => {
  const key = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!authRequestCounts.has(key)) {
    authRequestCounts.set(key, {
      count: 1,
      startTime: now
    });
    return next();
  }
  
  const clientData = authRequestCounts.get(key);
  
  // Reset counter if window has passed
  if (now - clientData.startTime > WINDOW_MS) {
    clientData.count = 1;
    clientData.startTime = now;
    return next();
  }
  
  // Increment and check
  clientData.count++;
  
  if (clientData.count > AUTH_MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({ 
      success: false,
      message: 'Too many authentication attempts, please try again later.'
    });
  }
  
  next();
};

module.exports = { rateLimit, authRateLimit }; 