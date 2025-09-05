const express = require('express');
const { body, query } = require('express-validator');
const FAQController = require('../controllers/faqController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all FAQs (public)
router.get('/', FAQController.getAllFAQs);

// Get FAQ categories
router.get('/categories', FAQController.getCategories);

// Get popular FAQs
router.get('/popular', FAQController.getPopularFAQs);

// Get recent FAQs
router.get('/recent', FAQController.getRecentFAQs);

// Get FAQs by category
router.get('/category/:category', FAQController.getFAQsByCategory);

// Get single FAQ
router.get('/:id', FAQController.getFAQ);

// Mark FAQ as helpful/not helpful
router.post('/:id/helpful', [
  body('helpful').isBoolean().withMessage('helpful field must be a boolean')
], FAQController.markHelpful);

// Create FAQ (admin only)
router.post('/', protect, authorize('admin'), [
  body('question').notEmpty().withMessage('Question is required'),
  body('answer').notEmpty().withMessage('Answer is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('order').optional().isInt({ min: 0 }).withMessage('Order must be a positive integer')
], FAQController.createFAQ);

// Update FAQ (admin only)
router.put('/:id', protect, authorize('admin'), [
  body('question').optional().notEmpty().withMessage('Question cannot be empty'),
  body('answer').optional().notEmpty().withMessage('Answer cannot be empty'),
  body('category').optional().notEmpty().withMessage('Category cannot be empty'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('order').optional().isInt({ min: 0 }).withMessage('Order must be a positive integer'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
], FAQController.updateFAQ);

// Delete FAQ (admin only)
router.delete('/:id', protect, authorize('admin'), FAQController.deleteFAQ);

module.exports = router;