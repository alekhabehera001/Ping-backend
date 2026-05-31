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
exports.AnswersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const joi_validation_pipe_1 = require("../../common/pipes/joi-validation.pipe");
const jwt_guard_1 = require("../../guards/jwt.guard");
const answers_service_1 = require("./answers.service");
const answers_validation_1 = require("./validation/answers.validation");
let AnswersController = class AnswersController {
    constructor(answersService) {
        this.answersService = answersService;
    }
    async submit(req, body) {
        const data = await this.answersService.submitAnswer(req.user._id.toString(), body.questionId, body.text);
        return { message: 'Answer submitted', data };
    }
    async getToday(req, questionId) {
        if (!questionId)
            throw new Error('questionId is required');
        const data = await this.answersService.getTodayAnswers(req.user._id.toString(), questionId);
        return { message: 'Answers fetched', data };
    }
    async getHistory(req, query) {
        const { items, total } = await this.answersService.getHistory(req.user._id.toString(), query.page, query.limit);
        return { message: 'History fetched', data: { items, total, page: query.page, limit: query.limit } };
    }
};
exports.AnswersController = AnswersController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Submit answer to daily question' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(new joi_validation_pipe_1.JoiValidationPipe(answers_validation_1.submitAnswerSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AnswersController.prototype, "submit", null);
__decorate([
    (0, common_1.Get)('today'),
    (0, swagger_1.ApiOperation)({ summary: 'Get today answers (reveals after both answered)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('questionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AnswersController.prototype, "getToday", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get answer history' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)(new joi_validation_pipe_1.JoiValidationPipe(answers_validation_1.historySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AnswersController.prototype, "getHistory", null);
exports.AnswersController = AnswersController = __decorate([
    (0, swagger_1.ApiTags)('Answers'),
    (0, common_1.Controller)('v1/answers'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [answers_service_1.AnswersService])
], AnswersController);
//# sourceMappingURL=answers.controller.js.map