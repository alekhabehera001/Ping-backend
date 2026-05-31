import { EventEmitter2 } from '@nestjs/event-emitter';
import { Model, Types } from 'mongoose';
import { S3Service } from '../../services/s3.service';
import { Memory, MemoryDocument, MemoryType } from '../../schemas/memory.schema';
import { UserDocument } from '../../schemas/user.schema';
export declare class MemoriesService {
    private readonly memoryModel;
    private readonly userModel;
    private readonly s3Service;
    private readonly eventEmitter;
    constructor(memoryModel: Model<MemoryDocument>, userModel: Model<UserDocument>, s3Service: S3Service, eventEmitter: EventEmitter2);
    getPresignedUrl(userId: string, contentType: string, fileName: string): Promise<{
        uploadUrl: string;
        key: string;
        publicUrl: string;
    }>;
    createMemory(userId: string, data: {
        type: MemoryType;
        s3Key?: string;
        caption?: string;
        noteText?: string;
    }): Promise<import("mongoose").Document<unknown, {}, MemoryDocument, {}, {}> & Memory & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getTimeline(userId: string, cursor?: string, limit?: number): Promise<{
        items: (import("mongoose").FlattenMaps<MemoryDocument> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        nextCursor: any;
    }>;
    getMonthlyRecap(userId: string): Promise<any[]>;
    deleteMemory(userId: string, memoryId: string): Promise<void>;
}
