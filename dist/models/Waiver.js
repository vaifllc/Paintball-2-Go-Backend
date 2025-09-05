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
const WaiverSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        ref: 'User'
    },
    participantInfo: {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        dateOfBirth: {
            type: Date,
            required: true
        },
        address: {
            street: {
                type: String,
                required: true,
                trim: true
            },
            city: {
                type: String,
                required: true,
                trim: true
            },
            state: {
                type: String,
                required: true,
                trim: true
            },
            zipCode: {
                type: String,
                required: true,
                trim: true
            }
        }
    },
    parentGuardianInfo: {
        name: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            trim: true,
            lowercase: true
        },
        phone: {
            type: String,
            trim: true
        },
        relationship: {
            type: String,
            trim: true
        }
    },
    emergencyContact: {
        name: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        relationship: {
            type: String,
            required: true,
            trim: true
        }
    },
    medicalInfo: {
        conditions: {
            type: String,
            trim: true,
            default: ''
        },
        medications: {
            type: String,
            trim: true,
            default: ''
        },
        allergies: {
            type: String,
            trim: true,
            default: ''
        }
    },
    activities: [{
            type: String,
            enum: ['paintball', 'gellyball', 'archery', 'axe-throwing']
        }],
    signatureData: {
        signature: {
            type: String,
            required: true
        },
        signedAt: {
            type: Date,
            required: true,
            default: Date.now
        },
        ipAddress: {
            type: String,
            required: true
        },
        userAgent: {
            type: String,
            required: true
        }
    },
    agreedToTerms: {
        type: Boolean,
        required: true,
        default: false
    },
    agreedToPhotography: {
        type: Boolean,
        required: true,
        default: false
    },
    isMinor: {
        type: Boolean,
        required: true
    },
    waiverVersion: {
        type: String,
        required: true,
        default: '1.0'
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'revoked'],
        default: 'active'
    },
    expiresAt: {
        type: Date,
        required: true
    },
    bookingIds: [{
            type: String,
            ref: 'Booking'
        }]
}, {
    timestamps: true
});
WaiverSchema.pre('save', function (next) {
    const now = new Date();
    const eighteenYearsAgo = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());
    this.isMinor = this.participantInfo.dateOfBirth > eighteenYearsAgo;
    if (!this.expiresAt) {
        this.expiresAt = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    }
    next();
});
WaiverSchema.index({ 'participantInfo.email': 1 });
WaiverSchema.index({ userId: 1 });
WaiverSchema.index({ status: 1, expiresAt: 1 });
WaiverSchema.index({ bookingIds: 1 });
exports.default = mongoose_1.default.model('Waiver', WaiverSchema);
//# sourceMappingURL=Waiver.js.map