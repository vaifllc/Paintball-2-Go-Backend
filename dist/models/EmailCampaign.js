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
const EmailCampaignSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Campaign name is required'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true,
        maxlength: [200, 'Subject cannot be more than 200 characters']
    },
    templateId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'EmailTemplate',
        required: [true, 'Template is required']
    },
    recipientFilter: {
        type: {
            type: String,
            enum: ['all', 'selected', 'tag'],
            required: true
        },
        selectedUsers: [{
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User'
            }],
        tags: [String]
    },
    status: {
        type: String,
        enum: ['draft', 'scheduled', 'sending', 'sent', 'failed'],
        default: 'draft',
        index: true
    },
    scheduledAt: Date,
    sentAt: Date,
    recipientCount: {
        type: Number,
        default: 0,
        min: 0
    },
    deliveredCount: {
        type: Number,
        default: 0,
        min: 0
    },
    openedCount: {
        type: Number,
        default: 0,
        min: 0
    },
    clickedCount: {
        type: Number,
        default: 0,
        min: 0
    },
    failedCount: {
        type: Number,
        default: 0,
        min: 0
    },
    openRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    clickRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});
EmailCampaignSchema.index({ status: 1, scheduledAt: 1 });
EmailCampaignSchema.index({ createdBy: 1, updatedAt: -1 });
EmailCampaignSchema.pre('save', function (next) {
    if (this.deliveredCount > 0) {
        this.openRate = (this.openedCount / this.deliveredCount) * 100;
        this.clickRate = (this.clickedCount / this.deliveredCount) * 100;
    }
    next();
});
exports.default = mongoose_1.default.model('EmailCampaign', EmailCampaignSchema);
//# sourceMappingURL=EmailCampaign.js.map