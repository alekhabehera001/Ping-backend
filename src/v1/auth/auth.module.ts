import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WinstonLoggerModule } from '../../logger/winston-logger.module';
import { User, UserSchema } from '../../schemas/user.schema';
import { EmailService } from '../../services/email.service';
import { TokenService } from '../../services/token.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    WinstonLoggerModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenService, EmailService],
  exports: [AuthService],
})
export class AuthModule {}
