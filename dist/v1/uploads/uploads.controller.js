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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const joi_validation_pipe_1 = require("../../common/pipes/joi-validation.pipe");
const jwt_guard_1 = require("../../guards/jwt.guard");
const s3_service_1 = require("../../services/s3.service");
const joi_1 = __importDefault(require("joi"));
const presignedSchema = joi_1.default.object({
    contentType: joi_1.default.string()
        .valid('image/jpeg', 'image/png', 'image/webp', 'audio/m4a', 'audio/x-m4a')
        .required(),
    fileName: joi_1.default.string().max(200).required(),
    folder: joi_1.default.string().valid('avatars', 'memories').default('memories'),
});
const S3_BUCKET = process.env.AWS_S3_BUCKET || 'ping-app-memories';
let UploadsController = class UploadsController {
    constructor(s3Service) {
        this.s3Service = s3Service;
    }
    async getPresigned(req, body) {
        const ext = body.fileName.split('.').pop()?.toLowerCase() || 'bin';
        const key = `${body.folder}/${req.user._id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const uploadUrl = await this.s3Service.generatePresignedPutUrl(S3_BUCKET, key, body.contentType, 300);
        const publicUrl = `https://${S3_BUCKET}.s3.amazonaws.com/${key}`;
        return { message: 'Presigned URL generated', data: { uploadUrl, key, publicUrl } };
    }
};
exports.UploadsController = UploadsController;
__decorate([
    (0, common_1.Post)('presigned'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Generate S3 presigned upload URL' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(new joi_validation_pipe_1.JoiValidationPipe(presignedSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "getPresigned", null);
exports.UploadsController = UploadsController = __decorate([
    (0, swagger_1.ApiTags)('Uploads'),
    (0, common_1.Controller)('v1/uploads'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [s3_service_1.S3Service])
], UploadsController);
//# sourceMappingURL=uploads.controller.js.map