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
const ContentBlockSchema = new mongoose_1.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    section: {
        type: String,
        required: [true, 'Section is required'],
        trim: true,
        index: true
    },
    type: {
        type: String,
        required: [true, 'Type is required'],
        trim: true,
        index: true
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot be more than 200 characters']
    },
    content: {
        type: String,
        required: [true, 'Content is required']
    },
    metadata: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {}
    },
    lastModified: {
        type: Date,
        default: Date.now
    },
    author: {
        type: String,
        required: [true, 'Author is required'],
        trim: true
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft',
        index: true
    },
    version: {
        type: Number,
        default: 1,
        min: 1
    }
}, {
    timestamps: true
});
ContentBlockSchema.index({ section: 1, type: 1 });
ContentBlockSchema.index({ status: 1, lastModified: -1 });
exports.default = mongoose_1.default.model('ContentBlock', ContentBlockSchema);
//# sourceMappingURL=ContentBlock.js.map