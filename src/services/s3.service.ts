import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { WinstonLoggerService } from 'src/logger/winston-logger.service';

@Injectable()
export class S3Service {
  private s3Client: S3Client;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: WinstonLoggerService,
  ) {
    const region = this.configService.get<string>('AWS_REGION') || 'eu-central-1';
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID') || '';
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '';

    this.s3Client = new S3Client({
      region,
      credentials: accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined,
    });

    // The flexible-checksums middleware (added in AWS SDK v3 ≥ 3.525) computes
    // a CRC32 of an empty body (AAAAAA== = 0x00000000) and embeds it as
    // x-amz-checksum-crc32 + x-amz-sdk-checksum-algorithm in presigned URLs.
    // Any real upload will have a different CRC32 → S3 rejects the PUT silently.
    // This middleware runs at 'build'/low — after checksums are added (normal
    // priority) but before Signature V4 signing (finalizeRequest) — so the
    // stripped params are absent from the canonical request and the signed URL.

    this.s3Client.middlewareStack.add(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (next: any) => async (args: any) => {
        const headers: Record<string, string> = args?.request?.headers ?? {};
        delete headers['x-amz-sdk-checksum-algorithm'];
        delete headers['x-amz-checksum-crc32'];
        delete headers['x-amz-checksum-crc32c'];
        delete headers['x-amz-checksum-sha1'];
        delete headers['x-amz-checksum-sha256'];
        delete headers['x-amz-checksum-mode'];
        return next(args);
      },
      { step: 'build', priority: 'low', name: 'stripChecksumMiddleware' },
    );
  }

  setS3Client(client: S3Client): void {
    this.s3Client = client;
  }

  /**
   * Generates a presigned PUT URL. ContentType is enforced via a signed header —
   * S3 will reject any upload whose Content-Type header does not match.
   */
  async generatePresignedPutUrl(
    bucket: string,
    key: string,
    contentType: string,
    expiresIn: number,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });

    try {
      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to generate presigned PUT URL: ${msg}`, 'S3Service');
      throw new Error('Failed to generate upload URL');
    }
  }

  async generatePresignedGetUrl(bucket: string, key: string, expiresIn: number): Promise<string> {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    try {
      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to generate presigned GET URL: ${msg}`, 'S3Service');
      throw new Error('Failed to generate signed URL');
    }
  }

  async deleteObject(bucket: string, key: string): Promise<void> {
    try {
      await this.s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Failed to delete S3 object ${key}: ${msg}`, 'S3Service');
    }
  }
}
