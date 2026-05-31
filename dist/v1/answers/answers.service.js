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
exports.AnswersService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const answer_schema_1 = require("../../schemas/answer.schema");
const couple_schema_1 = require("../../schemas/couple.schema");
const question_schema_1 = require("../../schemas/question.schema");
const streak_schema_1 = require("../../schemas/streak.schema");
const user_schema_1 = require("../../schemas/user.schema");
let AnswersService = class AnswersService {
    constructor(answerModel, questionModel, coupleModel, streakModel, userModel, eventEmitter) {
        this.answerModel = answerModel;
        this.questionModel = questionModel;
        this.coupleModel = coupleModel;
        this.streakModel = streakModel;
        this.userModel = userModel;
        this.eventEmitter = eventEmitter;
    }
    async submitAnswer(userId, questionId, text) {
        const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
        if (!user || !user.coupleId)
            throw new common_1.BadRequestException('You must be in a couple to answer');
        const question = await this.questionModel.findOne({ _id: questionId, isActive: true }).lean();
        if (!question)
            throw new common_1.NotFoundException('Question not found');
        const existingAnswer = await this.answerModel
            .findOne({ questionId, userId: new mongoose_2.Types.ObjectId(userId) })
            .lean();
        if (existingAnswer)
            throw new common_1.BadRequestException('You already answered this question');
        const answer = await this.answerModel.create({
            questionId: new mongoose_2.Types.ObjectId(questionId),
            userId: new mongoose_2.Types.ObjectId(userId),
            coupleId: user.coupleId,
            text,
        });
        await this.checkAndRevealAnswers(questionId, user.coupleId.toString());
        return answer;
    }
    async checkAndRevealAnswers(questionId, coupleId) {
        const couple = await this.coupleModel.findById(coupleId).lean();
        if (!couple || !couple.user2)
            return;
        const answers = await this.answerModel.find({ questionId, coupleId }).lean();
        const bothAnswered = answers.some((a) => a.userId.toString() === couple.user1.toString()) &&
            answers.some((a) => a.userId.toString() === couple.user2.toString());
        if (!bothAnswered)
            return;
        await this.answerModel.updateMany({ questionId, coupleId }, { isRevealed: true });
        await this.updateStreak(coupleId);
        this.eventEmitter.emit('answers.revealed', {
            coupleId,
            questionId,
            answers: answers.map((a) => ({ userId: a.userId.toString(), text: a.text })),
        });
    }
    async updateStreak(coupleId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let streak = await this.streakModel.findOne({ coupleId }).exec();
        if (!streak) {
            streak = await this.streakModel.create({ coupleId, currentStreak: 0 });
        }
        const lastDate = streak.lastAnsweredDate ? new Date(streak.lastAnsweredDate) : null;
        if (lastDate) {
            lastDate.setHours(0, 0, 0, 0);
            const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000));
            if (diffDays === 0)
                return;
            if (diffDays === 1) {
                streak.currentStreak += 1;
            }
            else {
                streak.currentStreak = 1;
            }
        }
        else {
            streak.currentStreak = 1;
        }
        streak.lastAnsweredDate = today;
        if (streak.currentStreak > streak.longestStreak) {
            streak.longestStreak = streak.currentStreak;
        }
        const newBadges = [];
        if (streak.currentStreak >= 7 && !streak.badges.includes(streak_schema_1.StreakBadge.WEEK)) {
            streak.badges.push(streak_schema_1.StreakBadge.WEEK);
            newBadges.push(streak_schema_1.StreakBadge.WEEK);
        }
        if (streak.currentStreak >= 30 && !streak.badges.includes(streak_schema_1.StreakBadge.MONTH)) {
            streak.badges.push(streak_schema_1.StreakBadge.MONTH);
            newBadges.push(streak_schema_1.StreakBadge.MONTH);
        }
        if (streak.currentStreak >= 100 && !streak.badges.includes(streak_schema_1.StreakBadge.CENTURY)) {
            streak.badges.push(streak_schema_1.StreakBadge.CENTURY);
            newBadges.push(streak_schema_1.StreakBadge.CENTURY);
        }
        await streak.save();
        if (newBadges.length > 0) {
            this.eventEmitter.emit('streak.milestone', { coupleId, badges: newBadges, streak: streak.currentStreak });
        }
    }
    async getTodayAnswers(userId, questionId) {
        const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
        if (!user || !user.coupleId)
            throw new common_1.BadRequestException('Not in a couple');
        const answers = await this.answerModel
            .find({ questionId, coupleId: user.coupleId })
            .populate('userId', 'name avatar')
            .lean();
        const myAnswer = answers.find((a) => a.userId.toString() === userId || a.userId._id?.toString() === userId);
        const revealed = answers.every((a) => a.isRevealed) && answers.length >= 2;
        return {
            myAnswer: myAnswer || null,
            partnerAnswer: revealed ? answers.find((a) => {
                const aId = a.userId._id?.toString() || a.userId.toString();
                return aId !== userId;
            }) : null,
            bothAnswered: revealed,
        };
    }
    async getHistory(userId, page, limit) {
        const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
        if (!user || !user.coupleId)
            return { items: [], total: 0 };
        const [items, total] = await Promise.all([
            this.answerModel
                .find({ coupleId: user.coupleId, isRevealed: true })
                .populate('questionId', 'text category')
                .populate('userId', 'name avatar')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            this.answerModel.countDocuments({ coupleId: user.coupleId, isRevealed: true }),
        ]);
        return { items, total };
    }
};
exports.AnswersService = AnswersService;
exports.AnswersService = AnswersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(answer_schema_1.Answer.name)),
    __param(1, (0, mongoose_1.InjectModel)(question_schema_1.Question.name)),
    __param(2, (0, mongoose_1.InjectModel)(couple_schema_1.Couple.name)),
    __param(3, (0, mongoose_1.InjectModel)(streak_schema_1.Streak.name)),
    __param(4, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        event_emitter_1.EventEmitter2])
], AnswersService);
//# sourceMappingURL=answers.service.js.map