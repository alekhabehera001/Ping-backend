import mongoose, { Document, Types } from 'mongoose';
export type MoodDocument = Mood & Document;
export declare enum MoodType {
    HAPPY = "happy",
    SAD = "sad",
    STRESSED = "stressed",
    ANGRY = "angry",
    EXCITED = "excited",
    LOVED = "loved",
    TIRED = "tired"
}
export declare class Mood extends Document {
    userId: Types.ObjectId;
    coupleId: Types.ObjectId;
    mood: MoodType;
    note?: string;
}
export declare const MoodSchema: mongoose.Schema<Mood, mongoose.Model<Mood, any, any, any, mongoose.Document<unknown, any, Mood, any, {}> & Mood & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Mood, mongoose.Document<unknown, {}, mongoose.FlatRecord<Mood>, {}, mongoose.DefaultSchemaOptions> & mongoose.FlatRecord<Mood> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
