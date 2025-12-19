const { clerkClient } = require('@clerk/express');
const { Student, Teacher, Admin } = require('../models');
const { logger } = require('../utils/logger');
const crypto = require('crypto');

/**
 * Migrate existing Firebase users to Clerk
 * This is a one-time migration script that should be run with admin privileges
 */
const migrateFirebaseToClerk = async (req, res) => {
  try {
    logger.info('Starting Firebase to Clerk migration...');
    
    const migrationResults = {
      students: { success: 0, failed: 0, errors: [] },
      teachers: { success: 0, failed: 0, errors: [] },
      admins: { success: 0, failed: 0, errors: [] }
    };

    // Generate random password for migration
    const generateTempPassword = () => {
      return crypto.randomBytes(16).toString('hex');
    };

    // Migrate Students
    const students = await Student.findAll({ where: { email: { [require('sequelize').Op.ne]: null } } });
    logger.info(`Found ${students.length} students to migrate`);
    
    for (const student of students) {
      try {
        if (!student.email) {
          migrationResults.students.errors.push(`Student ${student.id}: No email address`);
          migrationResults.students.failed++;
          continue;
        }

        // Check if already migrated (has clerkId)
        if (student.clerkId) {
          logger.info(`Student ${student.id} already migrated, skipping...`);
          migrationResults.students.success++;
          continue;
        }

        const tempPassword = generateTempPassword();
        const nameParts = (student.name || '').split(' ');
        
        // Create user in Clerk
        const clerkUser = await clerkClient.users.createUser({
          emailAddress: [student.email],
          password: tempPassword,
          firstName: nameParts[0] || 'Student',
          lastName: nameParts.slice(1).join(' ') || '',
          publicMetadata: {
            role: 'student',
            studentId: student.id,
            section: student.section,
            batch: student.batch
          }
        });

        // Update student record with Clerk ID
        await student.update({ clerkId: clerkUser.id });

        // Send password reset email
        try {
          await clerkClient.users.createEmailPasswordReset({
            userId: clerkUser.id,
            expiresInMs: 7 * 24 * 60 * 60 * 1000 // 7 days
          });
        } catch (emailError) {
          logger.warn(`Failed to send password reset for student ${student.id}: ${emailError.message}`);
        }

        migrationResults.students.success++;
        logger.info(`Migrated student: ${student.id} (${student.email})`);
        
      } catch (error) {
        migrationResults.students.failed++;
        migrationResults.students.errors.push(`Student ${student.id}: ${error.message}`);
        logger.error(`Failed to migrate student ${student.id}: ${error.message}`);
      }
    }

    // Migrate Teachers
    const teachers = await Teacher.findAll({ where: { email: { [require('sequelize').Op.ne]: null } } });
    logger.info(`Found ${teachers.length} teachers to migrate`);
    
    for (const teacher of teachers) {
      try {
        if (!teacher.email) {
          migrationResults.teachers.errors.push(`Teacher ${teacher.id}: No email address`);
          migrationResults.teachers.failed++;
          continue;
        }

        // Check if already migrated (has clerkId)
        if (teacher.clerkId) {
          logger.info(`Teacher ${teacher.id} already migrated, skipping...`);
          migrationResults.teachers.success++;
          continue;
        }

        const tempPassword = generateTempPassword();
        const nameParts = (teacher.name || '').split(' ');
        
        // Create user in Clerk
        const clerkUser = await clerkClient.users.createUser({
          emailAddress: [teacher.email],
          password: tempPassword,
          firstName: nameParts[0] || 'Teacher',
          lastName: nameParts.slice(1).join(' ') || '',
          publicMetadata: {
            role: 'teacher'
          }
        });

        // Update teacher record with Clerk ID
        await teacher.update({ clerkId: clerkUser.id });

        // Send password reset email
        try {
          await clerkClient.users.createEmailPasswordReset({
            userId: clerkUser.id,
            expiresInMs: 7 * 24 * 60 * 60 * 1000 // 7 days
          });
        } catch (emailError) {
          logger.warn(`Failed to send password reset for teacher ${teacher.id}: ${emailError.message}`);
        }

        migrationResults.teachers.success++;
        logger.info(`Migrated teacher: ${teacher.id} (${teacher.email})`);
        
      } catch (error) {
        migrationResults.teachers.failed++;
        migrationResults.teachers.errors.push(`Teacher ${teacher.id}: ${error.message}`);
        logger.error(`Failed to migrate teacher ${teacher.id}: ${error.message}`);
      }
    }

    // Migrate Admins
    const admins = await Admin.findAll({ where: { email: { [require('sequelize').Op.ne]: null } } });
    logger.info(`Found ${admins.length} admins to migrate`);
    
    for (const admin of admins) {
      try {
        if (!admin.email) {
          migrationResults.admins.errors.push(`Admin ${admin.id}: No email address`);
          migrationResults.admins.failed++;
          continue;
        }

        // Check if already migrated (has clerkId)
        if (admin.clerkId) {
          logger.info(`Admin ${admin.id} already migrated, skipping...`);
          migrationResults.admins.success++;
          continue;
        }

        const tempPassword = generateTempPassword();
        const nameParts = (admin.name || '').split(' ');
        
        // Create user in Clerk
        const clerkUser = await clerkClient.users.createUser({
          emailAddress: [admin.email],
          password: tempPassword,
          firstName: nameParts[0] || 'Admin',
          lastName: nameParts.slice(1).join(' ') || '',
          publicMetadata: {
            role: 'admin',
            username: admin.username
          }
        });

        // Update admin record with Clerk ID
        await admin.update({ clerkId: clerkUser.id });

        // Send password reset email
        try {
          await clerkClient.users.createEmailPasswordReset({
            userId: clerkUser.id,
            expiresInMs: 7 * 24 * 60 * 60 * 1000 // 7 days
          });
        } catch (emailError) {
          logger.warn(`Failed to send password reset for admin ${admin.id}: ${emailError.message}`);
        }

        migrationResults.admins.success++;
        logger.info(`Migrated admin: ${admin.id} (${admin.email})`);
        
      } catch (error) {
        migrationResults.admins.failed++;
        migrationResults.admins.errors.push(`Admin ${admin.id}: ${error.message}`);
        logger.error(`Failed to migrate admin ${admin.id}: ${error.message}`);
      }
    }

    logger.info('Firebase to Clerk migration completed');
    
    res.json({
      message: 'Migration completed',
      results: migrationResults,
      summary: {
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalAdmins: admins.length,
        successfulMigrations: migrationResults.students.success + migrationResults.teachers.success + migrationResults.admins.success,
        failedMigrations: migrationResults.students.failed + migrationResults.teachers.failed + migrationResults.admins.failed
      }
    });

  } catch (error) {
    logger.error(`Migration error: ${error.message}`);
    res.status(500).json({
      error: 'Migration failed',
      message: error.message
    });
  }
};

module.exports = {
  migrateFirebaseToClerk
};
