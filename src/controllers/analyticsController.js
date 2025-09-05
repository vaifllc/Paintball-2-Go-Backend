const Booking = require('../models/Booking');
const User = require('../models/User');
const FAQ = require('../models/FAQ');
const { EmailService } = require('../services/emailService');

class AnalyticsController {
  // Get dashboard overview
  static async getDashboardOverview(req, res) {
    try {
      const { startDate, endDate } = req.query;

      let dateFilter = {};
      if (startDate || endDate) {
        dateFilter.createdAt = {};
        if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
        if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
      }

      // Get booking statistics
      const bookingStats = await Booking.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            totalBookings: { $sum: 1 },
            totalRevenue: { $sum: '$pricing.totalPrice' },
            averageBookingValue: { $avg: '$pricing.totalPrice' },
            confirmedBookings: {
              $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
            },
            completedBookings: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            cancelledBookings: {
              $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
            }
          }
        }
      ]);

      // Get user statistics
      const userStats = await User.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            activeUsers: {
              $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
            },
            verifiedUsers: {
              $sum: { $cond: [{ $eq: ['$isEmailVerified', true] }, 1, 0] }
            }
          }
        }
      ]);

      // Get popular event types
      const popularEvents = await Booking.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$eventType',
            count: { $sum: 1 },
            revenue: { $sum: '$pricing.totalPrice' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);

      // Get monthly trends (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const monthlyTrends = await Booking.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            bookings: { $sum: 1 },
            revenue: { $sum: '$pricing.totalPrice' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);

      res.json({
        success: true,
        data: {
          bookings: bookingStats[0] || {
            totalBookings: 0,
            totalRevenue: 0,
            averageBookingValue: 0,
            confirmedBookings: 0,
            completedBookings: 0,
            cancelledBookings: 0
          },
          users: userStats[0] || {
            totalUsers: 0,
            activeUsers: 0,
            verifiedUsers: 0
          },
          popularEvents,
          monthlyTrends
        }
      });
    } catch (error) {
      console.error('Get dashboard overview error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Get booking analytics
  static async getBookingAnalytics(req, res) {
    try {
      const { startDate, endDate, eventType } = req.query;

      let matchStage = {};
      if (startDate || endDate) {
        matchStage.createdAt = {};
        if (startDate) matchStage.createdAt.$gte = new Date(startDate);
        if (endDate) matchStage.createdAt.$lte = new Date(endDate);
      }
      if (eventType) {
        matchStage.eventType = eventType;
      }

      // Booking status distribution
      const statusDistribution = await Booking.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            percentage: { $sum: 1 }
          }
        }
      ]);

      // Calculate total for percentage
      const totalBookings = statusDistribution.reduce((sum, item) => sum + item.count, 0);
      statusDistribution.forEach(item => {
        item.percentage = totalBookings > 0 ? (item.count / totalBookings * 100).toFixed(2) : 0;
      });

      // Revenue by event type
      const revenueByEventType = await Booking.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$eventType',
            totalRevenue: { $sum: '$pricing.totalPrice' },
            averageRevenue: { $avg: '$pricing.totalPrice' },
            bookingCount: { $sum: 1 }
          }
        },
        { $sort: { totalRevenue: -1 } }
      ]);

      // Booking trends by day of week
      const dayOfWeekTrends = await Booking.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { $dayOfWeek: '$eventDate' },
            count: { $sum: 1 },
            revenue: { $sum: '$pricing.totalPrice' }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

      // Average booking value trends
      const avgBookingTrends = await Booking.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            averageValue: { $avg: '$pricing.totalPrice' },
            totalBookings: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);

      res.json({
        success: true,
        data: {
          statusDistribution,
          revenueByEventType,
          dayOfWeekTrends,
          avgBookingTrends
        }
      });
    } catch (error) {
      console.error('Get booking analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Get user analytics
  static async getUserAnalytics(req, res) {
    try {
      const { startDate, endDate } = req.query;

      let dateFilter = {};
      if (startDate || endDate) {
        dateFilter.createdAt = {};
        if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
        if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
      }

      // User registration trends
      const registrationTrends = await User.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            newUsers: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]);

      // User activity levels
      const activityLevels = await User.aggregate([
        {
          $group: {
            _id: '$membershipTier',
            count: { $sum: 1 },
            avgLoyaltyPoints: { $avg: '$loyaltyPoints' }
          }
        }
      ]);

      // Users by role
      const usersByRole = await User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ]);

      // Repeat customers (users with multiple bookings)
      const repeatCustomers = await Booking.aggregate([
        {
          $match: { userId: { $ne: null } }
        },
        {
          $group: {
            _id: '$userId',
            bookingCount: { $sum: 1 },
            totalSpent: { $sum: '$pricing.totalPrice' }
          }
        },
        {
          $group: {
            _id: null,
            repeatCustomers: {
              $sum: { $cond: [{ $gt: ['$bookingCount', 1] }, 1, 0] }
            },
            oneTimeCustomers: {
              $sum: { $cond: [{ $eq: ['$bookingCount', 1] }, 1, 0] }
            },
            totalCustomers: { $sum: 1 },
            avgBookingsPerCustomer: { $avg: '$bookingCount' },
            avgSpendPerCustomer: { $avg: '$totalSpent' }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          registrationTrends,
          activityLevels,
          usersByRole,
          customerRetention: repeatCustomers[0] || {
            repeatCustomers: 0,
            oneTimeCustomers: 0,
            totalCustomers: 0,
            avgBookingsPerCustomer: 0,
            avgSpendPerCustomer: 0
          }
        }
      });
    } catch (error) {
      console.error('Get user analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Get FAQ analytics
  static async getFAQAnalytics(req, res) {
    try {
      // Most viewed FAQs
      const mostViewed = await FAQ.find({ isActive: true })
        .sort({ views: -1 })
        .limit(10)
        .select('question views helpful category');

      // FAQ categories performance
      const categoryPerformance = await FAQ.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$category',
            totalViews: { $sum: '$views' },
            totalFAQs: { $sum: 1 },
            avgViews: { $avg: '$views' },
            avgHelpfulRatio: {
              $avg: {
                $divide: [
                  '$helpful.yes',
                  { $add: ['$helpful.yes', '$helpful.no'] }
                ]
              }
            }
          }
        },
        { $sort: { totalViews: -1 } }
      ]);

      // Search patterns (if implementing search tracking)
      const searchPatterns = []; // Placeholder for search analytics

      res.json({
        success: true,
        data: {
          mostViewed,
          categoryPerformance,
          searchPatterns
        }
      });
    } catch (error) {
      console.error('Get FAQ analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Export analytics data
  static async exportData(req, res) {
    try {
      const { type, format = 'json', startDate, endDate } = req.query;

      let data = {};

      switch (type) {
        case 'bookings':
          data = await AnalyticsController.getBookingData(startDate, endDate);
          break;
        case 'users':
          data = await AnalyticsController.getUserData(startDate, endDate);
          break;
        case 'revenue':
          data = await AnalyticsController.getRevenueData(startDate, endDate);
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid export type'
          });
      }

      if (format === 'csv') {
        // Convert to CSV format
        const csv = AnalyticsController.convertToCSV(data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${type}-export.csv"`);
        res.send(csv);
      } else {
        res.json({
          success: true,
          data,
          exportedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Export data error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Helper method to get booking data for export
  static async getBookingData(startDate, endDate) {
    let filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    return await Booking.find(filter)
      .populate('userId', 'name email')
      .select('eventType eventDate numberOfPlayers customerInfo pricing status paymentStatus createdAt')
      .sort({ createdAt: -1 });
  }

  // Helper method to get user data for export
  static async getUserData(startDate, endDate) {
    let filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    return await User.find(filter)
      .select('name email role isActive isEmailVerified loyaltyPoints membershipTier createdAt lastLogin')
      .sort({ createdAt: -1 });
  }

  // Helper method to get revenue data for export
  static async getRevenueData(startDate, endDate) {
    let filter = { paymentStatus: 'paid' };
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    return await Booking.find(filter)
      .select('eventType eventDate pricing.totalPrice customerInfo.name createdAt')
      .sort({ createdAt: -1 });
  }

  // Helper method to convert data to CSV
  static convertToCSV(data) {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' ? `"${value}"` : value;
        }).join(',')
      )
    ].join('\n');

    return csvContent;
  }
}

module.exports = AnalyticsController;
