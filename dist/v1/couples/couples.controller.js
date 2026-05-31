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
exports.CouplesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const joi_validation_pipe_1 = require("../../common/pipes/joi-validation.pipe");
const jwt_guard_1 = require("../../guards/jwt.guard");
const couples_service_1 = require("./couples.service");
const couples_validation_1 = require("./validation/couples.validation");
let CouplesController = class CouplesController {
    constructor(couplesService) {
        this.couplesService = couplesService;
    }
    async generateInvite(req) {
        const data = await this.couplesService.generateInvite(req.user._id.toString());
        return { message: 'Invite code generated', data };
    }
    async joinCouple(req, body) {
        const data = await this.couplesService.joinCouple(req.user._id.toString(), body.inviteCode);
        return { message: 'Successfully joined couple', data };
    }
    async getCouple(req) {
        const data = await this.couplesService.getCouple(req.user._id.toString());
        return { message: 'Couple info fetched', data };
    }
    async setAnniversary(req, body) {
        const data = await this.couplesService.setAnniversary(req.user._id.toString(), body.anniversary);
        return { message: 'Anniversary updated', data };
    }
    async unlinkPartner(req) {
        await this.couplesService.unlinkPartner(req.user._id.toString());
        return { message: 'Partner unlinked' };
    }
};
exports.CouplesController = CouplesController;
__decorate([
    (0, common_1.Post)('invite'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Generate couple invite code' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CouplesController.prototype, "generateInvite", null);
__decorate([
    (0, common_1.Post)('join'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Join couple with invite code' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(new joi_validation_pipe_1.JoiValidationPipe(couples_validation_1.joinCoupleSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CouplesController.prototype, "joinCouple", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Get couple info' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CouplesController.prototype, "getCouple", null);
__decorate([
    (0, common_1.Patch)('anniversary'),
    (0, swagger_1.ApiOperation)({ summary: 'Set relationship anniversary' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(new joi_validation_pipe_1.JoiValidationPipe(couples_validation_1.anniversarySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CouplesController.prototype, "setAnniversary", null);
__decorate([
    (0, common_1.Delete)('unlink'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Unlink partner' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CouplesController.prototype, "unlinkPartner", null);
exports.CouplesController = CouplesController = __decorate([
    (0, swagger_1.ApiTags)('Couples'),
    (0, common_1.Controller)('v1/couples'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [couples_service_1.CouplesService])
], CouplesController);
//# sourceMappingURL=couples.controller.js.map