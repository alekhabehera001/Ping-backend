import mongoose, { Document, Types } from 'mongoose';
export type AnswerDocument = Answer & Document;
export declare class Answer extends Document {
    questionId: Types.ObjectId;
    userId: Types.ObjectId;
    coupleId: Types.ObjectId;
    text: string;
    isRevealed: boolean;
}
export declare const AnswerSchema: mongoose.Schema<Answer, mongoose.Model<Answer, any, any, any, mongoose.Document<unknown, any, Answer, any, {}> & Answer & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Answer, mongoose.Document<unknown, {}, mongoose.FlatRecord<Answer>, {}, mongoose.DefaultSchemaOptions> & mongoose.FlatRecord<Answer> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
