import { CouplesService } from './couples.service';
export declare class CouplesController {
    private readonly couplesService;
    constructor(couplesService: CouplesService);
    generateInvite(req: any): Promise<{
        message: string;
        data: {
            inviteCode: string;
            coupleId: string;
        };
    }>;
    joinCouple(req: any, body: any): Promise<{
        message: string;
        data: object;
    }>;
    getCouple(req: any): Promise<{
        message: string;
        data: object;
    }>;
    setAnniversary(req: any, body: any): Promise<{
        message: string;
        data: object;
    }>;
    unlinkPartner(req: any): Promise<{
        message: string;
    }>;
}
