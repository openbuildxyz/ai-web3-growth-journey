# Security Configuration

## IMPORTANT: Security Changes Made

This document outlines the critical security fixes applied to the Evalis-GT project.

### 🔐 Authentication & Authorization

#### JWT Configuration
- **JWT Secret**: Changed from weak placeholder to cryptographically secure random string
- **Token Expiration**: Reduced from 30 days to 24 hours for better security
- **Location**: `/server/utils/generateToken.js` and environment variables

#### Admin Credentials
- **Default Password**: Changed from `admin123` to secure random password `zyExeKhXoMFtd1Gc`
- **Environment Variable**: `DEFAULT_ADMIN_PASSWORD` added to `.env`
- **Files Updated**: 
  - `/server/config/constants.js`
  - `/server/createAdmin.js`
  - `/server/seeder.js`
  - `/server/verifyAdmin.js`
  - `/server/checkAdmin.js`

### 🚫 Rate Limiting

#### Authentication Endpoints
- **Rate Limit**: 5 login attempts per minute per IP address
- **General API**: 100 requests per minute per IP address
- **Files**: `/server/middleware/rateLimitMiddleware.js`, `/server/routes/authRoutes.js`

### 🔒 Information Disclosure Prevention

#### Logging Security
- Removed sensitive data from console logs:
  - JWT tokens no longer logged in full
  - Database connection strings masked
  - Firebase credentials masked
  - Authentication details redacted

#### Database Security
- **Connection String**: Removed hardcoded database URL
- **Environment Requirement**: `DATABASE_URL` now required in environment variables
- **File**: `/server/config/db.js`

### 🛡️ Environment Variables

#### Required Variables (.env)
```bash
# Authentication
JWT_SECRET=EukAVLW0gwUxUC7tK+SYm5uvmuNAv9CQiyNs/LusHVIHpf8D9lk/Spn2/HwmZUoAnYSaBoYNT5jtfDx4QQn2Jw==
JWT_EXPIRE=24h

# Admin Configuration
DEFAULT_ADMIN_PASSWORD=zyExeKhXoMFtd1Gc

# Database (REQUIRED)
DATABASE_URL=your-actual-database-connection-string
```

### ⚠️ IMMEDIATE ACTION REQUIRED

1. **Change Admin Password**: 
   ```bash
   # Update the admin password in your .env file
   DEFAULT_ADMIN_PASSWORD=your-new-secure-password
   ```

2. **Set Database URL**:
   ```bash
   # Add your actual database connection string
   DATABASE_URL=your-actual-database-connection-string
   ```

3. **Regenerate JWT Secret** (if deploying to production):
   ```bash
   # Generate new JWT secret
   openssl rand -base64 64
   ```

### 🔧 Additional Security Recommendations

#### Still Need to Implement:
- [ ] Input validation on all endpoints
- [ ] HTTPS enforcement
- [ ] CSRF protection
- [ ] Password complexity requirements
- [ ] Account lockout mechanism
- [ ] Security headers (HSTS, CSP, etc.)
- [ ] API request size limits
- [ ] Session management improvements

#### API Security:
- [ ] Move API keys to server-side
- [ ] Implement proper API authentication
- [ ] Add request signing for sensitive operations

### 📝 Login Information

After applying these changes:
- **Username**: `admin`
- **Password**: `zyExeKhXoMFtd1Gc` (or your custom password from `DEFAULT_ADMIN_PASSWORD`)

### 🔄 Next Steps

1. Test the application with new credentials
2. Update any deployment scripts with new environment variables
3. Implement additional security measures as recommended
4. Consider using a proper secrets management system for production

## Support

If you encounter any issues with these security changes, please check:
1. All environment variables are properly set
2. Database connection is working
3. Admin credentials are updated in your environment

Remember to never commit sensitive credentials to version control!
