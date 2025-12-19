# Evalis-GT Production Deployment Guide

This guide covers the complete production deployment setup for the Evalis-GT application with enterprise-grade features including load balancing, monitoring, logging, and automatic deployments.

## 🚀 Features Added

### 🔒 Security & Session Management
- **Fixed concurrent login issues** - Multiple users can now login simultaneously without session conflicts
- **Enhanced session management** - Proper session isolation between students and teachers
- **Secure authentication** - JWT tokens with session validation
- **Rate limiting** - Protection against brute force attacks

### 📊 Monitoring & Logging
- **Structured logging** with Winston
- **Health check endpoints** for monitoring
- **System metrics** and performance monitoring
- **Admin dashboard** for real-time monitoring
- **Error tracking** and log aggregation

### 🐳 Containerization & Deployment
- **Docker containerization** for consistent deployments
- **Docker Compose** for multi-service orchestration
- **Nginx load balancer** with SSL termination
- **Automated CI/CD pipeline** with GitHub Actions
- **Zero-downtime deployments** with health checks

### ⚡ Performance & Scalability
- **Process clustering** with PM2
- **Redis caching** for session management
- **Database connection pooling**
- **Static file caching**
- **Graceful shutdown** handling

## 📋 Prerequisites

1. **Node.js** 18+ installed
2. **Docker** and **Docker Compose** installed
3. **PostgreSQL** database (we recommend Neon, Supabase, or AWS RDS)
4. **Domain name** with SSL certificate
5. **Server** with at least 2GB RAM and 20GB storage

## 🛠️ Installation & Setup

### 1. Clone and Setup

```bash
git clone https://github.com/anntmishra/Evalis-GT.git
cd Evalis-GT

# Install dependencies
npm install
cd server && npm install && cd ..

# Copy environment template
cp .env.example .env
```

### 2. Environment Configuration

Edit `.env` file with your production values:

```bash
# Required - Update these values
NODE_ENV=production
DATABASE_URL=your-postgresql-connection-string
JWT_SECRET=your-super-secure-jwt-secret-32-chars-minimum
DEFAULT_ADMIN_PASSWORD=your-secure-admin-password
FRONTEND_URL=https://your-domain.com

# Optional - Firebase (if using Firebase auth)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="your-private-key"

# Email configuration (for notifications)
SMTP_HOST=smtp.your-provider.com
SMTP_USER=your-email@domain.com
SMTP_PASS=your-email-password
```

### 3. Database Setup

```bash
# Test database connection
npm run test:db

# Setup database and create admin
npm run create:admin

# Seed initial data (optional)
npm run seed:batches
```

### 4. Build Application

```bash
# Build frontend
npm run build

# Install production dependencies only
npm run production:install
```

## 🚀 Deployment Options

### Option 1: Docker Deployment (Recommended)

```bash
# Build and start with Docker Compose
docker-compose up -d

# Check health
curl http://localhost:3000/api/health

# View logs
docker-compose logs -f app
```

### Option 2: PM2 Deployment

```bash
# Install PM2 globally
npm install -g pm2

# Start application with PM2
npm run pm2:start

# Monitor
npm run pm2:monit

# View logs
npm run pm2:logs
```

### Option 3: Manual Script Deployment

```bash
# Make deployment script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh deploy

# Check health
./deploy.sh health

# View logs
./deploy.sh logs
```

## 🔧 Configuration Files

### Docker Configuration
- `Dockerfile` - Container definition
- `docker-compose.yml` - Multi-service orchestration
- `.dockerignore` - Files to exclude from Docker build

### Process Management
- `ecosystem.config.json` - PM2 configuration
- `deploy.sh` - Production deployment script

### Web Server
- `nginx.conf` - Nginx load balancer configuration

### CI/CD
- `.github/workflows/ci-cd.yml` - GitHub Actions pipeline

## 📊 Monitoring & Health Checks

### Health Endpoints
- `GET /api/health` - Application health check
- `GET /api/ready` - Readiness probe (Kubernetes)
- `GET /api/live` - Liveness probe (Kubernetes)
- `GET /api/metrics` - System metrics

### Admin Monitoring (Admin login required)
- `GET /api/admin/monitoring` - System and session statistics
- `GET /api/admin/logs` - Application logs
- `GET /api/admin/database-stats` - Database statistics
- `POST /api/admin/force-logout` - Force logout a user

### Log Files
- `server/logs/error.log` - Error logs
- `server/logs/combined.log` - All logs
- `server/logs/pm2-*.log` - PM2 process logs

## 🔒 Security Features

### Authentication & Sessions
- JWT tokens with secure session management
- Session isolation between user types
- Automatic session cleanup
- Force logout capability for admins

### Rate Limiting
- API rate limiting (100 requests per 15 minutes)
- Auth rate limiting (5 login attempts per 15 minutes)
- Configurable limits via environment variables

### Security Headers
- HTTPS enforcement
- CORS protection
- XSS protection
- Content type validation

## 🚦 Load Testing

Test your deployment with concurrent users:

```bash
# Install artillery for load testing
npm install -g artillery

# Create load test script
echo "config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: 'Health Check'
    requests:
      - get:
          url: '/api/health'" > loadtest.yml

# Run load test
artillery run loadtest.yml
```

## 🔄 CI/CD Pipeline

The GitHub Actions pipeline automatically:

1. **Tests** the code on push/PR
2. **Builds** the Docker image
3. **Pushes** to GitHub Container Registry
4. **Deploys** to production on main branch

To setup:
1. Enable GitHub Actions in your repository
2. Set up production server webhook (optional)
3. Configure deployment secrets in GitHub

## 📈 Scaling

### Horizontal Scaling
1. **Load Balancer**: Nginx distributes traffic across multiple app instances
2. **Database**: Use read replicas for better performance
3. **File Storage**: Consider cloud storage (AWS S3, etc.) for uploads
4. **Session Store**: Redis for distributed session management

### Vertical Scaling
1. **Memory**: Increase container memory limits
2. **CPU**: Adjust PM2 cluster instances
3. **Database**: Upgrade database instance size

## 🛠️ Maintenance

### Regular Tasks
```bash
# Update application
git pull origin main
npm run build
./deploy.sh deploy

# View logs
./deploy.sh logs

# Backup database
./deploy.sh backup

# Check health
./deploy.sh health
```

### Troubleshooting
```bash
# Check application status
docker-compose ps
# or
pm2 status

# View real-time logs
docker-compose logs -f app
# or
pm2 logs evalis-gt

# Restart services
docker-compose restart
# or
pm2 restart evalis-gt

# Check system resources
docker stats
# or
pm2 monit
```

## 📞 Support

- **Health Check**: `https://your-domain.com/api/health`
- **Admin Dashboard**: Login as admin to access monitoring
- **Logs**: Check `server/logs/` directory for detailed logs
- **Issues**: Create GitHub issues for bugs or feature requests

## 🎯 Performance Benchmarks

Expected performance after optimization:
- **Response Time**: < 200ms for API calls
- **Concurrent Users**: 1000+ simultaneous connections
- **Uptime**: 99.9% with proper monitoring
- **Memory Usage**: < 512MB per instance

---

*This deployment setup provides enterprise-grade reliability, security, and scalability for the Evalis-GT application.*
