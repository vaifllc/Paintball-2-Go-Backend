const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { EmailService } = require('../services/emailService');
const { validationResult } = require('express-validator');

class AuthController {
  // Register new user
  static async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { name, email, password, role = 'user' } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      // Create user
      const user = new User({
        name,
        email,
        password,
        role
      });

      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      // Send welcome email
      try {
        await EmailService.sendWelcomeEmail(email, name);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail registration if email fails
      }

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Login user
  static async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Check if user exists
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated. Please contact support.'
        });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Get current user profile
  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin,
          profile: user.profile,
          preferences: user.preferences,
          loyaltyPoints: user.loyaltyPoints,
          membershipTier: user.membershipTier
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const updates = req.body;
      const allowedUpdates = ['name', 'email', 'profile', 'preferences'];
      const filteredUpdates = {};

      // Filter allowed updates
      Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });

      // Check if email is being changed and if it's already taken
      if (filteredUpdates.email) {
        const existingUser = await User.findOne({
          email: filteredUpdates.email,
          _id: { $ne: req.user.id }
        });

        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Email already in use'
          });
        }
      }

      const user = await User.findByIdAndUpdate(
        req.user.id,
        filteredUpdates,
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profile: user.profile,
          preferences: user.preferences
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Logout (client-side token removal)
  static async logout(req, res) {
    try {
      // In a more sophisticated setup, you might want to maintain a blacklist of tokens
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Forgot password
  static async forgotPassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        // Don't reveal if user exists or not for security
        return res.json({
          success: true,
          message: 'If an account with that email exists, a reset link has been sent.'
        });
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { userId: user._id, type: 'password_reset' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Send password reset email
      try {
        await EmailService.sendPasswordResetEmail(email, user.name, resetToken);
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        return res.status(500).json({
          success: false,
          message: 'Failed to send reset email'
        });
      }

      res.json({
        success: true,
        message: 'If an account with that email exists, a reset link has been sent.'
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Reset password
  static async resetPassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { token, newPassword } = req.body;

      try {
        // Verify reset token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.type !== 'password_reset') {
          return res.status(400).json({
            success: false,
            message: 'Invalid reset token'
          });
        }

        // Find user and update password
        const user = await User.findById(decoded.userId);
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }

        user.password = newPassword;
        await user.save();

        res.json({
          success: true,
          message: 'Password reset successfully'
        });
      } catch (tokenError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
      }
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Change password (for logged in users)
  static async changePassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { currentPassword, newPassword } = req.body;

      // Get user with password
      const user = await User.findById(req.user.id).select('+password');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Verify current password
      const isValidPassword = await user.comparePassword(currentPassword);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Verify email
  static async verifyEmail(req, res) {
    try {
      const { token } = req.params;

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId);
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }

        if (user.isEmailVerified) {
          return res.json({
            success: true,
            message: 'Email already verified'
          });
        }

        user.isEmailVerified = true;
        await user.save();

        res.json({
          success: true,
          message: 'Email verified successfully'
        });
      } catch (tokenError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired verification token'
        });
      }
    } catch (error) {
      console.error('Verify email error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Resend verification email
  static async resendVerification(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (user.isEmailVerified) {
        return res.json({
          success: true,
          message: 'Email already verified'
        });
      }

      // Generate verification token
      const verificationToken = jwt.sign(
        { userId: user._id, type: 'email_verification' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Send verification email
      try {
        await EmailService.sendWelcomeEmail(user.email, user.name, verificationToken);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        return res.status(500).json({
          success: false,
          message: 'Failed to send verification email'
        });
      }

      res.json({
        success: true,
        message: 'Verification email sent'
      });
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
}

module.exports = AuthController;