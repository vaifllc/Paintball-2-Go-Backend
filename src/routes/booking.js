const express = require('express');
const { body, query } = require('express-validator');
const BookingController = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all bookings (admin only)
router.get('/', protect, authorize('admin'), BookingController.getAllBookings);

// Get user's bookings
router.get('/my-bookings', protect, BookingController.getUserBookings);

// Get booking statistics (admin only)
router.get('/stats', protect, authorize('admin'), BookingController.getBookingStats);

// Create new booking
router.post('/', [
  body('eventType').notEmpty().withMessage('Event type is required'),
  body('eventDate').isISO8601().withMessage('Valid event date is required'),
  body('numberOfPlayers').isInt({ min: 1 }).withMessage('Number of players must be at least 1'),
  body('customerInfo.name').notEmpty().withMessage('Customer name is required'),
  body('customerInfo.email').isEmail().withMessage('Valid email is required'),
  body('customerInfo.phone').notEmpty().withMessage('Phone number is required'),
  body('eventTime.start').notEmpty().withMessage('Start time is required'),
  body('eventTime.end').notEmpty().withMessage('End time is required')
], BookingController.createBooking);

// Get single booking
router.get('/:id', protect, BookingController.getBooking);

// Update booking
router.put('/:id', protect, BookingController.updateBooking);

// Cancel booking
router.patch('/:id/cancel', protect, [
  body('reason').optional().isString().withMessage('Reason must be a string')
], BookingController.cancelBooking);

// Confirm booking (admin only)
router.patch('/:id/confirm', protect, authorize('admin'), BookingController.confirmBooking);

// Complete booking (admin only)
router.patch('/:id/complete', protect, authorize('admin'), [
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('feedback').optional().isString().withMessage('Feedback must be a string')
], BookingController.completeBooking);

module.exports = router;