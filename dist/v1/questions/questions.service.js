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
exports.QuestionsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const question_schema_1 = require("../../schemas/question.schema");
const DEFAULT_QUESTIONS = [
    { text: 'What made you smile today?', category: question_schema_1.QuestionCategory.EMOTIONAL },
    { text: 'What is your favorite memory of us?', category: question_schema_1.QuestionCategory.ROMANTIC },
    { text: 'If we had a superpower together, what would it be?', category: question_schema_1.QuestionCategory.FUNNY },
    { text: 'Where do you see us in 5 years?', category: question_schema_1.QuestionCategory.FUTURE_GOALS },
    { text: 'What stresses you most right now, and how can I help?', category: question_schema_1.QuestionCategory.STRESS },
    { text: 'What is one thing you appreciate about me that you never say?', category: question_schema_1.QuestionCategory.APPRECIATION },
    { text: 'What song reminds you of us?', category: question_schema_1.QuestionCategory.ROMANTIC },
    { text: 'What is something new you want us to try together?', category: question_schema_1.QuestionCategory.FUTURE_GOALS },
    { text: 'What do you do when you miss me?', category: question_schema_1.QuestionCategory.EMOTIONAL },
    { text: 'What is the funniest thing that ever happened between us?', category: question_schema_1.QuestionCategory.FUNNY },
    { text: 'What small thing do I do that means the most to you?', category: question_schema_1.QuestionCategory.APPRECIATION },
    { text: 'How do you want to spend our next vacation?', category: question_schema_1.QuestionCategory.FUTURE_GOALS },
    { text: 'What is one fear you have that I can help you face?', category: question_schema_1.QuestionCategory.STRESS },
    { text: 'If we could live anywhere, where would it be?', category: question_schema_1.QuestionCategory.ROMANTIC },
    { text: 'What is your love language today?', category: question_schema_1.QuestionCategory.EMOTIONAL },
];
let QuestionsService = class QuestionsService {
    constructor(questionModel) {
        this.questionModel = questionModel;
    }
    async getTodayQuestion() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return this.questionModel
            .findOne({ scheduledFor: { $gte: today, $lt: tomorrow }, isActive: true })
            .lean();
    }
    async getOrCreateTodayQuestion() {
        const existing = await this.getTodayQuestion();
        if (existing)
            return existing;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const randomQ = DEFAULT_QUESTIONS[Math.floor(Math.random() * DEFAULT_QUESTIONS.length)];
        const question = await this.questionModel.create({
            text: randomQ.text,
            category: randomQ.category,
            scheduledFor: today,
            isActive: true,
            createdByAdmin: false,
        });
        return question;
    }
    async create(data) {
        return this.questionModel.create({ ...data, isActive: true, createdByAdmin: true });
    }
    async list(page, limit, category) {
        const filter = {};
        if (category)
            filter.category = category;
        const [items, total] = await Promise.all([
            this.questionModel
                .find(filter)
                .sort({ scheduledFor: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            this.questionModel.countDocuments(filter),
        ]);
        return { items, total };
    }
    async seedDefaultQuestions() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        for (let i = 0; i < DEFAULT_QUESTIONS.length; i++) {
            const scheduledFor = new Date(today);
            scheduledFor.setDate(scheduledFor.getDate() + i);
            await this.questionModel.updateOne({ scheduledFor }, { $setOnInsert: { ...DEFAULT_QUESTIONS[i], scheduledFor, isActive: true, createdByAdmin: false } }, { upsert: true });
        }
    }
};
exports.QuestionsService = QuestionsService;
exports.QuestionsService = QuestionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(question_schema_1.Question.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], QuestionsService);
//# sourceMappingURL=questions.service.js.map