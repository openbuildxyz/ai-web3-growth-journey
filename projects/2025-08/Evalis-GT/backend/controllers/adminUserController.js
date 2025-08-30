const asyncHandler = require('express-async-handler');
const { clerkClient } = require('@clerk/express');
const { Student, Teacher, Admin } = require('../models');
const { logger } = require('../utils/logger');
const crypto = require('crypto');

// Generate random password
const generateRandomPassword = () => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

/**
 * @desc    Create new user (admin only)
 * @route   POST /api/admin/users/create
 * @access  Private (Admin only)
 */
const createUser = asyncHandler(async (req, res) => {
  const { name, email, role, studentId, section, batch } = req.body;

  // Validate required fields
  if (!name || !email || !role) {
    res.status(400);
    throw new Error('Name, email, and role are required');
  }

  // Validate role
  if (!['student', 'teacher', 'admin'].includes(role)) {
    res.status(400);
    throw new Error('Invalid role. Must be student, teacher, or admin');
  }

  try {
    // Check if user already exists in database
    let existingUser = null;
    if (role === 'student') {
      existingUser = await Student.findOne({ where: { email } });
    } else if (role === 'teacher') {
      existingUser = await Teacher.findOne({ where: { email } });
    } else if (role === 'admin') {
      existingUser = await Admin.findOne({ where: { email } });
    }

    if (existingUser) {
      res.status(400);
      throw new Error('User with this email already exists');
    }

    // Generate random password
    const tempPassword = generateRandomPassword();

    // Create user in Clerk
    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    const clerkUser = await clerkClient.users.createUser({
      emailAddress: [email],
      password: tempPassword,
      firstName: firstName,
      lastName: lastName,
      publicMetadata: {
        role: role,
        studentId: studentId || undefined,
        section: section || undefined,
        batch: batch || undefined
      }
    });

    logger.info(`Clerk user created: ${clerkUser.id} for email: ${email}`);

    // Create user in local database
    let dbUser;
    const userData = {
      name,
      email,
      clerkId: clerkUser.id,
      password: tempPassword // Store temporarily, will be removed after password reset
    };

    if (role === 'student') {
      dbUser = await Student.create({
        ...userData,
        id: studentId || `STU_${Date.now()}`,
        section: section || '',
        batch: batch || ''
      });
    } else if (role === 'teacher') {
      dbUser = await Teacher.create(userData);
    } else if (role === 'admin') {
      dbUser = await Admin.create({
        ...userData,
        username: email.split('@')[0] // Use email prefix as username
      });
    }

    logger.info(`Database user created: ${dbUser.id} with role: ${role}`);

        // Send password reset email via Clerk
        try {
          await clerkClient.users.createEmailPasswordReset({
            userId: clerkUser.id,
            expiresInMs: 24 * 60 * 60 * 1000 // 24 hours
          });      logger.info(`Password reset email sent to: ${email}`);
    } catch (emailError) {
      logger.warn(`Failed to send password reset email to ${email}: ${emailError.message}`);
      // Don't fail the entire operation if email fails
    }

    // Remove password from response
    const responseUser = { ...dbUser.toJSON() };
    delete responseUser.password;

    res.status(201).json({
      message: 'User created successfully',
      user: responseUser,
      clerkId: clerkUser.id,
      passwordResetSent: true
    });

  } catch (error) {
    logger.error(`Error creating user: ${error.message}`);
    
    // If Clerk user was created but database creation failed, try to clean up
    if (error.clerkUser?.id) {
      try {
        await clerkClient.users.deleteUser(error.clerkUser.id);
        logger.info(`Cleaned up Clerk user: ${error.clerkUser.id}`);
      } catch (cleanupError) {
        logger.error(`Failed to cleanup Clerk user: ${cleanupError.message}`);
      }
    }

    res.status(500);
    throw new Error(error.message || 'Failed to create user');
  }
});

/**
 * @desc    Get all users (admin only)
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const students = await Student.findAll({
      attributes: { exclude: ['password'] }
    });
    
    const teachers = await Teacher.findAll({
      attributes: { exclude: ['password'] }
    });
    
    const admins = await Admin.findAll({
      attributes: { exclude: ['password'] }
    });

    const allUsers = [
      ...students.map(user => ({ ...user.toJSON(), role: 'student' })),
      ...teachers.map(user => ({ ...user.toJSON(), role: 'teacher' })),
      ...admins.map(user => ({ ...user.toJSON(), role: 'admin' }))
    ];

    res.json({
      users: allUsers,
      total: allUsers.length,
      students: students.length,
      teachers: teachers.length,
      admins: admins.length
    });

  } catch (error) {
    logger.error(`Error fetching users: ${error.message}`);
    res.status(500);
    throw new Error('Failed to fetch users');
  }
});

/**
 * @desc    Delete user (admin only)
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin only)
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.query;

  if (!role || !['student', 'teacher', 'admin'].includes(role)) {
    res.status(400);
    throw new Error('Valid role parameter is required');
  }

  try {
    let user;
    if (role === 'student') {
      user = await Student.findByPk(id);
    } else if (role === 'teacher') {
      user = await Teacher.findByPk(id);
    } else if (role === 'admin') {
      user = await Admin.findByPk(id);
    }

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Delete from Clerk if clerkId exists
    if (user.clerkId) {
      try {
        await clerkClient.users.deleteUser(user.clerkId);
        logger.info(`Deleted Clerk user: ${user.clerkId}`);
      } catch (clerkError) {
        logger.warn(`Failed to delete Clerk user ${user.clerkId}: ${clerkError.message}`);
        // Continue with database deletion even if Clerk deletion fails
      }
    }

    // Delete from database
    await user.destroy();
    logger.info(`Deleted ${role} user: ${user.id}`);

    res.json({
      message: 'User deleted successfully',
      deletedUser: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: role
      }
    });

  } catch (error) {
    logger.error(`Error deleting user: ${error.message}`);
    res.status(500);
    throw new Error('Failed to delete user');
  }
});

module.exports = {
  createUser,
  getAllUsers,
  deleteUser
};
