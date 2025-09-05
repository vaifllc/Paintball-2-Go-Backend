import mongoose, { Document } from 'mongoose';
export interface IEmailCampaign extends Document {
    name: string;
    subject: string;
    templateId: mongoose.Types.ObjectId;
    recipientFilter: {
        type: 'all' | 'selected' | 'tag';
        selectedUsers?: mongoose.Types.ObjectId[];
        tags?: string[];
    };
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
    scheduledAt?: Date;
    sentAt?: Date;
    recipientCount: number;
    deliveredCount: number;
    openedCount: number;
    clickedCount: number;
    failedCount: number;
    openRate: number;
    clickRate: number;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IEmailCampaign, {}, {}, {}, mongoose.Document<unknown, {}, IEmailCampaign, {}, {}> & IEmailCampaign & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=EmailCampaign.d.ts.map