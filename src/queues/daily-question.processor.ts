import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Couple, CoupleDocument } from '../schemas/couple.schema';
import { NotificationsService } from '../v1/notifications/notifications.service';
import { QuestionsService } from '../v1/questions/questions.service';
import { NotificationType } from '../schemas/notification.schema';
import { WinstonLoggerService } from '../logger/winston-logger.service';

@Injectable()
export class DailyQuestionProcessor implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Couple.name) private readonly coupleModel: Model<CoupleDocument>,
    private readonly questionsService: QuestionsService,
    private readonly notificationsService: NotificationsService,
    private readonly logger: WinstonLoggerService,
  ) {}

  async onModuleInit() {
    await this.questionsService.seedDefaultQuestions();
  }

  @Cron('0 8 * * *', { timeZone: 'UTC' })
  async sendDailyQuestionNotifications() {
    this.logger.log('Running daily question cron job');

    const question = await this.questionsService.getOrCreateTodayQuestion();
    if (!question) {
      this.logger.warn('No question found for today');
      return;
    }

    const activeCouples = await this.coupleModel.find({ status: 'active' }).lean();

    for (const couple of activeCouples) {
      const userIds = [couple.user1.toString(), couple.user2?.toString()].filter(Boolean) as string[];

      for (const userId of userIds) {
        const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
        if (!user) continue;

        await this.notificationsService.createNotification(
          userId,
          NotificationType.DAILY_QUESTION,
          "Today's Question is Ready! 💬",
          question.text,
          { questionId: (question._id as any).toString() },
        );

        if (user.fcmToken) {
          await this.notificationsService.sendFcm(
            user.fcmToken,
            "Today's Question is Ready! 💬",
            question.text,
            { type: 'daily_question', questionId: (question._id as any).toString() },
          );
        }
      }
    }

    this.logger.log(`Daily question notifications sent for ${activeCouples.length} couples`);
  }
}
