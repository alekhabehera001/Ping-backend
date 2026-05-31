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
exports.StreaksController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../../guards/jwt.guard");
const streaks_service_1 = require("./streaks.service");
let StreaksController = class StreaksController {
    constructor(streaksService) {
        this.streaksService = streaksService;
    }
    async getStreak(req) {
        const data = await this.streaksService.getStreak(req.user._id.toString());
        return { message: 'Streak fetched', data };
    }
    async recoverStreak(req) {
        await this.streaksService.recoverStreak(req.user._id.toString());
        return { message: 'Streak recovered' };
    }
};
exports.StreaksController = StreaksController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get streak info and badges' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StreaksController.prototype, "getStreak", null);
__decorate([
    (0, common_1.Post)('recover'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Use streak recovery token' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StreaksController.prototype, "recoverStreak", null);
exports.StreaksController = StreaksController = __decorate([
    (0, swagger_1.ApiTags)('Streaks'),
    (0, common_1.Controller)('v1/streaks'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [streaks_service_1.StreaksService])
], StreaksController);
//# sourceMappingURL=streaks.controller.js.map