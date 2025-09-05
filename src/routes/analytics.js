const express = require('express');
const { query } = require('express-validator');
const AnalyticsController = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All analytics routes require admin access
router.use(protect, authorize('admin'));

// Get dashboard overview
router.get('/dashboard', AnalyticsController.getDashboardOverview);

// Get booking analytics
router.get('/bookings', AnalyticsController.getBookingAnalytics);

// Get user analytics
router.get('/users', AnalyticsController.getUserAnalytics);

// Get FAQ analytics
router.get('/faq', AnalyticsController.getFAQAnalytics);

// Export analytics data
router.get('/export', [
  query('type').isIn(['bookings', 'users', 'revenue']).withMessage('Invalid export type'),
  query('format').optional().isIn(['json', 'csv']).withMessage('Invalid format')
], AnalyticsController.exportData);

module.exports = router;