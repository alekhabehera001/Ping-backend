import { MemoriesService } from './memories.service';
export declare class MemoriesController {
    private readonly memoriesService;
    constructor(memoriesService: MemoriesService);
    getPresigned(req: any, body: any): Promise<{
        message: string;
        data: {
            uploadUrl: string;
            key: string;
            publicUrl: string;
        };
    }>;
    create(req: any, body: any): Promise<{
        message: string;
        data: import("mongoose").Document<unknown, {}, import("../../schemas/memory.schema").MemoryDocument, {}, {}> & import("../../schemas/memory.schema").Memory & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
    }>;
    getTimeline(req: any, query: any): Promise<{
        message: string;
        data: {
            items: (import("mongoose").FlattenMaps<import("../../schemas/memory.schema").MemoryDocument> & Required<{
                _id: import("mongoose").Types.ObjectId;
            }> & {
                __v: number;
            })[];
            nextCursor: any;
        };
    }>;
    getMonthlyRecap(req: any): Promise<{
        message: string;
        data: any[];
    }>;
    deleteMemory(req: any, id: string): Promise<{
        message: string;
    }>;
}
