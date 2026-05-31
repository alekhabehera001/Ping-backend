import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';
import { WinstonLoggerModule } from 'src/logger/winston-logger.module';

@Module({
  imports: [WinstonLoggerModule],
  providers: [S3Service],
  exports: [S3Service],
})
export class S3Module {}
