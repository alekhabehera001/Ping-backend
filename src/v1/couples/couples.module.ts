import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Couple, CoupleSchema } from '../../schemas/couple.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { CouplesController } from './couples.controller';
import { CouplesService } from './couples.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Couple.name, schema: CoupleSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [CouplesController],
  providers: [CouplesService],
  exports: [CouplesService],
})
export class CouplesModule {}
