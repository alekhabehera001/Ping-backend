import { Body, Controller, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JoiValidationPipe } from '../../common/pipes/joi-validation.pipe';
import { JwtAuthGuard } from '../../guards/jwt.guard';
import { S3Service } from '../../services/s3.service';
import Joi from 'joi';

const presignedSchema = Joi.object({
  contentType: Joi.string()
    .valid('image/jpeg', 'image/png', 'image/webp', 'audio/m4a', 'audio/x-m4a')
    .required(),
  fileName: Joi.string().max(200).required(),
  folder: Joi.string().valid('avatars', 'memories').default('memories'),
});

const S3_BUCKET = process.env.AWS_S3_BUCKET || 'ping-app-memories';

@ApiTags('Uploads')
@Controller('v1/uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly s3Service: S3Service) {}

  @Post('presigned')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate S3 presigned upload URL' })
  async getPresigned(
    @Request() req: any,
    @Body(new JoiValidationPipe(presignedSchema)) body: any,
  ) {
    const ext = body.fileName.split('.').pop()?.toLowerCase() || 'bin';
    const key = `${body.folder}/${req.user._id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const uploadUrl = await this.s3Service.generatePresignedPutUrl(S3_BUCKET, key, body.contentType, 300);
    const publicUrl = `https://${S3_BUCKET}.s3.amazonaws.com/${key}`;
    return { message: 'Presigned URL generated', data: { uploadUrl, key, publicUrl } };
  }
}
