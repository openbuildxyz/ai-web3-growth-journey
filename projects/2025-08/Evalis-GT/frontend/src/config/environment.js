/**
 * Frontend Environment Configuration
 * 
 * This file centralizes all environment-specific configuration
 * to avoid hardcoded values throughout the application.
 */

// Will determine MODE / NODE_ENV after capturing viteEnv below
let NODE_ENV = 'development';

// Allow explicit override via Vite env (safe access)
let viteEnv = {};
try {
  // In Vite / ESM this will succeed
  // eslint-disable-next-line no-undef
  viteEnv = import.meta.env || {};
  NODE_ENV = viteEnv.MODE || (viteEnv.PROD ? 'production' : NODE_ENV);
} catch (e) {
  // Fallback for non-Vite contexts (tests, SSR) if ever needed
  if (typeof process !== 'undefined' && process.env) {
    // eslint-disable-next-line no-undef
    viteEnv = process.env;
    NODE_ENV = viteEnv.NODE_ENV || NODE_ENV;
  }
}
let explicitBase = viteEnv?.VITE_API_BASE_URL || null;
const explicitPort = viteEnv?.VITE_API_PORT || null;

// Detect dev API port dynamically: if running Vite (5173/5174 etc.) prefer 3001 (our server port)
let detectedDevPort = '3000';
if (typeof window !== 'undefined') {
  const lp = window.location.port;
  if (['5173','5174','5175'].includes(lp)) {
    detectedDevPort = '3000'; // Development server port
  }
}

const devPort = explicitPort || detectedDevPort;

// Function to get the appropriate API base URL.
// Removed legacy override that forced admins to port 5003 (no server listening -> Network Error).
// All roles now share the same API in dev unless explicitly overridden via VITE_API_BASE_URL.
// In production builds, ignore explicitly configured localhost API base (common misconfig during build)
if (NODE_ENV === 'production' && explicitBase && /localhost|127\.0\.0\.1/i.test(explicitBase)) {
  // eslint-disable-next-line no-console
  console.warn('[environment] Ignoring VITE_API_BASE_URL pointing to localhost in production build:', explicitBase);
  explicitBase = null;
}

// Derive production base dynamically to work on any Vercel preview/custom domain when no explicit base
const resolveProdBase = () => {
  if (explicitBase) return explicitBase.endsWith('/api') ? explicitBase : `${explicitBase.replace(/\/$/, '')}/api`;
  try {
    if (typeof window !== 'undefined' && window.location) {
      return '/api'; // relative keeps same origin (works with rewrites)
    }
  } catch (_) { /* ignore */ }
  return '/api';
};

const getApiBaseUrl = () => ({
  development: explicitBase || `http://localhost:${devPort}/api`,
  test: explicitBase || `http://localhost:${devPort}/api`,
  production: resolveProdBase()
}[NODE_ENV]);

// Function to get the correct base URL for files and static assets
const getFileBaseUrl = () => ({
  development: explicitBase || `http://localhost:${devPort}`,
  test: explicitBase || `http://localhost:${devPort}`,
  production: '' // Use relative URLs in production (same domain)
}[NODE_ENV]);

// API URLs based on environment (runtime-friendly for dev)
let API_BASE_URL = getApiBaseUrl();
const FILE_BASE_URL = getFileBaseUrl();

// Admin API now unified with main API (previous separate 5003 server disabled)
const ADMIN_API_BASE_URL = API_BASE_URL;

// Export environment configuration
// Safety fallback: if we ended up with a localhost API in a non-local host (e.g. Vercel preview/prod), switch to relative /api
if (NODE_ENV === 'production' && /localhost|127\.0\.0\.1/.test(API_BASE_URL) && typeof window !== 'undefined' && window.location && !/localhost|127\.0\.0\.1/.test(window.location.host)) {
  // eslint-disable-next-line no-console
  console.warn('[environment] Overriding localhost API_BASE_URL to relative /api for deployed host');
  API_BASE_URL = '/api';
}

const config = {
  API_BASE_URL,
  FILE_BASE_URL,
  ADMIN_API_BASE_URL,
  CLERK: {
    PUBLISHABLE_KEY: viteEnv?.VITE_CLERK_PUBLISHABLE_KEY || undefined,
  },
  API_ENDPOINTS: {
    AUTH: {
      STUDENT_LOGIN: `${API_BASE_URL}/auth/student/login`,
      TEACHER_LOGIN: `${API_BASE_URL}/auth/teacher/login`,
      TEACHER_SETUP_PASSWORD: `${API_BASE_URL}/auth/teacher/setup-password`,
      ADMIN_LOGIN: `${API_BASE_URL}/auth/admin/login`,
      PROFILE: `${API_BASE_URL}/auth/profile`,
    },
    TEACHERS: {
      BASE: `${API_BASE_URL}/teachers`,
      IMPORT: `${API_BASE_URL}/teachers/import-excel`,
    },
    STUDENTS: {
      BASE: `${API_BASE_URL}/students`,
      IMPORT: `${API_BASE_URL}/students/import-excel`,
    },
    SUBJECTS: `${API_BASE_URL}/subjects`,
    BATCHES: `${API_BASE_URL}/batches`,
    ASSIGNMENTS: `${API_BASE_URL}/assignments`,
    SUBMISSIONS: `${API_BASE_URL}/submissions`,
    SEMESTERS: `${API_BASE_URL}/semesters`,
    AI_ANALYZER: {
      BASE: `${API_BASE_URL}/ai-analyzer`,
      STUDENT_ANALYSIS: `${API_BASE_URL}/ai-analyzer/student`,
      SUBJECT_ANALYSIS: `${API_BASE_URL}/ai-analyzer/student/subject`,
      RECOMMENDATIONS: `${API_BASE_URL}/ai-analyzer/student/recommendations`,
      COMPREHENSIVE_DATA: `${API_BASE_URL}/ai-analyzer/comprehensive-data`,
      PREDICTIVE_ANALYSIS: `${API_BASE_URL}/ai-analyzer/predictive`,
    },
  },
  AUTH: {
    TOKEN_STORAGE_KEY: 'userToken',
    USER_STORAGE_KEY: 'user',
    CURRENT_USER_KEY: 'currentUser',
  },
  AI: {
    GOOGLE_API_KEY: viteEnv?.VITE_GOOGLE_API_KEY || 'AIzaSyAJWaYgEsLh6siG5rpb91GaEh662J-lvFM',
    GOOGLE_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
  },
  // Helper function to get file URLs with correct base
  getFileUrl: (fileUrl) => {
    if (!fileUrl) return '';
    // If fileUrl is already absolute, use as-is
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }
    // Otherwise, prepend the appropriate base URL
    return `${FILE_BASE_URL}${fileUrl}`;
  }
};

export default config; 