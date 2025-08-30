const bcrypt = require('bcryptjs');
const { Teacher, Student } = require('../models');
const { logger } = require('./logger');

/**
 * Sync password from Firebase to database
 * This should be called when a user successfully authenticates via Firebase
 * but their database password might be outdated (e.g., after Firebase password reset)
 */
const syncPasswordToDatabase = async (email, newPassword, userType = 'teacher') => {
  try {
    logger.info(`Syncing password to database for ${userType}: ${email}`);
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update the appropriate model
    let Model = userType === 'teacher' ? Teacher : Student;
    const whereClause = userType === 'student' ? { id: email } : { email };
    
    const user = await Model.findOne({ where: whereClause });
    
    if (user) {
      await user.update({ password: hashedPassword });
      logger.info(`Password synced successfully for ${userType}: ${email}`);
      return true;
    } else {
      logger.warn(`User not found in database for password sync: ${email}`);
      return false;
    }
  } catch (error) {
    logger.error(`Error syncing password for ${email}:`, error);
    return false;
  }
};

/**
 * Create a password reset endpoint that updates both Firebase and database
 */
const resetPasswordBoth = async (email, newPassword, userType = 'teacher') => {
  try {
    // First update Firebase (this would typically be done via Firebase Admin SDK)
    // For now, we'll assume Firebase password was already reset via email
    
    // Then sync to database
    const synced = await syncPasswordToDatabase(email, newPassword, userType);
    
    if (synced) {
      logger.info(`Password reset completed for ${userType}: ${email}`);
      return { success: true, message: 'Password reset successfully' };
    } else {
      logger.error(`Failed to sync password to database for ${userType}: ${email}`);
      return { success: false, message: 'Password reset failed' };
    }
  } catch (error) {
    logger.error(`Error in password reset for ${email}:`, error);
    return { success: false, message: 'Password reset failed' };
  }
};

module.exports = {
  syncPasswordToDatabase,
  resetPasswordBoth
};