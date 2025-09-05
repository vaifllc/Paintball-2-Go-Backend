import mongoose, { Document } from 'mongoose';
export interface IContentBlock extends Document {
    id: string;
    section: string;
    type: string;
    title: string;
    content: string;
    metadata?: Record<string, any>;
    lastModified: Date;
    author: string;
    status: 'draft' | 'published';
    version: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IContentBlock, {}, {}, {}, mongoose.Document<unknown, {}, IContentBlock, {}, {}> & IContentBlock & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=ContentBlock.d.ts.map