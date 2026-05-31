import mongoose, { Document, Types } from 'mongoose';
export declare enum StreakBadge {
    WEEK = "week",
    MONTH = "month",
    CENTURY = "century"
}
export type StreakDocument = Streak & Document;
export declare class Streak extends Document {
    coupleId: Types.ObjectId;
    currentStreak: number;
    longestStreak: number;
    lastAnsweredDate?: Date;
    badges: StreakBadge[];
    recoveryTokens: number;
}
export declare const StreakSchema: mongoose.Schema<Streak, mongoose.Model<Streak, any, any, any, mongoose.Document<unknown, any, Streak, any, {}> & Streak & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Streak, mongoose.Document<unknown, {}, mongoose.FlatRecord<Streak>, {}, mongoose.DefaultSchemaOptions> & mongoose.FlatRecord<Streak> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
