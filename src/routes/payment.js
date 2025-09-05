const express = require('express');
const { body } = require('express-validator');
const PaymentController = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Create payment intent
router.post('/create-payment-intent', [
  body('amount').isFloat({ min: 0.5 }).withMessage('Amount must be at least $0.50'),
  body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
  body('metadata').optional().isObject().withMessage('Metadata must be an object')
], PaymentController.createPaymentIntent);

// Confirm payment
router.post('/confirm', protect, [
  body('paymentIntentId').notEmpty().withMessage('Payment intent ID is required'),
  body('bookingId').optional().isMongoId().withMessage('Invalid booking ID')
], PaymentController.confirmPayment);

// Process refund (admin only)
router.post('/refund', protect, authorize('admin'), [
  body('paymentIntentId').notEmpty().withMessage('Payment intent ID is required'),
  body('amount').optional().isFloat({ min: 0.01 }).withMessage('Refund amount must be positive'),
  body('reason').optional().isString().withMessage('Reason must be a string')
], PaymentController.processRefund);

// Get payment history
router.get('/history', protect, PaymentController.getPaymentHistory);

// Get payment statistics (admin only)
router.get('/stats', protect, authorize('admin'), PaymentController.getPaymentStats);

// Stripe webhook (no auth required)
router.post('/webhook', express.raw({ type: 'application/json' }), PaymentController.handleWebhook);

module.exports = router;