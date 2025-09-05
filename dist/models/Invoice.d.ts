import mongoose, { Document } from 'mongoose';
export interface IInvoice extends Document {
    userId: string;
    bookingId?: string;
    subscriptionId?: string;
    invoiceNumber: string;
    amount: number;
    tax: number;
    totalAmount: number;
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
    paymentMethod?: 'stripe' | 'cashapp' | 'cash' | 'check';
    paymentId?: string;
    dueDate: Date;
    paidAt?: Date;
    description: string;
    lineItems: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
    }>;
    customerInfo: {
        name: string;
        email: string;
        phone?: string;
        address?: string;
    };
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IInvoice, {}, {}, {}, mongoose.Document<unknown, {}, IInvoice, {}, {}> & IInvoice & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Invoice.d.ts.map