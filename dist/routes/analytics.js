"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const Analytics_1 = require("../models/Analytics");
const Booking_1 = __importDefault(require("../models/Booking"));
const User_1 = __importDefault(require("../models/User"));
const Subscription_1 = __importDefault(require("../models/Subscription"));
const EmailCampaign_1 = __importDefault(require("../models/EmailCampaign"));
const router = express_1.default.Router();
router.post('/track', [
    (0, express_validator_1.body)('type').isIn(['page_view', 'booking', 'subscription', 'email_open', 'email_click', 'user_action']),
    (0, express_validator_1.body)('sessionId').notEmpty().withMessage('Session ID is required'),
    (0, express_validator_1.body)('data').optional().isObject()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const analyticsEvent = new Analytics_1.Analytics({
            ...req.body,
            userId: req.user?.id,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] || '',
            referrer: req.headers.referer
        });
        await analyticsEvent.save();
        res.status(201).json({ message: 'Event tracked successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error tracking event' });
    }
});
router.get('/admin/dashboard', auth_1.protect, (0, auth_1.authorize)('admin'), [
    (0, express_validator_1.query)('startDate').optional().isISO8601(),
    (0, express_validator_1.query)('endDate').optional().isISO8601(),
    (0, express_validator_1.query)('period').optional().isIn(['day', 'week', 'month', 'year'])
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { startDate, endDate, period = 'month' } = req.query;
        let dateFilter = {};
        const now = new Date();
        if (startDate && endDate) {
            dateFilter = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        else {
            switch (period) {
                case 'day':
                    dateFilter = { $gte: new Date(now.setDate(now.getDate() - 1)) };
                    break;
                case 'week':
                    dateFilter = { $gte: new Date(now.setDate(now.getDate() - 7)) };
                    break;
                case 'year':
                    dateFilter = { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) };
                    break;
                default:
                    dateFilter = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
            }
        }
        const bookingMetrics = await Booking_1.default.aggregate([
            { $match: { createdAt: dateFilter } },
            {
                $group: {
                    _id: null,
                    totalBookings: { $sum: 1 },
                    totalRevenue: { $sum: '$totalAmount' },
                    averageBookingValue: { $avg: '$totalAmount' },
                    popularActivities: {
                        $push: '$activityType'
                    },
                    statusBreakdown: {
                        $push: '$status'
                    }
                }
            }
        ]);
        const userMetrics = await User_1.default.aggregate([
            { $match: { createdAt: dateFilter } },
            {
                $group: {
                    _id: null,
                    newUsers: { $sum: 1 },
                    totalUsers: { $sum: 1 }
                }
            }
        ]);
        const subscriptionMetrics = await Subscription_1.default.aggregate([
            {
                $group: {
                    _id: null,
                    activeSubscriptions: {
                        $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                    },
                    subscriptionRevenue: {
                        $sum: { $cond: [{ $eq: ['$status', 'active'] }, '$amount', 0] }
                    },
                    planBreakdown: {
                        $push: {
                            $cond: [{ $eq: ['$status', 'active'] }, '$plan', null]
                        }
                    }
                }
            }
        ]);
        const pageViewMetrics = await Analytics_1.Analytics.aggregate([
            {
                $match: {
                    type: 'page_view',
                    timestamp: dateFilter
                }
            },
            {
                $group: {
                    _id: '$data.page',
                    views: { $sum: 1 },
                    uniqueUsers: { $addToSet: '$userId' }
                }
            },
            {
                $project: {
                    page: '$_id',
                    views: 1,
                    uniqueUsers: { $size: '$uniqueUsers' }
                }
            },
            { $sort: { views: -1 } },
            { $limit: 10 }
        ]);
        const emailMetrics = await EmailCampaign_1.default.aggregate([
            { $match: { createdAt: dateFilter } },
            {
                $group: {
                    _id: null,
                    totalCampaigns: { $sum: 1 },
                    totalSent: { $sum: '$recipientCount' },
                    totalOpened: { $sum: '$openedCount' },
                    totalClicked: { $sum: '$clickedCount' },
                    averageOpenRate: { $avg: '$openRate' },
                    averageClickRate: { $avg: '$clickRate' }
                }
            }
        ]);
        const totalPageViews = await Analytics_1.Analytics.countDocuments({
            type: 'page_view',
            timestamp: dateFilter
        });
        const totalBookings = bookingMetrics[0]?.totalBookings || 0;
        const conversionRate = totalPageViews > 0 ? (totalBookings / totalPageViews) * 100 : 0;
        const activities = bookingMetrics[0]?.popularActivities || [];
        const activityCounts = activities.reduce((acc, activity) => {
            acc[activity] = (acc[activity] || 0) + 1;
            return acc;
        }, {});
        const popularActivities = Object.entries(activityCounts)
            .map(([activity, count]) => ({ activity, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        const metrics = {
            overview: {
                totalBookings: bookingMetrics[0]?.totalBookings || 0,
                totalRevenue: bookingMetrics[0]?.totalRevenue || 0,
                newUsers: userMetrics[0]?.newUsers || 0,
                activeSubscriptions: subscriptionMetrics[0]?.activeSubscriptions || 0,
                pageViews: totalPageViews,
                conversionRate: Math.round(conversionRate * 100) / 100,
                averageBookingValue: Math.round((bookingMetrics[0]?.averageBookingValue || 0) * 100) / 100
            },
            bookings: {
                total: bookingMetrics[0]?.totalBookings || 0,
                revenue: bookingMetrics[0]?.totalRevenue || 0,
                popularActivities
            },
            users: {
                new: userMetrics[0]?.newUsers || 0,
                total: userMetrics[0]?.totalUsers || 0
            },
            subscriptions: {
                active: subscriptionMetrics[0]?.activeSubscriptions || 0,
                revenue: subscriptionMetrics[0]?.subscriptionRevenue || 0
            },
            traffic: {
                totalViews: totalPageViews,
                topPages: pageViewMetrics
            },
            email: emailMetrics[0] || {
                totalCampaigns: 0,
                totalSent: 0,
                totalOpened: 0,
                totalClicked: 0,
                averageOpenRate: 0,
                averageClickRate: 0
            }
        };
        res.json(metrics);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching dashboard metrics' });
    }
});
router.get('/admin/detailed', auth_1.protect, (0, auth_1.authorize)('admin'), [
    (0, express_validator_1.query)('type').optional().isIn(['page_view', 'booking', 'subscription', 'email_open', 'email_click', 'user_action']),
    (0, express_validator_1.query)('startDate').optional().isISO8601(),
    (0, express_validator_1.query)('endDate').optional().isISO8601(),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 1000 })
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { type, startDate, endDate } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const filter = {};
        if (type)
            filter.type = type;
        if (startDate && endDate) {
            filter.timestamp = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        const analytics = await Analytics_1.Analytics.find(filter)
            .sort({ timestamp: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('userId', 'name email');
        const total = await Analytics_1.Analytics.countDocuments(filter);
        res.json({
            analytics,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching detailed analytics' });
    }
});
router.get('/admin/revenue', auth_1.protect, (0, auth_1.authorize)('admin'), [
    (0, express_validator_1.query)('period').optional().isIn(['day', 'week', 'month', 'year']),
    (0, express_validator_1.query)('startDate').optional().isISO8601(),
    (0, express_validator_1.query)('endDate').optional().isISO8601()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { period = 'month', startDate, endDate } = req.query;
        let dateFilter = {};
        let groupBy;
        if (startDate && endDate) {
            dateFilter = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        else {
            const now = new Date();
            dateFilter = { $gte: new Date(now.setMonth(now.getMonth() - 12)) };
        }
        switch (period) {
            case 'day':
                groupBy = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' }
                };
                break;
            case 'week':
                groupBy = {
                    year: { $year: '$createdAt' },
                    week: { $week: '$createdAt' }
                };
                break;
            case 'year':
                groupBy = {
                    year: { $year: '$createdAt' }
                };
                break;
            default:
                groupBy = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                };
        }
        const bookingRevenue = await Booking_1.default.aggregate([
            {
                $match: {
                    createdAt: dateFilter,
                    status: { $in: ['confirmed', 'completed'] }
                }
            },
            {
                $group: {
                    _id: groupBy,
                    revenue: { $sum: '$totalAmount' },
                    bookings: { $sum: 1 },
                    avgBookingValue: { $avg: '$totalAmount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
        ]);
        const subscriptionRevenue = await Subscription_1.default.aggregate([
            {
                $match: {
                    createdAt: dateFilter,
                    status: 'active'
                }
            },
            {
                $group: {
                    _id: groupBy,
                    revenue: { $sum: '$amount' },
                    subscriptions: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
        ]);
        const revenueByActivity = await Booking_1.default.aggregate([
            {
                $match: {
                    createdAt: dateFilter,
                    status: { $in: ['confirmed', 'completed'] }
                }
            },
            {
                $group: {
                    _id: '$activityType',
                    revenue: { $sum: '$totalAmount' },
                    bookings: { $sum: 1 }
                }
            },
            { $sort: { revenue: -1 } }
        ]);
        res.json({
            bookingRevenue,
            subscriptionRevenue,
            revenueByActivity,
            period,
            dateRange: { startDate, endDate }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching revenue analytics' });
    }
});
router.get('/admin/export', auth_1.protect, (0, auth_1.authorize)('admin'), [
    (0, express_validator_1.query)('type').optional().isIn(['bookings', 'users', 'subscriptions', 'analytics']),
    (0, express_validator_1.query)('format').optional().isIn(['json', 'csv']),
    (0, express_validator_1.query)('startDate').optional().isISO8601(),
    (0, express_validator_1.query)('endDate').optional().isISO8601()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { type = 'analytics', format = 'json', startDate, endDate } = req.query;
        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        }
        let data;
        switch (type) {
            case 'bookings':
                data = await Booking_1.default.find(dateFilter)
                    .populate('userId', 'name email')
                    .lean();
                break;
            case 'users':
                data = await User_1.default.find(dateFilter)
                    .select('-password')
                    .lean();
                break;
            case 'subscriptions':
                data = await Subscription_1.default.find(dateFilter)
                    .populate('userId', 'name email')
                    .lean();
                break;
            default:
                data = await Analytics_1.Analytics.find(dateFilter)
                    .populate('userId', 'name email')
                    .lean();
        }
        if (format === 'csv') {
            const csv = convertToCSV(data);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=${type}_export.csv`);
            res.send(csv);
        }
        else {
            res.json(data);
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Error exporting analytics data' });
    }
});
function convertToCSV(data) {
    if (data.length === 0)
        return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).map(val => typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val).join(','));
    return [headers, ...rows].join('\n');
}
exports.default = router;
//# sourceMappingURL=analytics.js.map