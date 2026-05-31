import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Couple, CoupleSchema } from '../../schemas/couple.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Couple.name, schema: CoupleSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
