# Neon DB to AWS RDS Migration Tool

This tool provides a complete solution for migrating your Evalis-GT project from Neon DB to AWS RDS PostgreSQL.

## 🎯 Overview

The migration tool includes:
- **Automated data export** from Neon DB
- **Automated data import** to AWS RDS
- **Data integrity verification**
- **Rollback capabilities**
- **Comprehensive logging and reporting**

## 📋 Prerequisites

### 1. AWS RDS Instance
You need to have created an AWS RDS PostgreSQL instance with:
- **Engine**: PostgreSQL 15.x or later
- **Security Group**: Allows inbound connections on port 5432
- **SSL**: Enabled (required)
- **Public Access**: Enabled (for migration, can be restricted later)

### 2. Environment Variables
Required environment variables:
```bash
# Current Neon DB (source)
NEON_DATABASE_URL=postgresql://user:pass@endpoint/db?sslmode=require
# or
DATABASE_URL=postgresql://user:pass@endpoint/db?sslmode=require

# New AWS RDS (destination)
AWS_RDS_DATABASE_URL=postgresql://user:pass@rds-endpoint/db?sslmode=require
```

## 🚀 Quick Start

### Step 1: Setup AWS RDS Configuration
```bash
npm run setup:awsrds
```
This interactive script will:
- Help you configure AWS RDS connection
- Test connectivity to both databases
- Update your `.env` file

### Step 2: Run Complete Migration
```bash
npm run migrate:awsrds
```
This will execute the full migration pipeline:
1. Export data from Neon DB
2. Import data to AWS RDS
3. Verify data integrity
4. Generate migration report

## 🔧 Manual Migration Steps

If you prefer to run steps individually:

### 1. Export Data from Neon DB
```bash
npm run export:neondb
```
- Exports all tables to JSON files
- Creates export metadata
- Stores files in `server/exports/`

### 2. Import Data to AWS RDS
```bash
npm run import:awsrds
```
- Creates database tables
- Imports all exported data
- Handles conflicts with upsert
- Generates import summary

### 3. Verify Migration
```bash
npm run verify:awsrds
```
- Tests database connectivity
- Verifies table structure
- Checks data integrity
- Performs CRUD operations test
- Compares record counts

## 📁 Migration Files

After migration, you'll find these files in `server/exports/`:

```
server/exports/
├── export_metadata.json     # Export summary and metadata
├── import_summary.json      # Import results and statistics
├── verification_report.json # Verification test results
├── admins.json             # Exported admin data
├── batches.json            # Exported batch data
├── students.json           # Exported student data
├── teachers.json           # Exported teacher data
├── assignments.json        # Exported assignment data
├── submissions.json        # Exported submission data
└── ...                     # Other table exports
```

## 🔄 Migration Process Details

### Phase 1: Data Export
- Connects to Neon DB
- Exports all model data to JSON
- Creates metadata with record counts
- Validates export completeness

### Phase 2: Database Setup
- Connects to AWS RDS
- Creates/verifies table structure
- Prepares for data import

### Phase 3: Data Import
- Imports data table by table
- Uses upsert to handle conflicts
- Tracks import statistics
- Handles errors gracefully

### Phase 4: Verification
- Tests all database connections
- Verifies table structure
- Checks data integrity
- Performs CRUD operations test
- Compares source vs destination counts

## 🛡️ Safety Features

### Backup and Rollback
- Original Neon DB remains untouched
- All export files are preserved
- Easy rollback by reverting DATABASE_URL
- Complete audit trail

### Error Handling
- Detailed error reporting
- Graceful failure handling
- Partial migration recovery
- Comprehensive logging

### Data Validation
- Record count verification
- Data type validation
- Referential integrity checks
- CRUD operation testing

## 🔧 Configuration Options

### Environment Variables
```bash
# Migration settings
MIGRATION_MODE=false                    # Keep both connections active
BACKUP_BEFORE_MIGRATION=true          # Create backups before migration
EXPORT_PATH=./server/exports           # Export directory

# AWS RDS specific
DB_POOL_MAX=20                         # Connection pool size
DB_QUERY_TIMEOUT=30000                 # Query timeout (ms)
DB_SSL_REQUIRE=true                    # Require SSL
DB_MONITORING=true                     # Enable monitoring
```

### Advanced Configuration
See `.env.awsrds.example` for complete configuration options.

## 🔍 Troubleshooting

### Common Issues

#### Connection Timeout
```
Error: connect ETIMEDOUT
```
**Solutions:**
- Check AWS RDS security group settings
- Verify VPC and subnet configuration
- Ensure RDS instance is in "available" state

#### Authentication Failed
```
Error: password authentication failed
```
**Solutions:**
- Verify username and password
- Check database name exists
- Ensure user has necessary permissions

#### SSL Connection Issues
```
Error: SSL connection required
```
**Solutions:**
- Add `?sslmode=require` to connection string
- Verify SSL is enabled on RDS instance

#### Table Already Exists
```
Error: relation "table_name" already exists
```
**Solutions:**
- This is normal - tables are created if they don't exist
- Data import uses upsert to handle existing records

### Migration Failures

#### Partial Import
If some tables fail to import:
1. Check the import summary report
2. Manually verify failed tables
3. Re-run specific imports if needed

#### Data Mismatch
If verification shows count mismatches:
1. Check the verification report
2. Identify specific tables with issues
3. Run manual data comparison
4. Re-import specific tables if needed

## 📊 Monitoring and Performance

### AWS RDS Monitoring
After migration, monitor:
- **CPU utilization**
- **Database connections**
- **Storage space**
- **Query performance**

### Performance Optimization
- Enable Performance Insights
- Monitor slow queries
- Optimize connection pooling
- Consider read replicas for scaling

## 💰 Cost Considerations

### AWS RDS Pricing
- **Free Tier**: db.t3.micro (12 months free)
- **Production**: db.t3.small (~$25-30/month)
- **Storage**: ~$0.115 per GB-month

### Cost Optimization
- Use appropriate instance sizes
- Enable storage autoscaling
- Set up automated backups
- Consider Reserved Instances for production

## 🔐 Security Best Practices

### Network Security
- Use VPC with private subnets
- Configure security groups properly
- Restrict database access

### Access Control
- Use strong passwords
- Implement least privilege
- Regular access reviews
- Enable audit logging

### Encryption
- Enable encryption at rest
- Use SSL/TLS for connections
- Secure backup storage

## 📈 Post-Migration Tasks

### 1. Update Application Configuration
```bash
# Update DATABASE_URL to point to AWS RDS
DATABASE_URL=postgresql://user:pass@rds-endpoint/db?sslmode=require
```

### 2. Update Production Environment
- Vercel dashboard environment variables
- CI/CD pipeline configurations
- Docker configurations
- PM2 ecosystem files

### 3. Test Application
- Run full application test suite
- Verify all features work correctly
- Check performance metrics
- Test backup and recovery

### 4. Monitoring Setup
- Configure CloudWatch alerts
- Set up database monitoring
- Enable Performance Insights
- Create backup schedules

## 🆘 Support and Recovery

### Getting Help
1. Check migration logs in `server/exports/`
2. Review verification reports
3. Check AWS RDS logs in CloudWatch
4. Test individual components

### Emergency Rollback
```bash
# Quickly rollback to Neon DB
export DATABASE_URL=$NEON_DATABASE_URL
npm start
```

### Data Recovery
- Export files are preserved
- Original Neon DB is untouched
- AWS RDS point-in-time recovery available
- Manual data export/import tools included

## 📚 Additional Resources

- [AWS RDS Documentation](https://docs.aws.amazon.com/rds/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Sequelize Documentation](https://sequelize.org/)
- [Migration Best Practices](./AWS_RDS_MIGRATION.md)

---

## 🎉 Migration Complete!

After successful migration:
1. ✅ All data migrated to AWS RDS
2. ✅ Application updated to use new database
3. ✅ Monitoring and backups configured
4. ✅ Security settings optimized
5. ✅ Performance monitoring enabled

Your Evalis-GT application is now running on AWS RDS with improved scalability, reliability, and management capabilities!
