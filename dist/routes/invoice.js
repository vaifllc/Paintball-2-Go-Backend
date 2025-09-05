"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const Invoice_1 = __importDefault(require("../models/Invoice"));
const stripeService_1 = require("../services/stripeService");
const emailService_1 = require("../services/emailService");
const router = express_1.default.Router();
router.get('/', auth_1.protect, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const filter = { userId: req.user.id };
        if (status)
            filter.status = status;
        const invoices = await Invoice_1.default.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        const total = await Invoice_1.default.countDocuments(filter);
        res.json({
            invoices,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching invoices' });
    }
});
router.get('/:id', auth_1.protect, (0, express_validator_1.param)('id').isMongoId(), async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const invoice = await Invoice_1.default.findOne({
            _id: req.params.id,
            userId: req.user.id
        });
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        res.json(invoice);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching invoice' });
    }
});
router.post('/:id/pay', auth_1.protect, [
    (0, express_validator_1.param)('id').isMongoId(),
    (0, express_validator_1.body)('paymentMethodId').notEmpty().withMessage('Payment method is required')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const invoice = await Invoice_1.default.findOne({
            _id: req.params.id,
            userId: req.user.id,
            status: { $in: ['sent', 'overdue'] }
        });
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found or not payable' });
        }
        const paymentIntent = await stripeService_1.StripeService.createPaymentIntent({
            amount: invoice.totalAmount * 100,
            currency: 'usd',
            metadata: {
                invoiceId: invoice._id.toString(),
                userId: req.user.id
            }
        });
        invoice.paymentId = paymentIntent.id;
        invoice.paymentStatus = 'pending';
        await invoice.save();
        res.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Error processing payment' });
    }
});
router.post('/:id/confirm-payment', auth_1.protect, [
    (0, express_validator_1.param)('id').isMongoId(),
    (0, express_validator_1.body)('paymentIntentId').notEmpty().withMessage('Payment intent ID is required')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const invoice = await Invoice_1.default.findOne({
            _id: req.params.id,
            userId: req.user.id,
            paymentId: req.body.paymentIntentId
        });
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        invoice.status = 'paid';
        invoice.paidAt = new Date();
        invoice.paymentMethod = 'stripe';
        await invoice.save();
        await emailService_1.EmailService.sendEmail({
            to: invoice.customerInfo.email,
            subject: 'Payment Confirmation - Paintball 2 Go',
            text: `Your payment of $${invoice.totalAmount} for invoice ${invoice.invoiceNumber} has been confirmed.`,
            html: `<h1>Payment Confirmed!</h1><p>Your payment of $${invoice.totalAmount} for invoice ${invoice.invoiceNumber} has been confirmed.</p>`
        });
        res.json({ message: 'Payment confirmed successfully', invoice });
    }
    catch (error) {
        res.status(500).json({ error: 'Error confirming payment' });
    }
});
router.get('/admin/all', auth_1.protect, (0, auth_1.authorize)('admin'), [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
    (0, express_validator_1.query)('status').optional().isIn(['draft', 'sent', 'paid', 'overdue', 'cancelled'])
], async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { status, startDate, endDate } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        if (startDate && endDate) {
            filter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        const invoices = await Invoice_1.default.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('userId', 'name email');
        const total = await Invoice_1.default.countDocuments(filter);
        const stats = await Invoice_1.default.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$totalAmount' },
                    paidAmount: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'paid'] }, '$totalAmount', 0]
                        }
                    },
                    pendingAmount: {
                        $sum: {
                            $cond: [{ $in: ['$status', ['sent', 'overdue']] }, '$totalAmount', 0]
                        }
                    }
                }
            }
        ]);
        res.json({
            invoices,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total,
            stats: stats[0] || { totalAmount: 0, paidAmount: 0, pendingAmount: 0 }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching invoices' });
    }
});
router.post('/admin/create', auth_1.protect, (0, auth_1.authorize)('admin'), [
    (0, express_validator_1.body)('userId').isMongoId().withMessage('Valid user ID is required'),
    (0, express_validator_1.body)('amount').isFloat({ min: 0 }).withMessage('Amount must be positive'),
    (0, express_validator_1.body)('description').notEmpty().withMessage('Description is required'),
    (0, express_validator_1.body)('dueDate').isISO8601().withMessage('Valid due date is required'),
    (0, express_validator_1.body)('customerInfo.name').notEmpty().withMessage('Customer name is required'),
    (0, express_validator_1.body)('customerInfo.email').isEmail().withMessage('Valid email is required')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const invoiceData = {
            ...req.body,
            totalAmount: req.body.amount + (req.body.tax || 0)
        };
        const invoice = new Invoice_1.default(invoiceData);
        await invoice.save();
        res.status(201).json(invoice);
    }
    catch (error) {
        res.status(500).json({ error: 'Error creating invoice' });
    }
});
router.put('/admin/:id', auth_1.protect, (0, auth_1.authorize)('admin'), [
    (0, express_validator_1.param)('id').isMongoId(),
    (0, express_validator_1.body)('status').optional().isIn(['draft', 'sent', 'paid', 'overdue', 'cancelled'])
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const invoice = await Invoice_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        res.json(invoice);
    }
    catch (error) {
        res.status(500).json({ error: 'Error updating invoice' });
    }
});
router.post('/admin/:id/send', auth_1.protect, (0, auth_1.authorize)('admin'), (0, express_validator_1.param)('id').isMongoId(), async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const invoice = await Invoice_1.default.findByIdAndUpdate(req.params.id, { status: 'sent' }, { new: true });
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        await emailService_1.EmailService.sendEmail({
            to: invoice.customerInfo.email,
            subject: `Invoice ${invoice.invoiceNumber} - Paintball 2 Go`,
            text: `Please find your invoice attached. Amount due: $${invoice.totalAmount}`,
            html: `<h1>Invoice ${invoice.invoiceNumber}</h1><p>Amount due: $${invoice.totalAmount}</p><p>Due date: ${invoice.dueDate.toDateString()}</p>`
        });
        res.json({ message: 'Invoice sent successfully', invoice });
    }
    catch (error) {
        res.status(500).json({ error: 'Error sending invoice' });
    }
});
exports.default = router;
//# sourceMappingURL=invoice.js.map