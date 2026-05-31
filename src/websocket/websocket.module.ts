import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, UserSchema } from '../schemas/user.schema';
import { WinstonLoggerModule } from '../logger/winston-logger.module';
import { PingGateway } from './ping.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: Buffer.from(config.get<string>('JWT_SECRET') || '', 'base64').toString('utf8'),
      }),
      inject: [ConfigService],
    }),
    WinstonLoggerModule,
  ],
  providers: [PingGateway],
  exports: [PingGateway],
})
export class WebSocketModule {}
