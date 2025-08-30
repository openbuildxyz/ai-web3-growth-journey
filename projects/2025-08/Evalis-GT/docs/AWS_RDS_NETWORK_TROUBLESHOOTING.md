# AWS RDS Network Troubleshooting Guide

## Current Issue
Connection timeout to AWS RDS despite security group allowing all IPs (0.0.0.0/0).

## Possible Causes & Solutions

### 1. Check RDS Public Accessibility
**Problem**: RDS instance might be in private subnet without public access.

**Steps to Fix**:
1. Go to AWS RDS Console
2. Click on your database `database-1`
3. Go to "Connectivity & security" tab
4. Look for "Public accessibility" - it should say "Yes"
5. If it says "No", you need to modify the instance:
   - Click "Modify" button
   - Under "Connectivity", change "Public accessibility" to "Yes"
   - Click "Continue" → "Modify DB instance"

### 2. Check VPC and Subnet Groups
**Problem**: Database might be in wrong VPC or subnet group.

**Steps to Check**:
1. In RDS "Connectivity & security" tab, note the:
   - VPC ID
   - Subnet group
   - Availability zone
2. The subnet group should have subnets in multiple AZs
3. At least one subnet should be "public" (has internet gateway route)

### 3. Check Route Tables
**Problem**: Subnet might not have route to internet gateway.

**Steps to Check**:
1. Go to VPC Console → Subnets
2. Find the subnets used by your DB subnet group
3. Check Route Tables - should have route 0.0.0.0/0 → igw-xxxxx

### 4. Alternative Solution: Use RDS Proxy or VPN
If the above doesn't work, consider:
- Setting up RDS Proxy for public access
- Using AWS VPN or Direct Connect
- Migrating to a publicly accessible RDS instance

## Quick Test Commands

Test if the endpoint is reachable:
```bash
# Test if port is open (should timeout if blocked)
nc -zv database-1.c1qsmac4e5xd.ap-southeast-2.rds.amazonaws.com 5432

# Test DNS resolution
nslookup database-1.c1qsmac4e5xd.ap-southeast-2.rds.amazonaws.com
```

## Next Steps
1. ✅ Security group configured (0.0.0.0/0)
2. 🔄 Check public accessibility setting
3. 🔄 Verify VPC/subnet configuration
4. 🔄 Test connection again
