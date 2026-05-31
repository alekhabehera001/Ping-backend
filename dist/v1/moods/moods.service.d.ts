import { EventEmitter2 } from '@nestjs/event-emitter';
import { Model, Types } from 'mongoose';
import { CoupleDocument } from '../../schemas/couple.schema';
import { Mood, MoodDocument, MoodType } from '../../schemas/mood.schema';
import { UserDocument } from '../../schemas/user.schema';
export declare class MoodsService {
    private readonly moodModel;
    private readonly userModel;
    private readonly coupleModel;
    private readonly eventEmitter;
    constructor(moodModel: Model<MoodDocument>, userModel: Model<UserDocument>, coupleModel: Model<CoupleDocument>, eventEmitter: EventEmitter2);
    createMood(userId: string, mood: MoodType, note?: string): Promise<import("mongoose").Document<unknown, {}, MoodDocument, {}, {}> & Mood & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getLatestMoods(userId: string): Promise<{
        myMood: (import("mongoose").FlattenMaps<MoodDocument> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        }) | null;
        partnerMood: (import("mongoose").FlattenMaps<MoodDocument> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        }) | null;
    }>;
    getMoodHistory(userId: string, page: number, limit: number): Promise<{
        items: (import("mongoose").FlattenMaps<MoodDocument> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
    }>;
}
