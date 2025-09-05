"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-09-30.acacia',
});
class StripeService {
    static async createCustomer(email, name) {
        try {
            const customer = await stripe.customers.create({
                email,
                name,
            });
            return { success: true, customer };
        }
        catch (error) {
            console.error('Stripe customer creation error:', error);
            return { success: false, error };
        }
    }
    static async createPaymentIntent(amount, currency = 'usd', customerId) {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount * 100,
                currency,
                customer: customerId,
                automatic_payment_methods: {
                    enabled: true,
                },
            });
            return { success: true, paymentIntent };
        }
        catch (error) {
            console.error('Stripe payment intent creation error:', error);
            return { success: false, error };
        }
    }
    static async createSubscription(customerId, priceId) {
        try {
            const subscription = await stripe.subscriptions.create({
                customer: customerId,
                items: [{ price: priceId }],
                payment_behavior: 'default_incomplete',
                payment_settings: { save_default_payment_method: 'on_subscription' },
                expand: ['latest_invoice.payment_intent'],
            });
            return { success: true, subscription };
        }
        catch (error) {
            console.error('Stripe subscription creation error:', error);
            return { success: false, error };
        }
    }
    static async createPrice(productId, amount, currency = 'usd', recurring) {
        try {
            const price = await stripe.prices.create({
                product: productId,
                unit_amount: amount * 100,
                currency,
                recurring: recurring ? { interval: recurring.interval } : undefined,
            });
            return { success: true, price };
        }
        catch (error) {
            console.error('Stripe price creation error:', error);
            return { success: false, error };
        }
    }
    static async createProduct(name, description) {
        try {
            const product = await stripe.products.create({
                name,
                description,
            });
            return { success: true, product };
        }
        catch (error) {
            console.error('Stripe product creation error:', error);
            return { success: false, error };
        }
    }
    static async cancelSubscription(subscriptionId) {
        try {
            const subscription = await stripe.subscriptions.cancel(subscriptionId);
            return { success: true, subscription };
        }
        catch (error) {
            console.error('Stripe subscription cancellation error:', error);
            return { success: false, error };
        }
    }
    static async retrieveCustomer(customerId) {
        try {
            const customer = await stripe.customers.retrieve(customerId);
            return { success: true, customer };
        }
        catch (error) {
            console.error('Stripe customer retrieval error:', error);
            return { success: false, error };
        }
    }
    static async listSubscriptions(customerId) {
        try {
            const subscriptions = await stripe.subscriptions.list({
                customer: customerId,
            });
            return { success: true, subscriptions };
        }
        catch (error) {
            console.error('Stripe subscriptions list error:', error);
            return { success: false, error };
        }
    }
    static async handleWebhook(body, signature) {
        try {
            const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
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
            return { success: true, event };
        }
        catch (error) {
            console.error('Stripe webhook error:', error);
            return { success: false, error };
        }
    }
}
exports.StripeService = StripeService;
//# sourceMappingURL=stripeService.js.map