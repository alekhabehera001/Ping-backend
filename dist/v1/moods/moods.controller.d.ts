import { MoodsService } from './moods.service';
export declare class MoodsController {
    private readonly moodsService;
    constructor(moodsService: MoodsService);
    createMood(req: any, body: any): Promise<{
        message: string;
        data: import("mongoose").Document<unknown, {}, import("../../schemas/mood.schema").MoodDocument, {}, {}> & import("../../schemas/mood.schema").Mood & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
    }>;
    getLatest(req: any): Promise<{
        message: string;
        data: {
            myMood: (import("mongoose").FlattenMaps<import("../../schemas/mood.schema").MoodDocument> & Required<{
                _id: import("mongoose").Types.ObjectId;
            }> & {
                __v: number;
            }) | null;
            partnerMood: (import("mongoose").FlattenMaps<import("../../schemas/mood.schema").MoodDocument> & Required<{
                _id: import("mongoose").Types.ObjectId;
            }> & {
                __v: number;
            }) | null;
        };
    }>;
    getHistory(req: any, query: any): Promise<{
        message: string;
        data: {
            items: (import("mongoose").FlattenMaps<import("../../schemas/mood.schema").MoodDocument> & Required<{
                _id: import("mongoose").Types.ObjectId;
            }> & {
                __v: number;
            })[];
            total: number;
            page: any;
            limit: any;
        };
    }>;
}
