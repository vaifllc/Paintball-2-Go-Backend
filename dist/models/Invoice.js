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
const InvoiceSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        required: true,
        ref: 'User'
    },
    bookingId: {
        type: String,
        ref: 'Booking'
    },
    subscriptionId: {
        type: String,
        ref: 'Subscription'
    },
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    tax: {
        type: Number,
        default: 0,
        min: 0
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
        default: 'draft'
    },
    paymentMethod: {
        type: String,
        enum: ['stripe', 'cashapp', 'cash', 'check']
    },
    paymentId: {
        type: String
    },
    dueDate: {
        type: Date,
        required: true
    },
    paidAt: {
        type: Date
    },
    description: {
        type: String,
        required: true
    },
    lineItems: [{
            description: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            unitPrice: {
                type: Number,
                required: true,
                min: 0
            },
            totalPrice: {
                type: Number,
                required: true,
                min: 0
            }
        }],
    customerInfo: {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String
        },
        address: {
            type: String
        }
    },
    notes: {
        type: String,
        maxlength: 1000
    }
}, {
    timestamps: true
});
InvoiceSchema.pre('save', async function (next) {
    if (!this.invoiceNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const count = await mongoose_1.default.model('Invoice').countDocuments({
            createdAt: {
                $gte: new Date(year, date.getMonth(), 1),
                $lt: new Date(year, date.getMonth() + 1, 1)
            }
        });
        this.invoiceNumber = `INV-${year}${month}-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});
InvoiceSchema.index({ userId: 1, status: 1 });
InvoiceSchema.index({ invoiceNumber: 1 });
InvoiceSchema.index({ dueDate: 1 });
exports.default = mongoose_1.default.model('Invoice', InvoiceSchema);
//# sourceMappingURL=Invoice.js.map