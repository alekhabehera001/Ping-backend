"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DailyQuestionProcessor = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const schedule_1 = require("@nestjs/schedule");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../schemas/user.schema");
const couple_schema_1 = require("../schemas/couple.schema");
const notifications_service_1 = require("../v1/notifications/notifications.service");
const questions_service_1 = require("../v1/questions/questions.service");
const notification_schema_1 = require("../schemas/notification.schema");
const winston_logger_service_1 = require("../logger/winston-logger.service");
let DailyQuestionProcessor = class DailyQuestionProcessor {
    constructor(userModel, coupleModel, questionsService, notificationsService, logger) {
        this.userModel = userModel;
        this.coupleModel = coupleModel;
        this.questionsService = questionsService;
        this.notificationsService = notificationsService;
        this.logger = logger;
    }
    async onModuleInit() {
        await this.questionsService.seedDefaultQuestions();
    }
    async sendDailyQuestionNotifications() {
        this.logger.log('Running daily question cron job');
        const question = await this.questionsService.getOrCreateTodayQuestion();
        if (!question) {
            this.logger.warn('No question found for today');
            return;
        }
        const activeCouples = await this.coupleModel.find({ status: 'active' }).lean();
        for (const couple of activeCouples) {
            const userIds = [couple.user1.toString(), couple.user2?.toString()].filter(Boolean);
            for (const userId of userIds) {
                const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
                if (!user)
                    continue;
                await this.notificationsService.createNotification(userId, notification_schema_1.NotificationType.DAILY_QUESTION, "Today's Question is Ready! 💬", question.text, { questionId: question._id.toString() });
                if (user.fcmToken) {
                    await this.notificationsService.sendFcm(user.fcmToken, "Today's Question is Ready! 💬", question.text, { type: 'daily_question', questionId: question._id.toString() });
                }
            }
        }
        this.logger.log(`Daily question notifications sent for ${activeCouples.length} couples`);
    }
};
exports.DailyQuestionProcessor = DailyQuestionProcessor;
__decorate([
    (0, schedule_1.Cron)('0 8 * * *', { timeZone: 'UTC' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DailyQuestionProcessor.prototype, "sendDailyQuestionNotifications", null);
exports.DailyQuestionProcessor = DailyQuestionProcessor = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(couple_schema_1.Couple.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        questions_service_1.QuestionsService,
        notifications_service_1.NotificationsService,
        winston_logger_service_1.WinstonLoggerService])
], DailyQuestionProcessor);
//# sourceMappingURL=daily-question.processor.js.map