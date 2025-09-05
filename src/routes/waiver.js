const express = require('express');
const { body, query } = require('express-validator');
const WaiverController = require('../controllers/waiverController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Get waiver template (public)
router.get('/template', WaiverController.getWaiverTemplate);

// Get all waivers (admin only)
router.get('/', protect, authorize('admin'), WaiverController.getAllWaivers);

// Get user's waivers
router.get('/my-waivers', protect, WaiverController.getUserWaivers);

// Get waiver statistics (admin only)
router.get('/stats', protect, authorize('admin'), WaiverController.getWaiverStats);

// Get waiver by booking ID
router.get('/booking/:bookingId', protect, WaiverController.getWaiverByBooking);

// Submit waiver
router.post('/', [
  body('participantInfo.name').notEmpty().withMessage('Participant name is required'),
  body('participantInfo.email').isEmail().withMessage('Valid email is required'),
  body('participantInfo.phone').notEmpty().withMessage('Phone number is required'),
  body('participantInfo.dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('emergencyContact.name').notEmpty().withMessage('Emergency contact name is required'),
  body('emergencyContact.phone').notEmpty().withMessage('Emergency contact phone is required'),
  body('signature').notEmpty().withMessage('Signature is required'),
  body('eventType').notEmpty().withMessage('Event type is required'),
  body('agreedToTerms').isBoolean().withMessage('Must agree to terms'),
  body('bookingId').optional().isMongoId().withMessage('Invalid booking ID')
], WaiverController.submitWaiver);

// Get single waiver
router.get('/:id', protect, WaiverController.getWaiver);

// Update waiver (admin only)
router.put('/:id', protect, authorize('admin'), WaiverController.updateWaiver);

module.exports = router;