"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.updateProfileSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(100).trim(),
    avatar: joi_1.default.string().uri().max(512),
    fcmToken: joi_1.default.string().max(512),
});
//# sourceMappingURL=users.validation.js.map