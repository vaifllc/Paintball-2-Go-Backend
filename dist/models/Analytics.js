"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardMetrics = exports.Analytics = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const AnalyticsSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ['page_view', 'booking', 'subscription', 'email_open', 'email_click', 'user_action'],
        required: true
    },
    userId: {
        type: String,
        ref: 'User'
    },
    sessionId: {
        type: String,
        required: true
    },
    data: {
        page: String,
        action: String,
        value: Number,
        metadata: mongoose_1.Schema.Types.Mixed
    },
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true
    },
    referrer: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});
const DashboardMetricsSchema = new mongoose_1.Schema({
    date: {
        type: Date,
        required: true,
        unique: true
    },
    metrics: {
        totalBookings: {
            type: Number,
            default: 0
        },
        totalRevenue: {
            type: Number,
            default: 0
        },
        newUsers: {
            type: Number,
            default: 0
        },
        activeSubscriptions: {
            type: Number,
            default: 0
        },
        pageViews: {
            type: Number,
            default: 0
        },
        conversionRate: {
            type: Number,
            default: 0
        },
        averageBookingValue: {
            type: Number,
            default: 0
        },
        popularActivities: [{
                activity: String,
                count: Number
            }],
        revenueByActivity: [{
                activity: String,
                revenue: Number
            }],
        userGrowth: {
            type: Number,
            default: 0
        },
        subscriptionGrowth: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});
AnalyticsSchema.index({ type: 1, timestamp: 1 });
AnalyticsSchema.index({ userId: 1, timestamp: 1 });
AnalyticsSchema.index({ sessionId: 1 });
DashboardMetricsSchema.index({ date: 1 });
exports.Analytics = mongoose_1.default.model('Analytics', AnalyticsSchema);
exports.DashboardMetrics = mongoose_1.default.model('DashboardMetrics', DashboardMetricsSchema);
//# sourceMappingURL=Analytics.js.map