import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Answer, AnswerSchema } from '../../schemas/answer.schema';
import { Couple, CoupleSchema } from '../../schemas/couple.schema';
import { Question, QuestionSchema } from '../../schemas/question.schema';
import { Streak, StreakSchema } from '../../schemas/streak.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { AnswersController } from './answers.controller';
import { AnswersService } from './answers.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Answer.name, schema: AnswerSchema },
      { name: Question.name, schema: QuestionSchema },
      { name: Couple.name, schema: CoupleSchema },
      { name: Streak.name, schema: StreakSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [AnswersController],
  providers: [AnswersService],
  exports: [AnswersService],
})
export class AnswersModule {}
