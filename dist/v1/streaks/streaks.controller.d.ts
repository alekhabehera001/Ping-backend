import { StreaksService } from './streaks.service';
export declare class StreaksController {
    private readonly streaksService;
    constructor(streaksService: StreaksService);
    getStreak(req: any): Promise<{
        message: string;
        data: (import("../../schemas/streak.schema").Streak & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        }) | (import("mongoose").FlattenMaps<import("../../schemas/streak.schema").StreakDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        });
    }>;
    recoverStreak(req: any): Promise<{
        message: string;
    }>;
}
