"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueuesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const schedule_1 = require("@nestjs/schedule");
const couple_schema_1 = require("../schemas/couple.schema");
const question_schema_1 = require("../schemas/question.schema");
const user_schema_1 = require("../schemas/user.schema");
const notifications_module_1 = require("../v1/notifications/notifications.module");
const questions_module_1 = require("../v1/questions/questions.module");
const winston_logger_module_1 = require("../logger/winston-logger.module");
const daily_question_processor_1 = require("./daily-question.processor");
let QueuesModule = class QueuesModule {
};
exports.QueuesModule = QueuesModule;
exports.QueuesModule = QueuesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            mongoose_1.MongooseModule.forFeature([
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: couple_schema_1.Couple.name, schema: couple_schema_1.CoupleSchema },
                { name: question_schema_1.Question.name, schema: question_schema_1.QuestionSchema },
            ]),
            notifications_module_1.NotificationsModule,
            questions_module_1.QuestionsModule,
            winston_logger_module_1.WinstonLoggerModule,
        ],
        providers: [daily_question_processor_1.DailyQuestionProcessor],
    })
], QueuesModule);
//# sourceMappingURL=queues.module.js.map