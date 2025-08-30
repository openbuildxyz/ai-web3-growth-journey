const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const colors = require('colors');
const { connectDB, sequelize } = require('./config/db');
const { Admin } = require('./models');

// Load environment variables
dotenv.config();

// Parse CLI args
const args = process.argv.slice(2);
const hasFlag = (flag) => args.some(a => a === flag || a.startsWith(`${flag}=`));
const getFlagValue = (flag, fallback) => {
  const entry = args.find(a => a.startsWith(`${flag}=`));
  if (!entry) return fallback;
  const [, val] = entry.split('=');
  return val || fallback;
};

const RESET = hasFlag('--reset');
const PASSWORD_CLI = getFlagValue('--password', null);

// Single source of truth for default password
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
const TARGET_PASSWORD = PASSWORD_CLI || DEFAULT_ADMIN_PASSWORD; // desired password when creating/resetting

const logInfoBlock = (lines) => {
  console.log('──────────────────────────────────────────'.gray);
  lines.forEach(l => console.log(l));
  console.log('──────────────────────────────────────────'.gray);
};

const createOrUpdateAdmin = async () => {
  try {
    console.log('Connecting to database...'.yellow);
    await connectDB();

    const adminUsername = getFlagValue('--username', 'admin');
    const adminEmail = getFlagValue('--email', 'admin@evalis.edu');
    const adminName = getFlagValue('--name', 'Administrator');

    const existingAdmin = await Admin.findOne({ where: { username: adminUsername } });

    if (!existingAdmin) {
      console.log('No existing admin found. Creating new one...'.cyan);
      const newAdmin = await Admin.create({
        username: adminUsername,
        name: adminName,
        email: adminEmail,
        password: TARGET_PASSWORD, // model hook will hash
        role: 'admin'
      });
      logInfoBlock([
        '✅ Admin user created successfully!'.green.bold,
        `Username: ${newAdmin.username}`.green,
        `Email:    ${newAdmin.email}`.green,
        `Password: ${TARGET_PASSWORD}`.green,
        '⚠️  Change this password after first login.'.yellow
      ]);
    } else if (RESET) {
      console.log('Existing admin found. Resetting password...'.cyan);
      existingAdmin.password = TARGET_PASSWORD; // will be hashed by hook
      await existingAdmin.save();
      logInfoBlock([
        '🔁 Admin password reset successfully.'.green,
        `Username: ${existingAdmin.username}`.green,
        `Email:    ${existingAdmin.email}`.green,
        `New Password: ${TARGET_PASSWORD}`.green
      ]);
    } else {
      logInfoBlock([
        'ℹ️  Admin already exists. No changes made.'.yellow,
        `Username: ${existingAdmin.username}`,
        'Use --reset to change the password.'
      ]);
    }

    await sequelize.close();
    console.log('Database connection closed.'.gray);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:'.red, err.message);
    if (sequelize) await sequelize.close();
    process.exit(1);
  }
};

if (require.main === module) {
  createOrUpdateAdmin();
}

module.exports = { createOrUpdateAdmin };