const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const { PasswordResetToken, Student, Teacher, Admin } = require('../models');

/**
 * @desc    Reset password using token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPasswordWithToken = asyncHandler(async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide token, new password, and confirm password'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Find the reset token
    const resetToken = await PasswordResetToken.findOne({
      where: {
        token,
        used: false,
        expiresAt: {
          [require('sequelize').Op.gt]: new Date()
        }
      }
    });

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Find the user based on role
    let user;
    let Model;
    
    switch (resetToken.userRole) {
      case 'student':
        Model = Student;
        break;
      case 'teacher':
        Model = Teacher;
        break;
      case 'admin':
        Model = Admin;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid user role'
        });
    }

    user = await Model.findOne({
      where: {
        [resetToken.userRole === 'admin' ? 'username' : 'id']: resetToken.userId
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password
    await user.update({ password: hashedPassword });

    // Mark the token as used
    await resetToken.update({ used: true });

    res.json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
      data: {
        role: resetToken.userRole,
        loginUrl: `/${resetToken.userRole}/sign-in`
      }
    });

  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
});

/**
 * @desc    Validate reset token
 * @route   GET /api/auth/validate-reset-token/:token
 * @access  Public
 */
const validateResetToken = asyncHandler(async (req, res) => {
  try {
    const { token } = req.params;

    const resetToken = await PasswordResetToken.findOne({
      where: {
        token,
        used: false,
        expiresAt: {
          [require('sequelize').Op.gt]: new Date()
        }
      },
      include: [
        {
          model: resetToken?.userRole === 'student' ? Student : 
                 resetToken?.userRole === 'teacher' ? Teacher : Admin,
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    res.json({
      success: true,
      data: {
        valid: true,
        userRole: resetToken.userRole,
        expiresAt: resetToken.expiresAt
      }
    });

  } catch (error) {
    console.error('Error validating reset token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate reset token'
    });
  }
});

module.exports = {
  resetPasswordWithToken,
  validateResetToken
};
