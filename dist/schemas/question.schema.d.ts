import { Document } from 'mongoose';
export type QuestionDocument = Question & Document;
export declare enum QuestionCategory {
    EMOTIONAL = "emotional",
    ROMANTIC = "romantic",
    FUNNY = "funny",
    FUTURE_GOALS = "future_goals",
    STRESS = "stress",
    APPRECIATION = "appreciation"
}
export declare class Question extends Document {
    text: string;
    category: QuestionCategory;
    scheduledFor: Date;
    isActive: boolean;
    createdByAdmin: boolean;
}
export declare const QuestionSchema: import("mongoose").Schema<Question, import("mongoose").Model<Question, any, any, any, Document<unknown, any, Question, any, {}> & Question & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Question, Document<unknown, {}, import("mongoose").FlatRecord<Question>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Question> & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
