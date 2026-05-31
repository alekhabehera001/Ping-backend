import mongoose, { Document, Types } from 'mongoose';
export type CoupleDocument = Couple & Document;
export declare enum CoupleStatus {
    PENDING = "pending",
    ACTIVE = "active",
    UNLINKED = "unlinked"
}
export declare class Couple extends Document {
    user1: Types.ObjectId;
    user2?: Types.ObjectId;
    inviteCode: string;
    status: CoupleStatus;
    anniversary?: Date;
    unlinkedAt?: Date;
}
export declare const CoupleSchema: mongoose.Schema<Couple, mongoose.Model<Couple, any, any, any, mongoose.Document<unknown, any, Couple, any, {}> & Couple & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Couple, mongoose.Document<unknown, {}, mongoose.FlatRecord<Couple>, {}, mongoose.DefaultSchemaOptions> & mongoose.FlatRecord<Couple> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
