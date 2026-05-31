import { OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { UserDocument } from '../schemas/user.schema';
import { CoupleDocument } from '../schemas/couple.schema';
import { NotificationsService } from '../v1/notifications/notifications.service';
import { QuestionsService } from '../v1/questions/questions.service';
import { WinstonLoggerService } from '../logger/winston-logger.service';
export declare class DailyQuestionProcessor implements OnModuleInit {
    private readonly userModel;
    private readonly coupleModel;
    private readonly questionsService;
    private readonly notificationsService;
    private readonly logger;
    constructor(userModel: Model<UserDocument>, coupleModel: Model<CoupleDocument>, questionsService: QuestionsService, notificationsService: NotificationsService, logger: WinstonLoggerService);
    onModuleInit(): Promise<void>;
    sendDailyQuestionNotifications(): Promise<void>;
}
