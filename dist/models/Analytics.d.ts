import mongoose, { Document } from 'mongoose';
export interface IAnalytics extends Document {
    type: 'page_view' | 'booking' | 'subscription' | 'email_open' | 'email_click' | 'user_action';
    userId?: string;
    sessionId: string;
    data: {
        page?: string;
        action?: string;
        value?: number;
        metadata?: Record<string, any>;
    };
    ipAddress: string;
    userAgent: string;
    referrer?: string;
    timestamp: Date;
    createdAt: Date;
}
export interface IDashboardMetrics extends Document {
    date: Date;
    metrics: {
        totalBookings: number;
        totalRevenue: number;
        newUsers: number;
        activeSubscriptions: number;
        pageViews: number;
        conversionRate: number;
        averageBookingValue: number;
        popularActivities: Array<{
            activity: string;
            count: number;
        }>;
        revenueByActivity: Array<{
            activity: string;
            revenue: number;
        }>;
        userGrowth: number;
        subscriptionGrowth: number;
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare const Analytics: mongoose.Model<IAnalytics, {}, {}, {}, mongoose.Document<unknown, {}, IAnalytics, {}, {}> & IAnalytics & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export declare const DashboardMetrics: mongoose.Model<IDashboardMetrics, {}, {}, {}, mongoose.Document<unknown, {}, IDashboardMetrics, {}, {}> & IDashboardMetrics & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Analytics.d.ts.map