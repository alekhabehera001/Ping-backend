"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listQuestionsSchema = exports.createQuestionSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createQuestionSchema = joi_1.default.object({
    text: joi_1.default.string().min(10).max(500).required(),
    category: joi_1.default.string()
        .valid('emotional', 'romantic', 'funny', 'future_goals', 'stress', 'appreciation')
        .required(),
    scheduledFor: joi_1.default.date().iso().required(),
});
exports.listQuestionsSchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(50).default(20),
    category: joi_1.default.string().valid('emotional', 'romantic', 'funny', 'future_goals', 'stress', 'appreciation'),
});
//# sourceMappingURL=questions.validation.js.map