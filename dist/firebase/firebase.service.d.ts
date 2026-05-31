import { ConfigService } from '@nestjs/config';
import { WinstonLoggerService } from "../logger/winston-logger.service";
export interface VerifiedFirebaseSocialToken {
    email: string | undefined;
    firebaseUid: string;
    stableSocialId: string;
    signInProvider: string;
    appProvider: string;
}
export declare class FirebaseService {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService, logger: WinstonLoggerService);
    verifySocialIdToken(idToken: string): Promise<VerifiedFirebaseSocialToken>;
}
