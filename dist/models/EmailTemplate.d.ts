import mongoose, { Document } from 'mongoose';
export interface IEmailTemplate extends Document {
    name: string;
    subject: string;
    content: string;
    type: 'marketing' | 'transactional' | 'newsletter';
    isActive: boolean;
    variables: string[];
    lastUsed?: Date;
    usageCount: number;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IEmailTemplate, {}, {}, {}, mongoose.Document<unknown, {}, IEmailTemplate, {}, {}> & IEmailTemplate & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=EmailTemplate.d.ts.map