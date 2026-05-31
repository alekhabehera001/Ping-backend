import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMe(req: any): Promise<{
        message: string;
        data: import("mongoose").FlattenMaps<import("../../schemas/user.schema").UserDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
    }>;
    updateMe(req: any, body: any): Promise<{
        message: string;
        data: import("mongoose").FlattenMaps<import("../../schemas/user.schema").UserDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
    }>;
    getPartner(req: any): Promise<{
        message: string;
        data: import("mongoose").FlattenMaps<import("../../schemas/user.schema").UserDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
    }>;
}
