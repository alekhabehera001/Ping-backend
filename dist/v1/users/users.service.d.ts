import { Model, Types } from 'mongoose';
import { CoupleDocument } from '../../schemas/couple.schema';
import { UserDocument } from '../../schemas/user.schema';
export declare class UsersService {
    private readonly userModel;
    private readonly coupleModel;
    constructor(userModel: Model<UserDocument>, coupleModel: Model<CoupleDocument>);
    getMe(userId: string): Promise<import("mongoose").FlattenMaps<UserDocument> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateMe(userId: string, data: {
        name?: string;
        avatar?: string;
        fcmToken?: string;
    }): Promise<import("mongoose").FlattenMaps<UserDocument> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getPartner(userId: string): Promise<import("mongoose").FlattenMaps<UserDocument> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findById(userId: string | Types.ObjectId): Promise<(import("mongoose").FlattenMaps<UserDocument> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
}
