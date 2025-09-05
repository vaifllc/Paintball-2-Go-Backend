const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Register user
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], AuthController.register);

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], AuthController.login);

// Get current user
router.get('/me', protect, AuthController.getProfile);

// Update user profile
router.put('/profile', protect, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email')
], AuthController.updateProfile);

// Logout
router.post('/logout', protect, AuthController.logout);

// Forgot password
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], AuthController.forgotPassword);

// Reset password
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], AuthController.resetPassword);

// Change password (for logged in users)
router.put('/change-password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], AuthController.changePassword);

// Verify email
router.get('/verify-email/:token', AuthController.verifyEmail);

// Resend verification email
router.post('/resend-verification', protect, AuthController.resendVerification);

module.exports = router;