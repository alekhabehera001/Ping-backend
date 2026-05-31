import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Couple, CoupleSchema } from '../../schemas/couple.schema';
import { Mood, MoodSchema } from '../../schemas/mood.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { MoodsController } from './moods.controller';
import { MoodsService } from './moods.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Mood.name, schema: MoodSchema },
      { name: User.name, schema: UserSchema },
      { name: Couple.name, schema: CoupleSchema },
    ]),
  ],
  controllers: [MoodsController],
  providers: [MoodsService],
  exports: [MoodsService],
})
export class MoodsModule {}
