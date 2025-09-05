import mongoose, { Document } from 'mongoose';
export interface IBooking extends Document {
    userId: string;
    activityType: 'paintball' | 'gellyball' | 'archery' | 'axe-throwing' | 'cornhole';
    date: Date;
    timeSlot: string;
    location: string;
    participants: number;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    totalAmount: number;
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    paymentId?: string;
    customerInfo: {
        name: string;
        email: string;
        phone: string;
        address?: string;
    };
    addOns: Array<{
        name: string;
        price: number;
        quantity: number;
    }>;
    specialRequests?: string;
    waiverSigned: boolean;
    waiverSignedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IBooking, {}, {}, {}, mongoose.Document<unknown, {}, IBooking, {}, {}> & IBooking & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Booking.d.ts.map