const express = require('express');
const { body, query } = require('express-validator');
const CMSController = require('../controllers/cmsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all content (public for published, admin for all)
router.get('/content', CMSController.getAllContent);

// Get all sections
router.get('/sections', CMSController.getSections);

// Get content by section (public for published, admin for all)
router.get('/content/:section', CMSController.getContentBySection);

// Get single content block (public for published, admin for all)
router.get('/content/block/:id', CMSController.getContentBlock);

// Create content block (admin only)
router.post('/content', protect, authorize('admin'), [
  body('id').notEmpty().withMessage('Content ID is required'),
  body('section').notEmpty().withMessage('Section is required'),
  body('type').notEmpty().withMessage('Type is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required')
], CMSController.createContentBlock);

// Update content block (admin only)
router.put('/content/:id', protect, authorize('admin'), [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('content').optional().notEmpty().withMessage('Content cannot be empty')
], CMSController.updateContentBlock);

// Publish content block (admin only)
router.patch('/content/:id/publish', protect, authorize('admin'), CMSController.publishContentBlock);

// Delete content block (admin only)
router.delete('/content/:id', protect, authorize('admin'), CMSController.deleteContentBlock);

module.exports = router;