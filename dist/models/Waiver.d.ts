import mongoose, { Document } from 'mongoose';
export interface IWaiver extends Document {
    userId?: string;
    participantInfo: {
        name: string;
        email: string;
        phone: string;
        dateOfBirth: Date;
        address: {
            street: string;
            city: string;
            state: string;
            zipCode: string;
        };
    };
    parentGuardianInfo?: {
        name: string;
        email: string;
        phone: string;
        relationship: string;
    };
    emergencyContact: {
        name: string;
        phone: string;
        relationship: string;
    };
    medicalInfo?: {
        conditions: string;
        medications: string;
        allergies: string;
    };
    activities: string[];
    signatureData: {
        signature: string;
        signedAt: Date;
        ipAddress: string;
        userAgent: string;
    };
    agreedToTerms: boolean;
    agreedToPhotography: boolean;
    isMinor: boolean;
    waiverVersion: string;
    status: 'active' | 'expired' | 'revoked';
    expiresAt: Date;
    bookingIds: string[];
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IWaiver, {}, {}, {}, mongoose.Document<unknown, {}, IWaiver, {}, {}> & IWaiver & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Waiver.d.ts.map