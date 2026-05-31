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
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionSchema = exports.Question = exports.QuestionCategory = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var QuestionCategory;
(function (QuestionCategory) {
    QuestionCategory["EMOTIONAL"] = "emotional";
    QuestionCategory["ROMANTIC"] = "romantic";
    QuestionCategory["FUNNY"] = "funny";
    QuestionCategory["FUTURE_GOALS"] = "future_goals";
    QuestionCategory["STRESS"] = "stress";
    QuestionCategory["APPRECIATION"] = "appreciation";
})(QuestionCategory || (exports.QuestionCategory = QuestionCategory = {}));
let Question = class Question extends mongoose_2.Document {
};
exports.Question = Question;
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, maxlength: 500 }),
    __metadata("design:type", String)
], Question.prototype, "text", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: QuestionCategory, required: true }),
    __metadata("design:type", String)
], Question.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, required: true }),
    __metadata("design:type", Date)
], Question.prototype, "scheduledFor", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: true }),
    __metadata("design:type", Boolean)
], Question.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Question.prototype, "createdByAdmin", void 0);
exports.Question = Question = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Question);
exports.QuestionSchema = mongoose_1.SchemaFactory.createForClass(Question);
exports.QuestionSchema.index({ scheduledFor: 1 });
exports.QuestionSchema.index({ isActive: 1 });
exports.QuestionSchema.index({ category: 1 });
//# sourceMappingURL=question.schema.js.map