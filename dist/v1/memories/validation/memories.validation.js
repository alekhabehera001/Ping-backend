"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoriesListSchema = exports.createMemorySchema = exports.presignedUrlSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.presignedUrlSchema = joi_1.default.object({
    contentType: joi_1.default.string()
        .valid('image/jpeg', 'image/png', 'image/webp', 'audio/m4a', 'audio/x-m4a')
        .required(),
    fileName: joi_1.default.string().max(200).required(),
});
exports.createMemorySchema = joi_1.default.object({
    type: joi_1.default.string().valid('photo', 'voice', 'note').required(),
    s3Key: joi_1.default.string().max(512).when('type', {
        is: joi_1.default.string().valid('photo', 'voice'),
        then: joi_1.default.required(),
    }),
    caption: joi_1.default.string().max(500).allow(''),
    noteText: joi_1.default.string().max(2000).when('type', {
        is: 'note',
        then: joi_1.default.required(),
    }),
});
exports.memoriesListSchema = joi_1.default.object({
    cursor: joi_1.default.string().isoDate(),
    limit: joi_1.default.number().integer().min(1).max(50).default(20),
});
//# sourceMappingURL=memories.validation.js.map