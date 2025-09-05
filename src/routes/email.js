const express = require('express');
const { body, query } = require('express-validator');
const EmailController = require('../controllers/emailController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Newsletter signup (public)
router.post('/newsletter/signup', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters')
], EmailController.newsletterSignup);

// Get subscribers (admin only)
router.get('/subscribers', protect, authorize('admin'), EmailController.getSubscribers);

// Email templates routes
router.get('/templates', protect, authorize('admin'), EmailController.getTemplates);
router.post('/templates', protect, authorize('admin'), [
  body('name').notEmpty().withMessage('Template name is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('type').notEmpty().withMessage('Type is required')
], EmailController.createTemplate);
router.put('/templates/:id', protect, authorize('admin'), EmailController.updateTemplate);
router.delete('/templates/:id', protect, authorize('admin'), EmailController.deleteTemplate);

// Email campaigns routes
router.get('/campaigns', protect, authorize('admin'), EmailController.getCampaigns);
router.get('/campaigns/:id', protect, authorize('admin'), EmailController.getCampaign);
router.post('/campaigns', protect, authorize('admin'), [
  body('name').notEmpty().withMessage('Campaign name is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('recipients').notEmpty().withMessage('Recipients configuration is required')
], EmailController.createCampaign);
router.post('/campaigns/:id/send', protect, authorize('admin'), EmailController.sendCampaign);

// Send test email (admin only)
router.post('/test', protect, authorize('admin'), [
  body('to').isEmail().withMessage('Valid recipient email is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('html').notEmpty().withMessage('HTML content is required')
], EmailController.sendTestEmail);

// Send bulk email (admin only)
router.post('/bulk', protect, authorize('admin'), [
  body('recipients').isArray({ min: 1 }).withMessage('Recipients array is required'),
  body('subject').notEmpty().withMessage('Subject is required')
], EmailController.sendBulkEmail);

module.exports = router;