import { Model } from 'mongoose';
import { CoupleDocument } from '../../schemas/couple.schema';
import { UserDocument } from '../../schemas/user.schema';
export declare class CouplesService {
    private readonly coupleModel;
    private readonly userModel;
    constructor(coupleModel: Model<CoupleDocument>, userModel: Model<UserDocument>);
    generateInvite(userId: string): Promise<{
        inviteCode: string;
        coupleId: string;
    }>;
    joinCouple(userId: string, inviteCode: string): Promise<object>;
    getCouple(userId: string): Promise<object>;
    setAnniversary(userId: string, anniversary: Date): Promise<object>;
    unlinkPartner(userId: string): Promise<void>;
    getCoupleIdForUser(userId: string): Promise<string | null>;
    getPartnerFcmToken(userId: string): Promise<string | null>;
}
