"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.historySchema = exports.submitAnswerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.submitAnswerSchema = joi_1.default.object({
    questionId: joi_1.default.string().hex().length(24).required(),
    text: joi_1.default.string().min(1).max(1000).required(),
});
exports.historySchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(50).default(20),
});
//# sourceMappingURL=answers.validation.js.map