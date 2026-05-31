import { Model } from 'mongoose';
import { Streak, StreakDocument } from '../../schemas/streak.schema';
import { UserDocument } from '../../schemas/user.schema';
export declare class StreaksService {
    private readonly streakModel;
    private readonly userModel;
    constructor(streakModel: Model<StreakDocument>, userModel: Model<UserDocument>);
    getStreak(userId: string): Promise<(Streak & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | (import("mongoose").FlattenMaps<StreakDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })>;
    recoverStreak(userId: string): Promise<void>;
}
