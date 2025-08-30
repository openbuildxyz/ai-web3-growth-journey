# Fresh Neon DB Setup Instructions

## After creating your new Neon DB project:

### Step 1: Update Environment Variables
Replace the DATABASE_URL in your `.env` file with your new Neon DB connection string:
```
DATABASE_URL=postgresql://username:password@your-new-neon-endpoint/database?sslmode=require
```

### Step 2: Setup Fresh Database
Run the comprehensive setup script:
```bash
node setupFreshDatabase.js
```

This script will:
- ✅ Create all database tables with proper relationships
- ✅ Seed batches (2020-2024, 2021-2025, 2022-2026, 2023-2027)
- ✅ Seed semesters (8 semesters for each batch)
- ✅ Create default admin user (username: admin, password: from .env)

### Step 3: Verify Database Setup
Run the verification script:
```bash
node verifyDatabase.js
```

### Step 4: Start Your Server
```bash
npm start
```

### Default Admin Credentials
- Username: `admin`
- Password: `zyExeKhXoMFtd1Gc` (from your .env file)

### Available Scripts
- `node setupFreshDatabase.js` - Complete fresh setup
- `node verifyDatabase.js` - Verify database structure
- `node createAdmin.js` - Create additional admin users
- `node server.js` - Start the server

## Troubleshooting
If you encounter any issues:
1. Check your DATABASE_URL is correct
2. Ensure your Neon DB project is active
3. Check network connectivity
4. Verify all dependencies are installed: `npm install`

Your Evalis-GT system will be ready with all dashboards working once these steps are complete!
