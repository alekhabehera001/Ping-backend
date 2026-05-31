"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.anniversarySchema = exports.joinCoupleSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.joinCoupleSchema = joi_1.default.object({
    inviteCode: joi_1.default.string().min(4).max(10).uppercase().required(),
});
exports.anniversarySchema = joi_1.default.object({
    anniversary: joi_1.default.date().iso().max('now').required(),
});
//# sourceMappingURL=couples.validation.js.map