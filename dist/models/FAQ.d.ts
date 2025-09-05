import mongoose, { Document } from 'mongoose';
export interface IFAQ extends Document {
    question: string;
    answer: string;
    category: string;
    order: number;
    isActive: boolean;
    tags: string[];
    lastModified: Date;
    modifiedBy: string;
    views: number;
    helpful: number;
    notHelpful: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IFAQ, {}, {}, {}, mongoose.Document<unknown, {}, IFAQ, {}, {}> & IFAQ & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=FAQ.d.ts.map