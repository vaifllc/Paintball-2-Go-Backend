"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const stripeService_1 = require("../services/stripeService");
const User_1 = __importDefault(require("../models/User"));
const router = express_1.default.Router();
router.post('/create-intent', auth_1.protect, [
    (0, express_validator_1.body)('amount').isInt({ min: 1 }).withMessage('Amount must be a positive integer'),
    (0, express_validator_1.body)('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
    (0, express_validator_1.body)('metadata').optional().isObject().withMessage('Metadata must be an object')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const { amount, currency = 'usd', metadata = {} } = req.body;
        const paymentIntent = await stripeService_1.StripeService.createPaymentIntent({
            amount,
            currency,
            metadata: {
                userId: req.user.id,
                ...metadata
            }
        });
        if (!paymentIntent.success) {
            return res.status(400).json({
                success: false,
                message: 'Failed to create payment intent',
                error: paymentIntent.error
            });
        }
        res.json({
            success: true,
            clientSecret: paymentIntent.paymentIntent.client_secret,
            paymentIntentId: paymentIntent.paymentIntent.id
        });
    }
    catch (error) {
        console.error('Create payment intent error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
router.post('/create-customer', auth_1.protect, [
    (0, express_validator_1.body)('email').optional().isEmail().withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('name').optional().isString().withMessage('Name must be a string')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const user = await User_1.default.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        const { email = user.email, name = user.name } = req.body;
        const customer = await stripeService_1.StripeService.createCustomer({
            email,
            name,
            metadata: {
                userId: req.user.id
            }
        });
        if (!customer.success) {
            return res.status(400).json({
                success: false,
                message: 'Failed to create customer',
                error: customer.error
            });
        }
        res.json({
            success: true,
            customer: customer.customer
        });
    }
    catch (error) {
        console.error('Create customer error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
router.post('/create-subscription', auth_1.protect, [
    (0, express_validator_1.body)('customerId').notEmpty().withMessage('Customer ID is required'),
    (0, express_validator_1.body)('priceId').notEmpty().withMessage('Price ID is required'),
    (0, express_validator_1.body)('paymentMethodId').optional().isString().withMessage('Payment method ID must be a string')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const { customerId, priceId, paymentMethodId } = req.body;
        const subscription = await stripeService_1.StripeService.createSubscription({
            customerId,
            priceId,
            paymentMethodId,
            metadata: {
                userId: req.user.id
            }
        });
        if (!subscription.success) {
            return res.status(400).json({
                success: false,
                message: 'Failed to create subscription',
                error: subscription.error
            });
        }
        res.json({
            success: true,
            subscription: subscription.subscription
        });
    }
    catch (error) {
        console.error('Create subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
router.delete('/subscriptions/:id', auth_1.protect, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await stripeService_1.StripeService.cancelSubscription(id);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: 'Failed to cancel subscription',
                error: result.error
            });
        }
        res.json({
            success: true,
            message: 'Subscription cancelled successfully'
        });
    }
    catch (error) {
        console.error('Cancel subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
router.get('/customer/:id/subscriptions', auth_1.protect, async (req, res) => {
    try {
        const { id } = req.params;
        const subscriptions = await stripeService_1.StripeService.listSubscriptions(id);
        if (!subscriptions.success) {
            return res.status(400).json({
                success: false,
                message: 'Failed to retrieve subscriptions',
                error: subscriptions.error
            });
        }
        res.json({
            success: true,
            subscriptions: subscriptions.subscriptions
        });
    }
    catch (error) {
        console.error('Get subscriptions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
router.post('/webhook', express_1.default.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const sig = req.headers['stripe-signature'];
        if (!sig) {
            return res.status(400).json({
                success: false,
                message: 'Missing Stripe signature'
            });
        }
        const result = await stripeService_1.StripeService.handleWebhook(req.body, sig);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: 'Webhook verification failed',
                error: result.error
            });
        }
        const event = result.event;
        switch (event.type) {
            case 'payment_intent.succeeded':
                console.log('Payment succeeded:', event.data.object);
                break;
            case 'payment_intent.payment_failed':
                console.log('Payment failed:', event.data.object);
                break;
            case 'customer.subscription.created':
                console.log('Subscription created:', event.data.object);
                break;
            case 'customer.subscription.updated':
                console.log('Subscription updated:', event.data.object);
                break;
            case 'customer.subscription.deleted':
                console.log('Subscription cancelled:', event.data.object);
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
        res.json({ received: true });
    }
    catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({
            success: false,
            message: 'Webhook processing failed'
        });
    }
});
router.post('/cashapp/create', auth_1.protect, [
    (0, express_validator_1.body)('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    (0, express_validator_1.body)('description').optional().isString().withMessage('Description must be a string')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const { amount, description = 'Paintball 2 Go Payment' } = req.body;
        res.json({
            success: true,
            message: 'CashApp payment integration coming soon',
            paymentRequest: {
                amount,
                description,
                cashTag: '$paintball2go',
                qrCode: 'data:image/png;base64,placeholder',
                deepLink: `https://cash.app/$paintball2go/${amount}`
            }
        });
    }
    catch (error) {
        console.error('CashApp create error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
router.post('/cashapp/verify', auth_1.protect, [
    (0, express_validator_1.body)('transactionId').notEmpty().withMessage('Transaction ID is required')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const { transactionId } = req.body;
        res.json({
            success: true,
            message: 'CashApp verification coming soon',
            transaction: {
                id: transactionId,
                status: 'pending_verification',
                amount: 0,
                verified: false
            }
        });
    }
    catch (error) {
        console.error('CashApp verify error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=payment.js.map