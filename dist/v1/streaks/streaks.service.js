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
exports.StreaksService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const streak_schema_1 = require("../../schemas/streak.schema");
const user_schema_1 = require("../../schemas/user.schema");
let StreaksService = class StreaksService {
    constructor(streakModel, userModel) {
        this.streakModel = streakModel;
        this.userModel = userModel;
    }
    async getStreak(userId) {
        const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
        if (!user || !user.coupleId)
            throw new common_1.NotFoundException('Couple not found');
        const existing = await this.streakModel.findOne({ coupleId: user.coupleId }).lean();
        if (existing)
            return existing;
        const streak = await this.streakModel.create({ coupleId: user.coupleId });
        return streak.toObject();
    }
    async recoverStreak(userId) {
        const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
        if (!user || !user.coupleId)
            throw new common_1.NotFoundException('Couple not found');
        const streak = await this.streakModel.findOne({ coupleId: user.coupleId }).exec();
        if (!streak)
            throw new common_1.NotFoundException('Streak not found');
        if (streak.recoveryTokens <= 0)
            throw new common_1.BadRequestException('No recovery tokens left');
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        const lastDate = streak.lastAnsweredDate ? new Date(streak.lastAnsweredDate) : null;
        if (lastDate) {
            lastDate.setHours(0, 0, 0, 0);
            const diff = Math.floor((yesterday.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000));
            if (diff !== 1)
                throw new common_1.BadRequestException('Recovery only works for a 1-day break');
        }
        streak.currentStreak += 1;
        streak.recoveryTokens -= 1;
        streak.lastAnsweredDate = yesterday;
        if (streak.currentStreak > streak.longestStreak) {
            streak.longestStreak = streak.currentStreak;
        }
        await streak.save();
    }
};
exports.StreaksService = StreaksService;
exports.StreaksService = StreaksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(streak_schema_1.Streak.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], StreaksService);
//# sourceMappingURL=streaks.service.js.map