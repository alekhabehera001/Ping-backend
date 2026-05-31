import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { WinstonLoggerService } from "../logger/winston-logger.service";
export declare class S3Service {
    private readonly configService;
    private readonly logger;
    private s3Client;
    constructor(configService: ConfigService, logger: WinstonLoggerService);
    setS3Client(client: S3Client): void;
    generatePresignedPutUrl(bucket: string, key: string, contentType: string, expiresIn: number): Promise<string>;
    generatePresignedGetUrl(bucket: string, key: string, expiresIn: number): Promise<string>;
    deleteObject(bucket: string, key: string): Promise<void>;
}
