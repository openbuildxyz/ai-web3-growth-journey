# AWS RDS Connection Troubleshooting

## Connection Error: ETIMEDOUT

Your AWS RDS instance is not accepting connections. This is typically due to security group configuration.

### Step-by-Step Fix:

#### 1. Check Your Current IP Address
```bash
curl -s https://checkip.amazonaws.com
```
Or visit: https://whatismyipaddress.com/

#### 2. Update RDS Security Group

1. **Go to AWS Console** → **RDS** → **Databases**
2. **Click on your database:** `database-1`
3. **Go to "Connectivity & security" tab**
4. **Click on your VPC security group** (usually named something like `default` or `rds-launch-wizard-X`)

#### 3. Add Inbound Rule
1. **Click "Edit inbound rules"**
2. **Click "Add rule"**
3. **Configure the rule:**
   - **Type:** PostgreSQL
   - **Protocol:** TCP
   - **Port:** 5432
   - **Source:** 
     - For testing: `0.0.0.0/0` (allows all IPs - **NOT recommended for production**)
     - For security: `YOUR_IP_ADDRESS/32` (replace with your actual IP)

#### 4. Save the Rule
- Click **"Save rules"**
- Wait 1-2 minutes for changes to take effect

### Security Recommendations

#### For Development/Testing:
```
Type: PostgreSQL
Port: 5432
Source: 0.0.0.0/0
Description: Temporary - All IPs (REMOVE after testing)
```

#### For Production:
```
Type: PostgreSQL
Port: 5432
Source: YOUR_IP/32
Description: Your specific IP only
```

### Alternative: Use Your Current IP
1. Find your IP: `curl -s https://checkip.amazonaws.com`
2. Add rule with source: `YOUR_IP/32`

### Test Connection After Fix
Once you've updated the security group, run:
```bash
npm run migrate:awsrds
```

### If Still Having Issues:

#### Check VPC Configuration:
1. Ensure RDS is in a **public subnet** if connecting from internet
2. Check **Route Table** has internet gateway route (0.0.0.0/0 → igw-xxxxx)
3. Verify **Network ACLs** allow port 5432

#### Check RDS Settings:
1. **Public accessibility:** Should be "Yes" for external connections
2. **DB port:** Should be 5432
3. **VPC:** Note which VPC it's in

### Current Connection Details:
- **Endpoint:** database-1.c1qsmac4e5xd.ap-southeast-2.rds.amazonaws.com
- **Port:** 5432
- **Region:** ap-southeast-2 (Sydney)
- **Username:** postgres
- **Password:** Lpkoji1920

### Quick Test Command:
After fixing security group, test with:
```bash
nc -zv database-1.c1qsmac4e5xd.ap-southeast-2.rds.amazonaws.com 5432
```

If this returns "Connection succeeded", your network connection is working.
