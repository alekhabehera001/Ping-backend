import { S3Service } from '../../services/s3.service';
export declare class UploadsController {
    private readonly s3Service;
    constructor(s3Service: S3Service);
    getPresigned(req: any, body: any): Promise<{
        message: string;
        data: {
            uploadUrl: string;
            key: string;
            publicUrl: string;
        };
    }>;
}
