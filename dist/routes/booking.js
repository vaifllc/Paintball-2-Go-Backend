"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const Booking_1 = __importDefault(require("../models/Booking"));
const Invoice_1 = __importDefault(require("../models/Invoice"));
const Waiver_1 = __importDefault(require("../models/Waiver"));
const emailService_1 = require("../services/emailService");
const Analytics_1 = require("../models/Analytics");
const router = express_1.default.Router();
router.get('/', auth_1.protect, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const filter = { userId: req.user.id };
        if (status)
            filter.status = status;
        const bookings = await Booking_1.default.find(filter)
            .sort({ date: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        const total = await Booking_1.default.countDocuments(filter);
        res.json({
            bookings,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching bookings' });
    }
});
router.get('/:id', auth_1.protect, (0, express_validator_1.param)('id').isMongoId(), async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const booking = await Booking_1.default.findOne({
            _id: req.params.id,
            userId: req.user.id
        });
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.json(booking);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching booking' });
    }
});
router.post('/', auth_1.protect, [
    (0, express_validator_1.body)('activityType')
        .isIn(['paintball', 'gellyball', 'archery', 'axe-throwing', 'cornhole'])
        .withMessage('Invalid activity type'),
    (0, express_validator_1.body)('date').isISO8601().withMessage('Invalid date format'),
    (0, express_validator_1.body)('timeSlot').notEmpty().withMessage('Time slot is required'),
    (0, express_validator_1.body)('location').notEmpty().withMessage('Location is required'),
    (0, express_validator_1.body)('participants').isInt({ min: 1 }).withMessage('Participants must be at least 1'),
    (0, express_validator_1.body)('customerInfo.name').notEmpty().withMessage('Customer name is required'),
    (0, express_validator_1.body)('customerInfo.email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('customerInfo.phone').notEmpty().withMessage('Phone number is required'),
    (0, express_validator_1.body)('totalAmount').isFloat({ min: 0 }).withMessage('Total amount must be positive')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const hasValidWaiver = await Waiver_1.default.findOne({
            $or: [
                { userId: req.user.id },
                { 'participantInfo.email': req.body.customerInfo.email }
            ],
            activities: req.body.activityType,
            status: 'active',
            expiresAt: { $gt: new Date() }
        });
        const booking = new Booking_1.default({
            ...req.body,
            userId: req.user.id,
            waiverSigned: !!hasValidWaiver
        });
        await booking.save();
        const invoice = new Invoice_1.default({
            userId: req.user.id,
            bookingId: booking._id,
            amount: booking.totalAmount,
            totalAmount: booking.totalAmount,
            description: `${booking.activityType.charAt(0).toUpperCase() + booking.activityType.slice(1)} booking for ${booking.participants} participants`,
            customerInfo: booking.customerInfo,
            dueDate: booking.date,
            lineItems: [{
                    description: `${booking.activityType} - ${booking.participants} participants`,
                    quantity: 1,
                    unitPrice: booking.totalAmount,
                    totalPrice: booking.totalAmount
                }]
        });
        await invoice.save();
        await new Analytics_1.Analytics({
            type: 'booking',
            userId: req.user.id,
            sessionId: req.headers['x-session-id'] || 'unknown',
            data: {
                action: 'created',
                value: booking.totalAmount,
                metadata: {
                    activityType: booking.activityType,
                    participants: booking.participants
                }
            },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] || ''
        }).save();
        await emailService_1.EmailService.sendEmail({
            to: booking.customerInfo.email,
            subject: 'Booking Confirmation - Paintball 2 Go',
            text: `Your booking for ${booking.activityType} on ${booking.date.toDateString()} has been confirmed.`,
            html: `<h1>Booking Confirmed!</h1><p>Your booking for ${booking.activityType} on ${booking.date.toDateString()} has been confirmed.</p>`
        });
        res.status(201).json({ booking, invoice });
    }
    catch (error) {
        res.status(500).json({ error: 'Error creating booking' });
    }
});
router.put('/:id', auth_1.protect, [
    (0, express_validator_1.param)('id').isMongoId(),
    (0, express_validator_1.body)('status').optional().isIn(['pending', 'confirmed', 'completed', 'cancelled'])
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const booking = await Booking_1.default.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, req.body, { new: true });
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.json(booking);
    }
    catch (error) {
        res.status(500).json({ error: 'Error updating booking' });
    }
});
router.delete('/:id', auth_1.protect, (0, express_validator_1.param)('id').isMongoId(), async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const booking = await Booking_1.default.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, { status: 'cancelled' }, { new: true });
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        if (booking.paymentStatus === 'paid' && booking.paymentId) {
        }
        res.json({ message: 'Booking cancelled successfully', booking });
    }
    catch (error) {
        res.status(500).json({ error: 'Error cancelling booking' });
    }
});
router.get('/admin/all', auth_1.protect, (0, auth_1.authorize)('admin'), [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
    (0, express_validator_1.query)('status').optional().isIn(['pending', 'confirmed', 'completed', 'cancelled']),
    (0, express_validator_1.query)('activityType').optional().isIn(['paintball', 'gellyball', 'archery', 'axe-throwing', 'cornhole'])
], async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { status, activityType, startDate, endDate } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        if (activityType)
            filter.activityType = activityType;
        if (startDate && endDate) {
            filter.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        const bookings = await Booking_1.default.find(filter)
            .sort({ date: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('userId', 'name email');
        const total = await Booking_1.default.countDocuments(filter);
        res.json({
            bookings,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching bookings' });
    }
});
router.put('/admin/:id/status', auth_1.protect, (0, auth_1.authorize)('admin'), [
    (0, express_validator_1.param)('id').isMongoId(),
    (0, express_validator_1.body)('status').isIn(['pending', 'confirmed', 'completed', 'cancelled'])
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const booking = await Booking_1.default.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        await emailService_1.EmailService.sendEmail({
            to: booking.customerInfo.email,
            subject: `Booking Status Update - Paintball 2 Go`,
            text: `Your booking status has been updated to: ${req.body.status}`,
            html: `<h1>Booking Update</h1><p>Your booking status has been updated to: <strong>${req.body.status}</strong></p>`
        });
        res.json(booking);
    }
    catch (error) {
        res.status(500).json({ error: 'Error updating booking status' });
    }
});
exports.default = router;
//# sourceMappingURL=booking.js.map