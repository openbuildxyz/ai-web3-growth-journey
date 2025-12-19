# AWS RDS Migration Guide

## Overview
This guide will help you migrate your Evalis-GT project from Neon DB to AWS RDS PostgreSQL.

## Prerequisites

### 1. AWS Account Setup
- AWS account with appropriate permissions
- AWS CLI installed and configured
- Access to AWS RDS console

### 2. Create AWS RDS PostgreSQL Instance

#### Step 1: Create RDS Instance via AWS Console
1. Go to AWS RDS Console
2. Click "Create database"
3. Choose "Standard create"
4. Engine type: PostgreSQL
5. Version: PostgreSQL 15.x or later (compatible with your current setup)
6. Templates: Choose based on your needs (Production, Dev/Test, or Free tier)

#### Step 2: Configure Database Settings
```
DB instance identifier: evalis-production
Master username: evalis_admin
Master password: [Generate secure password]
DB name: evalis
```

#### Step 3: Instance Configuration
```
DB instance class: db.t3.micro (Free tier) or db.t3.small (Production)
Storage type: General Purpose SSD (gp2)
Allocated storage: 20 GB (minimum)
Enable storage autoscaling: Yes
Maximum storage threshold: 100 GB
```

#### Step 4: Connectivity
```
VPC: Default VPC
Subnet group: default
Public access: Yes (for initial setup, restrict later)
VPC security groups: Create new
Security group name: evalis-db-sg
```

#### Step 5: Database Authentication
```
Database authentication: Password authentication
```

#### Step 6: Additional Configuration
```
Initial database name: evalis
Backup retention period: 7 days
Enable automated backups: Yes
Backup window: Choose your preferred time
Maintenance window: Choose your preferred time
Enable deletion protection: Yes (for production)
```

### 3. Security Group Configuration
After creating the RDS instance, configure the security group:

1. Go to EC2 Console > Security Groups
2. Find the security group for your RDS instance
3. Edit inbound rules:
   - Type: PostgreSQL
   - Protocol: TCP
   - Port: 5432
   - Source: Your IP address (for initial setup)
   - Source: 0.0.0.0/0 (for production - be cautious)

## Migration Process

### Step 1: Environment Variables Setup

Create new environment variables for AWS RDS:

```bash
# AWS RDS Configuration
AWS_RDS_DATABASE_URL=postgresql://evalis_admin:your_password@your-rds-endpoint.region.rds.amazonaws.com:5432/evalis?sslmode=require

# Keep old Neon DB URL for backup
NEON_DATABASE_URL=postgresql://neondb_owner:npg_l7FkjwKLA4Yf@ep-autumn-bonus-a15zt06x-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

### Step 2: Data Export from Neon DB

Run the data export script:
```bash
npm run export:neondb
```

### Step 3: Data Import to AWS RDS

Run the data import script:
```bash
npm run import:awsrds
```

### Step 4: Update Environment Variables

Update your environment files:
- `.env` (local development)
- `.env.production`
- Vercel dashboard (for production deployment)

### Step 5: Test the Migration

Run verification scripts:
```bash
npm run test:db
npm run verify:awsrds
```

### Step 6: Update Production Deployment

Update your production environment variables in:
- Vercel dashboard
- Any CI/CD pipelines
- Docker configurations

## Rollback Plan

If migration fails, you can quickly rollback by:
1. Reverting the `DATABASE_URL` to the original Neon DB URL
2. Running the application with the old database

## Cost Considerations

### AWS RDS Pricing (approximate)
- **Free Tier**: db.t3.micro with 20GB storage - Free for 12 months
- **Production**: db.t3.small - ~$25-30/month
- **Storage**: $0.115 per GB-month for gp2

### Neon DB vs AWS RDS Comparison
| Feature | Neon DB | AWS RDS |
|---------|---------|---------|
| Serverless | Yes | No (but Aurora Serverless available) |
| Scaling | Automatic | Manual (with autoscaling) |
| Pricing | Pay-per-use | Always on |
| Management | Fully managed | Managed (requires some configuration) |
| Backup | Automatic | Configurable |
| Global availability | Limited regions | Global |

## Security Best Practices

### 1. Network Security
- Use VPC with private subnets for production
- Configure security groups with minimal required access
- Enable SSL/TLS encryption

### 2. Database Security
- Use strong passwords
- Enable encryption at rest
- Enable encryption in transit
- Regular security updates

### 3. Access Control
- Use IAM roles for application access
- Implement least privilege principle
- Regular access reviews

## Monitoring and Maintenance

### 1. CloudWatch Monitoring
- Enable Enhanced Monitoring
- Set up CloudWatch alarms for:
  - CPU utilization
  - Database connections
  - Storage space

### 2. Performance Insights
- Enable Performance Insights for query analysis
- Monitor slow queries
- Track database performance metrics

### 3. Backup Strategy
- Automated daily backups
- Point-in-time recovery
- Cross-region backup replication (if needed)

## Troubleshooting

### Common Issues

1. **Connection Timeout**
   - Check security group settings
   - Verify endpoint URL
   - Check VPC configuration

2. **SSL Connection Issues**
   - Ensure `sslmode=require` in connection string
   - Verify RDS instance has SSL enabled

3. **Performance Issues**
   - Monitor connection pool size
   - Check query performance
   - Consider connection pooling (PgBouncer)

### Migration Scripts Location
- Export script: `server/scripts/exportNeonDB.js`
- Import script: `server/scripts/importToAWSRDS.js`
- Verification script: `server/scripts/verifyAWSRDS.js`
