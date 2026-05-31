import mongoose, { Document, Types } from 'mongoose';
export type MemoryDocument = Memory & Document;
export declare enum MemoryType {
    PHOTO = "photo",
    VOICE = "voice",
    NOTE = "note"
}
export declare class Memory extends Document {
    coupleId: Types.ObjectId;
    uploadedBy: Types.ObjectId;
    type: MemoryType;
    s3Key?: string;
    s3Url?: string;
    caption?: string;
    noteText?: string;
    isDeleted: boolean;
}
export declare const MemorySchema: mongoose.Schema<Memory, mongoose.Model<Memory, any, any, any, mongoose.Document<unknown, any, Memory, any, {}> & Memory & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Memory, mongoose.Document<unknown, {}, mongoose.FlatRecord<Memory>, {}, mongoose.DefaultSchemaOptions> & mongoose.FlatRecord<Memory> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
