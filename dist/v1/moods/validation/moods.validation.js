"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moodHistorySchema = exports.createMoodSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createMoodSchema = joi_1.default.object({
    mood: joi_1.default.string()
        .valid('happy', 'sad', 'stressed', 'angry', 'excited', 'loved', 'tired')
        .required(),
    note: joi_1.default.string().max(200).allow(''),
});
exports.moodHistorySchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(50).default(20),
});
//# sourceMappingURL=moods.validation.js.map