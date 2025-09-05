import Stripe from 'stripe';
export declare class StripeService {
    static createCustomer(email: string, name: string): Promise<{
        success: boolean;
        customer: Stripe.Response<Stripe.Customer>;
        error?: undefined;
    } | {
        success: boolean;
        error: unknown;
        customer?: undefined;
    }>;
    static createPaymentIntent(amount: number, currency?: string, customerId?: string): Promise<{
        success: boolean;
        paymentIntent: Stripe.Response<Stripe.PaymentIntent>;
        error?: undefined;
    } | {
        success: boolean;
        error: unknown;
        paymentIntent?: undefined;
    }>;
    static createSubscription(customerId: string, priceId: string): Promise<{
        success: boolean;
        subscription: Stripe.Response<Stripe.Subscription>;
        error?: undefined;
    } | {
        success: boolean;
        error: unknown;
        subscription?: undefined;
    }>;
    static createPrice(productId: string, amount: number, currency?: string, recurring?: {
        interval: 'month' | 'year';
    }): Promise<{
        success: boolean;
        price: Stripe.Response<Stripe.Price>;
        error?: undefined;
    } | {
        success: boolean;
        error: unknown;
        price?: undefined;
    }>;
    static createProduct(name: string, description?: string): Promise<{
        success: boolean;
        product: Stripe.Response<Stripe.Product>;
        error?: undefined;
    } | {
        success: boolean;
        error: unknown;
        product?: undefined;
    }>;
    static cancelSubscription(subscriptionId: string): Promise<{
        success: boolean;
        subscription: Stripe.Response<Stripe.Subscription>;
        error?: undefined;
    } | {
        success: boolean;
        error: unknown;
        subscription?: undefined;
    }>;
    static retrieveCustomer(customerId: string): Promise<{
        success: boolean;
        customer: Stripe.Response<Stripe.Customer | Stripe.DeletedCustomer>;
        error?: undefined;
    } | {
        success: boolean;
        error: unknown;
        customer?: undefined;
    }>;
    static listSubscriptions(customerId: string): Promise<{
        success: boolean;
        subscriptions: Stripe.Response<Stripe.ApiList<Stripe.Subscription>>;
        error?: undefined;
    } | {
        success: boolean;
        error: unknown;
        subscriptions?: undefined;
    }>;
    static handleWebhook(body: any, signature: string): Promise<{
        success: boolean;
        event: Stripe.Event;
        error?: undefined;
    } | {
        success: boolean;
        error: unknown;
        event?: undefined;
    }>;
}
//# sourceMappingURL=stripeService.d.ts.map