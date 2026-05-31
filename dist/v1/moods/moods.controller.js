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
exports.MoodsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const joi_validation_pipe_1 = require("../../common/pipes/joi-validation.pipe");
const jwt_guard_1 = require("../../guards/jwt.guard");
const moods_service_1 = require("./moods.service");
const moods_validation_1 = require("./validation/moods.validation");
let MoodsController = class MoodsController {
    constructor(moodsService) {
        this.moodsService = moodsService;
    }
    async createMood(req, body) {
        const data = await this.moodsService.createMood(req.user._id.toString(), body.mood, body.note);
        return { message: 'Mood sent', data };
    }
    async getLatest(req) {
        const data = await this.moodsService.getLatestMoods(req.user._id.toString());
        return { message: 'Latest moods', data };
    }
    async getHistory(req, query) {
        const { items, total } = await this.moodsService.getMoodHistory(req.user._id.toString(), query.page, query.limit);
        return { message: 'Mood history', data: { items, total, page: query.page, limit: query.limit } };
    }
};
exports.MoodsController = MoodsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Send mood ping to partner' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(new joi_validation_pipe_1.JoiValidationPipe(moods_validation_1.createMoodSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MoodsController.prototype, "createMood", null);
__decorate([
    (0, common_1.Get)('latest'),
    (0, swagger_1.ApiOperation)({ summary: 'Get latest mood for self and partner' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MoodsController.prototype, "getLatest", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get mood history for the couple' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)(new joi_validation_pipe_1.JoiValidationPipe(moods_validation_1.moodHistorySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MoodsController.prototype, "getHistory", null);
exports.MoodsController = MoodsController = __decorate([
    (0, swagger_1.ApiTags)('Moods'),
    (0, common_1.Controller)('v1/moods'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [moods_service_1.MoodsService])
], MoodsController);
//# sourceMappingURL=moods.controller.js.map