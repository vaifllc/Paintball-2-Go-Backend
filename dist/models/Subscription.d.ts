import mongoose, { Document } from 'mongoose';
export interface ISubscription extends Document {
    userId: string;
    plan: 'basic' | 'premium' | 'enterprise';
    status: 'active' | 'cancelled' | 'past_due' | 'trialing' | 'incomplete';
    stripeSubscriptionId?: string;
    stripeCustomerId?: string;
    startDate: Date;
    endDate?: Date;
    renewalDate: Date;
    amount: number;
    currency: string;
    billingCycle: 'monthly' | 'yearly';
    features: string[];
    paymentMethod?: {
        type: 'card' | 'bank_account';
        last4: string;
        brand?: string;
    };
    discounts?: Array<{
        code: string;
        type: 'percentage' | 'fixed';
        value: number;
        expiresAt?: Date;
    }>;
    usageMetrics?: {
        sessionsUsed: number;
        sessionsAllowed: number;
        lastSessionDate?: Date;
    };
    cancellationReason?: string;
    cancelledAt?: Date;
    trialStart?: Date;
    trialEnd?: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ISubscription, {}, {}, {}, mongoose.Document<unknown, {}, ISubscription, {}, {}> & ISubscription & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Subscription.d.ts.map