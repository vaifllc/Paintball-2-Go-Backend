"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const Subscription_1 = __importDefault(require("../models/Subscription"));
const stripeService_1 = require("../services/stripeService");
const emailService_1 = require("../services/emailService");
const router = express_1.default.Router();
const SUBSCRIPTION_PLANS = {
    basic: {
        name: 'Basic',
        price: 4999,
        features: [
            '10% discount on all bookings',
            'Priority customer support',
            '24-hour cancellation',
            'Basic equipment included'
        ],
        sessionsAllowed: 0
    },
    premium: {
        name: 'Premium',
        price: 9999,
        features: [
            'Monthly paintball session for up to 10 people',
            '20% discount on additional bookings',
            'Priority scheduling',
            'Free equipment upgrades',
            '48-hour cancellation',
            'Premium customer support'
        ],
        sessionsAllowed: 1
    },
    enterprise: {
        name: 'Enterprise',
        price: 19999,
        features: [
            'Quarterly paintball session for up to 20 people',
            '30% discount on additional bookings',
            'VIP scheduling',
            'Premium equipment included',
            'Dedicated event coordinator',
            'Custom event planning',
            '72-hour cancellation',
            '24/7 premium support'
        ],
        sessionsAllowed: 4
    }
};
router.get('/', auth_1.protect, async (req, res) => {
    try {
        const subscription = await Subscription_1.default.findOne({
            userId: req.user.id,
            status: { $in: ['active', 'trialing', 'past_due'] }
        });
        if (!subscription) {
            return res.json({ subscription: null });
        }
        res.json({ subscription });
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching subscription' });
    }
});
router.get('/plans', async (req, res) => {
    try {
        const plans = Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => ({
            id: key,
            ...plan,
            price: plan.price / 100
        }));
        res.json({ plans });
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching plans' });
    }
});
router.post('/create', auth_1.protect, [
    (0, express_validator_1.body)('plan').isIn(['basic', 'premium', 'enterprise']).withMessage('Invalid plan'),
    (0, express_validator_1.body)('paymentMethodId').notEmpty().withMessage('Payment method is required'),
    (0, express_validator_1.body)('billingCycle').optional().isIn(['monthly', 'yearly']).withMessage('Invalid billing cycle')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { plan, paymentMethodId, billingCycle = 'monthly' } = req.body;
        const existingSubscription = await Subscription_1.default.findOne({
            userId: req.user.id,
            status: { $in: ['active', 'trialing'] }
        });
        if (existingSubscription) {
            return res.status(400).json({ error: 'User already has an active subscription' });
        }
        let stripeCustomer;
        try {
            stripeCustomer = await stripeService_1.StripeService.createCustomer({
                email: req.user.email,
                name: req.user.name
            });
        }
        catch (error) {
            return res.status(500).json({ error: 'Error creating customer' });
        }
        const planConfig = SUBSCRIPTION_PLANS[plan];
        const price = billingCycle === 'yearly' ? planConfig.price * 10 : planConfig.price;
        const stripeSubscription = await stripeService_1.StripeService.createSubscription({
            customerId: stripeCustomer.id,
            priceId: `price_${plan}_${billingCycle}`,
            paymentMethodId
        });
        const subscription = new Subscription_1.default({
            userId: req.user.id,
            plan,
            stripeSubscriptionId: stripeSubscription.id,
            stripeCustomerId: stripeCustomer.id,
            startDate: new Date(),
            renewalDate: new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000),
            amount: price / 100,
            billingCycle,
            features: planConfig.features,
            usageMetrics: {
                sessionsUsed: 0,
                sessionsAllowed: planConfig.sessionsAllowed
            }
        });
        await subscription.save();
        await emailService_1.EmailService.sendEmail({
            to: req.user.email,
            subject: 'Welcome to Paintball 2 Go Premium!',
            text: `Welcome to ${planConfig.name}! Your subscription is now active.`,
            html: `<h1>Welcome to ${planConfig.name}!</h1><p>Your subscription is now active and you can start enjoying your benefits.</p>`
        });
        res.status(201).json({ subscription });
    }
    catch (error) {
        res.status(500).json({ error: 'Error creating subscription' });
    }
});
router.put('/update', auth_1.protect, [
    (0, express_validator_1.body)('plan').optional().isIn(['basic', 'premium', 'enterprise']),
    (0, express_validator_1.body)('billingCycle').optional().isIn(['monthly', 'yearly'])
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const subscription = await Subscription_1.default.findOne({
            userId: req.user.id,
            status: { $in: ['active', 'trialing'] }
        });
        if (!subscription) {
            return res.status(404).json({ error: 'No active subscription found' });
        }
        const { plan, billingCycle } = req.body;
        if (plan && plan !== subscription.plan) {
            await stripeService_1.StripeService.updateSubscription(subscription.stripeSubscriptionId, {
                priceId: `price_${plan}_${subscription.billingCycle}`
            });
            const planConfig = SUBSCRIPTION_PLANS[plan];
            subscription.plan = plan;
            subscription.features = planConfig.features;
            subscription.amount = planConfig.price / 100;
            subscription.usageMetrics.sessionsAllowed = planConfig.sessionsAllowed;
        }
        if (billingCycle && billingCycle !== subscription.billingCycle) {
            subscription.billingCycle = billingCycle;
            subscription.renewalDate = new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000);
        }
        await subscription.save();
        res.json({ subscription });
    }
    catch (error) {
        res.status(500).json({ error: 'Error updating subscription' });
    }
});
router.post('/cancel', auth_1.protect, [
    (0, express_validator_1.body)('reason').optional().isString().isLength({ max: 500 })
], async (req, res) => {
    try {
        const subscription = await Subscription_1.default.findOne({
            userId: req.user.id,
            status: { $in: ['active', 'trialing'] }
        });
        if (!subscription) {
            return res.status(404).json({ error: 'No active subscription found' });
        }
        await stripeService_1.StripeService.cancelSubscription(subscription.stripeSubscriptionId);
        subscription.status = 'cancelled';
        subscription.cancelledAt = new Date();
        subscription.cancellationReason = req.body.reason;
        subscription.endDate = new Date();
        await subscription.save();
        await emailService_1.EmailService.sendEmail({
            to: req.user.email,
            subject: 'Subscription Cancelled - Paintball 2 Go',
            text: 'Your subscription has been cancelled successfully.',
            html: '<h1>Subscription Cancelled</h1><p>Your subscription has been cancelled successfully. Thank you for being a member!</p>'
        });
        res.json({ message: 'Subscription cancelled successfully', subscription });
    }
    catch (error) {
        res.status(500).json({ error: 'Error cancelling subscription' });
    }
});
router.post('/payment-method', auth_1.protect, [
    (0, express_validator_1.body)('paymentMethodId').notEmpty().withMessage('Payment method is required')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const subscription = await Subscription_1.default.findOne({
            userId: req.user.id,
            status: { $in: ['active', 'trialing', 'past_due'] }
        });
        if (!subscription) {
            return res.status(404).json({ error: 'No subscription found' });
        }
        await stripeService_1.StripeService.updateSubscription(subscription.stripeSubscriptionId, {
            defaultPaymentMethod: req.body.paymentMethodId
        });
        res.json({ message: 'Payment method updated successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error updating payment method' });
    }
});
router.get('/admin/all', auth_1.protect, (0, auth_1.authorize)('admin'), [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
    (0, express_validator_1.query)('status').optional().isIn(['active', 'cancelled', 'past_due', 'trialing', 'incomplete']),
    (0, express_validator_1.query)('plan').optional().isIn(['basic', 'premium', 'enterprise'])
], async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { status, plan } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        if (plan)
            filter.plan = plan;
        const subscriptions = await Subscription_1.default.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('userId', 'name email');
        const total = await Subscription_1.default.countDocuments(filter);
        const stats = await Subscription_1.default.aggregate([
            {
                $group: {
                    _id: null,
                    totalActive: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
                        }
                    },
                    totalRevenue: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'active'] }, '$amount', 0]
                        }
                    },
                    planBreakdown: {
                        $push: {
                            plan: '$plan',
                            status: '$status'
                        }
                    }
                }
            }
        ]);
        res.json({
            subscriptions,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total,
            stats: stats[0] || { totalActive: 0, totalRevenue: 0, planBreakdown: [] }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching subscriptions' });
    }
});
exports.default = router;
//# sourceMappingURL=subscription.js.map