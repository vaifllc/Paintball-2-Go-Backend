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
const EmailTemplateSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Template name is required'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true,
        maxlength: [200, 'Subject cannot be more than 200 characters']
    },
    content: {
        type: String,
        required: [true, 'Content is required']
    },
    type: {
        type: String,
        enum: ['marketing', 'transactional', 'newsletter'],
        required: [true, 'Type is required'],
        index: true
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    variables: [{
            type: String,
            trim: true
        }],
    lastUsed: Date,
    usageCount: {
        type: Number,
        default: 0,
        min: 0
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});
EmailTemplateSchema.index({ type: 1, isActive: 1 });
EmailTemplateSchema.index({ createdBy: 1, updatedAt: -1 });
exports.default = mongoose_1.default.model('EmailTemplate', EmailTemplateSchema);
//# sourceMappingURL=EmailTemplate.js.map