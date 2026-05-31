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
exports.MemoriesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const joi_validation_pipe_1 = require("../../common/pipes/joi-validation.pipe");
const jwt_guard_1 = require("../../guards/jwt.guard");
const memories_service_1 = require("./memories.service");
const memories_validation_1 = require("./validation/memories.validation");
let MemoriesController = class MemoriesController {
    constructor(memoriesService) {
        this.memoriesService = memoriesService;
    }
    async getPresigned(req, body) {
        const data = await this.memoriesService.getPresignedUrl(req.user._id.toString(), body.contentType, body.fileName);
        return { message: 'Presigned URL generated', data };
    }
    async create(req, body) {
        const data = await this.memoriesService.createMemory(req.user._id.toString(), body);
        return { message: 'Memory saved', data };
    }
    async getTimeline(req, query) {
        const data = await this.memoriesService.getTimeline(req.user._id.toString(), query.cursor, query.limit);
        return { message: 'Timeline fetched', data };
    }
    async getMonthlyRecap(req) {
        const data = await this.memoriesService.getMonthlyRecap(req.user._id.toString());
        return { message: 'Monthly recap', data };
    }
    async deleteMemory(req, id) {
        await this.memoriesService.deleteMemory(req.user._id.toString(), id);
        return { message: 'Memory deleted' };
    }
};
exports.MemoriesController = MemoriesController;
__decorate([
    (0, common_1.Post)('presigned'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get S3 presigned upload URL' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(new joi_validation_pipe_1.JoiValidationPipe(memories_validation_1.presignedUrlSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MemoriesController.prototype, "getPresigned", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Save memory after upload' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(new joi_validation_pipe_1.JoiValidationPipe(memories_validation_1.createMemorySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MemoriesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get memory timeline (cursor-based)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)(new joi_validation_pipe_1.JoiValidationPipe(memories_validation_1.memoriesListSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MemoriesController.prototype, "getTimeline", null);
__decorate([
    (0, common_1.Get)('monthly-recap'),
    (0, swagger_1.ApiOperation)({ summary: 'Get memories grouped by month' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MemoriesController.prototype, "getMonthlyRecap", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete memory' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MemoriesController.prototype, "deleteMemory", null);
exports.MemoriesController = MemoriesController = __decorate([
    (0, swagger_1.ApiTags)('Memories'),
    (0, common_1.Controller)('v1/memories'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [memories_service_1.MemoriesService])
], MemoriesController);
//# sourceMappingURL=memories.controller.js.map