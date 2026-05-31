import { EventEmitter2 } from '@nestjs/event-emitter';
import { Model, Types } from 'mongoose';
import { Answer, AnswerDocument } from '../../schemas/answer.schema';
import { CoupleDocument } from '../../schemas/couple.schema';
import { QuestionDocument } from '../../schemas/question.schema';
import { StreakDocument } from '../../schemas/streak.schema';
import { UserDocument } from '../../schemas/user.schema';
export declare class AnswersService {
    private readonly answerModel;
    private readonly questionModel;
    private readonly coupleModel;
    private readonly streakModel;
    private readonly userModel;
    private readonly eventEmitter;
    constructor(answerModel: Model<AnswerDocument>, questionModel: Model<QuestionDocument>, coupleModel: Model<CoupleDocument>, streakModel: Model<StreakDocument>, userModel: Model<UserDocument>, eventEmitter: EventEmitter2);
    submitAnswer(userId: string, questionId: string, text: string): Promise<import("mongoose").Document<unknown, {}, AnswerDocument, {}, {}> & Answer & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    private checkAndRevealAnswers;
    private updateStreak;
    getTodayAnswers(userId: string, questionId: string): Promise<{
        myAnswer: (import("mongoose").FlattenMaps<AnswerDocument> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        }) | null;
        partnerAnswer: (import("mongoose").FlattenMaps<AnswerDocument> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        }) | null | undefined;
        bothAnswered: boolean;
    }>;
    getHistory(userId: string, page: number, limit: number): Promise<{
        items: (import("mongoose").FlattenMaps<AnswerDocument> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
    }>;
}
