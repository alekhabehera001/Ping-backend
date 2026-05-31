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
exports.MoodsService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const couple_schema_1 = require("../../schemas/couple.schema");
const mood_schema_1 = require("../../schemas/mood.schema");
const user_schema_1 = require("../../schemas/user.schema");
let MoodsService = class MoodsService {
    constructor(moodModel, userModel, coupleModel, eventEmitter) {
        this.moodModel = moodModel;
        this.userModel = userModel;
        this.coupleModel = coupleModel;
        this.eventEmitter = eventEmitter;
    }
    async createMood(userId, mood, note) {
        const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
        if (!user || !user.coupleId)
            throw new common_1.BadRequestException('Must be in a couple to send mood');
        const newMood = await this.moodModel.create({
            userId: new mongoose_2.Types.ObjectId(userId),
            coupleId: user.coupleId,
            mood,
            note,
        });
        this.eventEmitter.emit('mood.created', {
            senderId: userId,
            coupleId: user.coupleId.toString(),
            mood,
            note,
            moodId: newMood._id.toString(),
        });
        return newMood;
    }
    async getLatestMoods(userId) {
        const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
        if (!user || !user.coupleId)
            return { myMood: null, partnerMood: null };
        const couple = await this.coupleModel.findById(user.coupleId).lean();
        if (!couple)
            return { myMood: null, partnerMood: null };
        const partnerId = couple.user1.toString() === userId
            ? couple.user2?.toString()
            : couple.user1.toString();
        const [myMood, partnerMood] = await Promise.all([
            this.moodModel.findOne({ userId: new mongoose_2.Types.ObjectId(userId) }).sort({ createdAt: -1 }).lean(),
            partnerId
                ? this.moodModel.findOne({ userId: new mongoose_2.Types.ObjectId(partnerId) }).sort({ createdAt: -1 }).lean()
                : Promise.resolve(null),
        ]);
        return { myMood, partnerMood };
    }
    async getMoodHistory(userId, page, limit) {
        const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
        if (!user || !user.coupleId)
            return { items: [], total: 0 };
        const [items, total] = await Promise.all([
            this.moodModel
                .find({ coupleId: user.coupleId })
                .populate('userId', 'name avatar')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            this.moodModel.countDocuments({ coupleId: user.coupleId }),
        ]);
        return { items, total };
    }
};
exports.MoodsService = MoodsService;
exports.MoodsService = MoodsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(mood_schema_1.Mood.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(2, (0, mongoose_1.InjectModel)(couple_schema_1.Couple.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        event_emitter_1.EventEmitter2])
], MoodsService);
//# sourceMappingURL=moods.service.js.map