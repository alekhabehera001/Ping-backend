"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const winston_logger_service_1 = require("../logger/winston-logger.service");
let S3Service = class S3Service {
    constructor(configService, logger) {
        this.configService = configService;
        this.logger = logger;
        const region = this.configService.get('AWS_REGION') || 'eu-central-1';
        const accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID') || '';
        const secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY') || '';
        this.s3Client = new client_s3_1.S3Client({
            region,
            credentials: accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined,
        });
        this.s3Client.middlewareStack.add((next) => async (args) => {
            const headers = args?.request?.headers ?? {};
            delete headers['x-amz-sdk-checksum-algorithm'];
            delete headers['x-amz-checksum-crc32'];
            delete headers['x-amz-checksum-crc32c'];
            delete headers['x-amz-checksum-sha1'];
            delete headers['x-amz-checksum-sha256'];
            delete headers['x-amz-checksum-mode'];
            return next(args);
        }, { step: 'build', priority: 'low', name: 'stripChecksumMiddleware' });
    }
    setS3Client(client) {
        this.s3Client = client;
    }
    async generatePresignedPutUrl(bucket, key, contentType, expiresIn) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket: bucket,
            Key: key,
            ContentType: contentType,
        });
        try {
            return await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn });
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            this.logger.error(`Failed to generate presigned PUT URL: ${msg}`, 'S3Service');
            throw new Error('Failed to generate upload URL');
        }
    }
    async generatePresignedGetUrl(bucket, key, expiresIn) {
        const command = new client_s3_1.GetObjectCommand({ Bucket: bucket, Key: key });
        try {
            return await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn });
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            this.logger.error(`Failed to generate presigned GET URL: ${msg}`, 'S3Service');
            throw new Error('Failed to generate signed URL');
        }
    }
    async deleteObject(bucket, key) {
        try {
            await this.s3Client.send(new client_s3_1.DeleteObjectCommand({ Bucket: bucket, Key: key }));
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            this.logger.warn(`Failed to delete S3 object ${key}: ${msg}`, 'S3Service');
        }
    }
};
exports.S3Service = S3Service;
exports.S3Service = S3Service = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        winston_logger_service_1.WinstonLoggerService])
], S3Service);
//# sourceMappingURL=s3.service.js.map