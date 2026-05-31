import { OnModuleInit } from '@nestjs/common';
import { WinstonLoggerService } from '../logger/winston-logger.service';
export declare class DatabaseService implements OnModuleInit {
    private readonly loggers;
    constructor(loggers: WinstonLoggerService);
    onModuleInit(): void;
}
