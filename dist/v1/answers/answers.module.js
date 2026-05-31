"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnswersModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const answer_schema_1 = require("../../schemas/answer.schema");
const couple_schema_1 = require("../../schemas/couple.schema");
const question_schema_1 = require("../../schemas/question.schema");
const streak_schema_1 = require("../../schemas/streak.schema");
const user_schema_1 = require("../../schemas/user.schema");
const answers_controller_1 = require("./answers.controller");
const answers_service_1 = require("./answers.service");
let AnswersModule = class AnswersModule {
};
exports.AnswersModule = AnswersModule;
exports.AnswersModule = AnswersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: answer_schema_1.Answer.name, schema: answer_schema_1.AnswerSchema },
                { name: question_schema_1.Question.name, schema: question_schema_1.QuestionSchema },
                { name: couple_schema_1.Couple.name, schema: couple_schema_1.CoupleSchema },
                { name: streak_schema_1.Streak.name, schema: streak_schema_1.StreakSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
            ]),
        ],
        controllers: [answers_controller_1.AnswersController],
        providers: [answers_service_1.AnswersService],
        exports: [answers_service_1.AnswersService],
    })
], AnswersModule);
//# sourceMappingURL=answers.module.js.map