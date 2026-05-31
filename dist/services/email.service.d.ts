import { ConfigService } from '@nestjs/config';
import { WinstonLoggerService } from "../logger/winston-logger.service";
export declare class EmailService {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService, logger: WinstonLoggerService);
    private sesConfig;
    private sendViaSes;
    sendOtpEmail(email: string, otp: string): Promise<void>;
}
