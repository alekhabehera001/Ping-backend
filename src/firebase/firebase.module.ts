import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonLoggerModule } from '../logger/winston-logger.module';
import { FirebaseService } from './firebase.service';

@Module({
  imports: [ConfigModule, WinstonLoggerModule],
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}
