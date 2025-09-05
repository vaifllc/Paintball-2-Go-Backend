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
const mongoose_1 = __importStar(require("mongoose"));
const SubscriptionSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        required: true,
        ref: 'User'
    },
    plan: {
        type: String,
        enum: ['basic', 'premium', 'enterprise'],
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'cancelled', 'past_due', 'trialing', 'incomplete'],
        default: 'active'
    },
    stripeSubscriptionId: {
        type: String,
        unique: true,
        sparse: true
    },
    stripeCustomerId: {
        type: String
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date
    },
    renewalDate: {
        type: Date,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'usd'
    },
    billingCycle: {
        type: String,
        enum: ['monthly', 'yearly'],
        default: 'monthly'
    },
    features: [{
            type: String
        }],
    paymentMethod: {
        type: {
            type: String,
            enum: ['card', 'bank_account']
        },
        last4: {
            type: String
        },
        brand: {
            type: String
        }
    },
    discounts: [{
            code: {
                type: String,
                required: true
            },
            type: {
                type: String,
                enum: ['percentage', 'fixed'],
                required: true
            },
            value: {
                type: Number,
                required: true,
                min: 0
            },
            expiresAt: {
                type: Date
            }
        }],
    usageMetrics: {
        sessionsUsed: {
            type: Number,
            default: 0,
            min: 0
        },
        sessionsAllowed: {
            type: Number,
            default: 0,
            min: 0
        },
        lastSessionDate: {
            type: Date
        }
    },
    cancellationReason: {
        type: String,
        maxlength: 500
    },
    cancelledAt: {
        type: Date
    },
    trialStart: {
        type: Date
    },
    trialEnd: {
        type: Date
    }
}, {
    timestamps: true
});
SubscriptionSchema.index({ userId: 1, status: 1 });
SubscriptionSchema.index({ stripeSubscriptionId: 1 });
SubscriptionSchema.index({ renewalDate: 1 });
exports.default = mongoose_1.default.model('Subscription', SubscriptionSchema);
//# sourceMappingURL=Subscription.js.map