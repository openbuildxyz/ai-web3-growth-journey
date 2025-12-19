const nodemailer = require('nodemailer');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

// Basic validation of required env vars
const missingEmailVars = [];
['EMAIL_USER','EMAIL_PASS'].forEach(k => { if (!process.env[k]) missingEmailVars.push(k); });

const EMAIL_DRY_RUN = process.env.EMAIL_DRY_RUN === 'true';

const transporterConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
};

if (missingEmailVars.length) {
  console.warn('[emailUtils] Missing email env vars:', missingEmailVars.join(', '));
}
console.log('[emailUtils] Transporter config (sanitized):', {
  host: transporterConfig.host,
  port: transporterConfig.port,
  secure: transporterConfig.secure,
  userPresent: !!transporterConfig.auth.user,
  passPresent: !!transporterConfig.auth.pass,
  dryRun: EMAIL_DRY_RUN
});

let transporter = null;
try {
  if (!EMAIL_DRY_RUN) {
    transporter = nodemailer.createTransport(transporterConfig);
  }
} catch (e) {
  console.error('[emailUtils] Failed to create transporter:', e.message);
  if (missingEmailVars.length) {
    console.error('[emailUtils] Missing environment variables prevented transporter creation:', missingEmailVars.join(', '));
  }
}

/**
 * Generate a secure random password
 */
const generateSecurePassword = (length = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

/**
 * Generate a secure reset token
 */
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Send welcome email with password setup for new users
 * @param {Object} user - User object with email, name, role
 * @param {string} temporaryPassword - Generated temporary password  
 * @param {string} resetLink - Password reset link
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendWelcomeEmail = async (user, temporaryPassword, resetLink) => {
  if (!user.email) {
    throw new Error('User email is required');
  }

  const mailOptions = {
    from: `"Evalis Admin" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Welcome to Evalis - Account Setup Required',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333;">Welcome to Evalis, ${user.name}!</h2>
        
        <p>Your ${user.role} account has been created successfully. To get started, you'll need to set up your password.</p>
        
        <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #495057;">Account Details:</h3>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Role:</strong> ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
          <p><strong>User ID:</strong> ${user.id || 'Generated automatically'}</p>
          <p><strong>Temporary Password:</strong> <code style="background-color: #e9ecef; padding: 2px 6px; border-radius: 4px;">${temporaryPassword}</code></p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #007bff; color: white; text-decoration: none; padding: 12px 30px; border-radius: 5px; display: inline-block;">Set Up Your Password</a>
        </div>
        
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Important:</strong> Please change your password after your first login for security reasons.</p>
        </div>
        
        <p>If you're unable to click the button above, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #007bff;">${resetLink}</p>
        
        <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
        
        <p style="color: #6c757d; font-size: 14px;">
          If you didn't expect this email, please contact your administrator.<br>
          This email was sent from the Evalis administration system.
        </p>
      </div>
    `,
  };

  try {
    if (EMAIL_DRY_RUN || !transporter) {
      console.log(`[emailUtils] DRY RUN - welcome email NOT sent to ${user.email}`);
      return { messageId: 'dry-run', accepted: [user.email] };
    }
    const info = await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${user.email}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

/**
 * Send an email with login credentials to a student
 * @param {Object} student - Student object with email, name, and credentials
 * @param {string} student.email - Student's email address
 * @param {string} student.name - Student's name
 * @param {string} student.id - Student's ID
 * @param {string} password - Generated password
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendLoginCredentials = async (student, password) => {
  if (!student.email) {
    throw new Error('Student email is required');
  }

  const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;

  const mailOptions = {
    from: `"Evalis Admin" <${process.env.EMAIL_USER}>`,
    to: student.email,
    subject: 'Your Evalis Account Credentials',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333;">Welcome to Evalis, ${student.name}!</h2>
        <p>Your account has been created in the Evalis grading system. Below are your login credentials:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Student ID:</strong> ${student.id}</p>
          <p><strong>Password:</strong> ${password}</p>
        </div>
        <p>Please log in at <a href="${loginUrl}" style="color: #007bff;">${loginUrl}</a></p>
        <p>For security reasons, we recommend that you change your password after your first login.</p>
        <p>If you have any questions, please contact your administrator.</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="font-size: 12px; color: #777;">This is an automated message, please do not reply.</p>
      </div>
    `,
  };

  try {
    if (EMAIL_DRY_RUN || !transporter) {
      console.log(`[emailUtils] DRY RUN - login credentials email NOT sent to ${student.email}`);
      return { messageId: 'dry-run', accepted: [student.email] };
    }
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${student.email}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send a password reset link to a user
 * @param {Object} user - User object with email and name
 * @param {string} user.email - User's email address
 * @param {string} user.name - User's name
 * @param {string} resetLink - Password reset link
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendPasswordResetLink = async (user, resetLink) => {
  if (!user.email) {
    throw new Error('User email is required');
  }

  const mailOptions = {
    from: `"Evalis Admin" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Reset Your Evalis Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333;">Hello ${user.name || 'User'},</h2>
        <p>You have been requested to reset your password for your Evalis account.</p>
        <p>Please click the link below to set up a new password:</p>
        <div style="margin: 20px 0;">
          <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </div>
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>If you did not request a password reset, please contact your administrator immediately.</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="font-size: 12px; color: #777;">This is an automated message, please do not reply.</p>
      </div>
    `,
  };

  try {
    if (EMAIL_DRY_RUN || !transporter) {
      console.log(`[emailUtils] DRY RUN - password reset email NOT sent to ${user.email}`);
      return { messageId: 'dry-run', accepted: [user.email] };
    }
    const info = await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${user.email}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

module.exports = {
  generateSecurePassword,
  generateResetToken,
  sendWelcomeEmail,
  sendLoginCredentials,
  sendPasswordResetLink,
}; 