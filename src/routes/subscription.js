const express = require('express');
const { body } = require('express-validator');
const SubscriptionController = require('../controllers/subscriptionController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all subscriptions (admin only)
router.get('/', protect, authorize('admin'), SubscriptionController.getAllSubscriptions);

// Get user's subscriptions
router.get('/my-subscriptions', protect, SubscriptionController.getUserSubscriptions);

// Get subscription statistics (admin only)
router.get('/stats', protect, authorize('admin'), SubscriptionController.getSubscriptionStats);

// Create subscription
router.post('/', protect, [
  body('plan').notEmpty().withMessage('Plan is required'),
  body('plan.name').notEmpty().withMessage('Plan name is required'),
  body('plan.price').isFloat({ min: 0 }).withMessage('Plan price must be positive'),
  body('plan.stripePriceId').notEmpty().withMessage('Stripe price ID is required'),
  body('paymentMethodId').notEmpty().withMessage('Payment method ID is required')
], SubscriptionController.createSubscription);

// Get single subscription
router.get('/:id', protect, SubscriptionController.getSubscription);

// Update subscription
router.put('/:id', protect, [
  body('plan').notEmpty().withMessage('Plan is required'),
  body('plan.name').notEmpty().withMessage('Plan name is required'),
  body('plan.price').isFloat({ min: 0 }).withMessage('Plan price must be positive'),
  body('plan.stripePriceId').notEmpty().withMessage('Stripe price ID is required')
], SubscriptionController.updateSubscription);

// Cancel subscription
router.patch('/:id/cancel', protect, [
  body('reason').optional().isString().withMessage('Reason must be a string'),
  body('cancelAtPeriodEnd').optional().isBoolean().withMessage('cancelAtPeriodEnd must be a boolean')
], SubscriptionController.cancelSubscription);

// Reactivate subscription
router.patch('/:id/reactivate', protect, SubscriptionController.reactivateSubscription);

module.exports = router;