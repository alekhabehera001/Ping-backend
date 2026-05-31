import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { Couple, CoupleSchema } from '../schemas/couple.schema';
import { Question, QuestionSchema } from '../schemas/question.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { NotificationsModule } from '../v1/notifications/notifications.module';
import { QuestionsModule } from '../v1/questions/questions.module';
import { WinstonLoggerModule } from '../logger/winston-logger.module';
import { DailyQuestionProcessor } from './daily-question.processor';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Couple.name, schema: CoupleSchema },
      { name: Question.name, schema: QuestionSchema },
    ]),
    NotificationsModule,
    QuestionsModule,
    WinstonLoggerModule,
  ],
  providers: [DailyQuestionProcessor],
})
export class QueuesModule {}
