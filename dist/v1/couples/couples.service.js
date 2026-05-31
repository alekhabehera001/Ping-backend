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
exports.CouplesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const couple_schema_1 = require("../../schemas/couple.schema");
const user_schema_1 = require("../../schemas/user.schema");
function generateInviteCode(length = 6) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}
let CouplesService = class CouplesService {
    constructor(coupleModel, userModel) {
        this.coupleModel = coupleModel;
        this.userModel = userModel;
    }
    async generateInvite(userId) {
        const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.coupleId)
            throw new common_1.ConflictException('You are already in a couple');
        let code;
        let exists = true;
        do {
            code = generateInviteCode();
            const existing = await this.coupleModel.findOne({ inviteCode: code }).lean();
            exists = !!existing;
        } while (exists);
        const couple = await this.coupleModel.create({
            user1: new mongoose_2.Types.ObjectId(userId),
            inviteCode: code,
            status: couple_schema_1.CoupleStatus.PENDING,
        });
        await this.userModel.updateOne({ _id: userId }, { coupleId: couple._id });
        return { inviteCode: code, coupleId: couple._id.toString() };
    }
    async joinCouple(userId, inviteCode) {
        const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.coupleId)
            throw new common_1.ConflictException('You are already in a couple');
        const couple = await this.coupleModel
            .findOne({ inviteCode: inviteCode.toUpperCase(), status: couple_schema_1.CoupleStatus.PENDING })
            .exec();
        if (!couple)
            throw new common_1.NotFoundException('Invalid or expired invite code');
        if (couple.user1.toString() === userId) {
            throw new common_1.BadRequestException('Cannot join your own invite');
        }
        couple.user2 = new mongoose_2.Types.ObjectId(userId);
        couple.status = couple_schema_1.CoupleStatus.ACTIVE;
        await couple.save();
        await this.userModel.updateOne({ _id: userId }, { coupleId: couple._id });
        const [user1, user2] = await Promise.all([
            this.userModel.findById(couple.user1).select('name avatar email').lean(),
            this.userModel.findById(couple.user2).select('name avatar email').lean(),
        ]);
        return { coupleId: couple._id.toString(), user1, user2 };
    }
    async getCouple(userId) {
        const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
        if (!user || !user.coupleId)
            throw new common_1.NotFoundException('Couple not found');
        const couple = await this.coupleModel.findById(user.coupleId).lean();
        if (!couple)
            throw new common_1.NotFoundException('Couple not found');
        const [user1, user2] = await Promise.all([
            this.userModel.findById(couple.user1).select('name avatar email').lean(),
            couple.user2
                ? this.userModel.findById(couple.user2).select('name avatar email').lean()
                : Promise.resolve(null),
        ]);
        return { ...couple, user1, user2 };
    }
    async setAnniversary(userId, anniversary) {
        const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
        if (!user || !user.coupleId)
            throw new common_1.NotFoundException('Couple not found');
        const couple = await this.coupleModel
            .findByIdAndUpdate(user.coupleId, { anniversary }, { new: true })
            .lean();
        if (!couple)
            throw new common_1.NotFoundException('Couple not found');
        return couple;
    }
    async unlinkPartner(userId) {
        const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
        if (!user || !user.coupleId)
            throw new common_1.NotFoundException('No couple to unlink');
        const couple = await this.coupleModel.findById(user.coupleId).exec();
        if (!couple)
            throw new common_1.NotFoundException('Couple not found');
        const partnerIds = [couple.user1.toString(), couple.user2?.toString()].filter(Boolean);
        couple.status = couple_schema_1.CoupleStatus.UNLINKED;
        couple.unlinkedAt = new Date();
        await couple.save();
        await this.userModel.updateMany({ _id: { $in: partnerIds } }, { $unset: { coupleId: 1 } });
    }
    async getCoupleIdForUser(userId) {
        const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
        return user?.coupleId?.toString() || null;
    }
    async getPartnerFcmToken(userId) {
        const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
        if (!user?.coupleId)
            return null;
        const couple = await this.coupleModel.findById(user.coupleId).lean();
        if (!couple)
            return null;
        const partnerId = couple.user1.toString() === userId
            ? couple.user2?.toString()
            : couple.user1.toString();
        if (!partnerId)
            return null;
        const partner = await this.userModel.findOne({ _id: partnerId, isDeleted: false }).lean();
        return partner?.fcmToken || null;
    }
};
exports.CouplesService = CouplesService;
exports.CouplesService = CouplesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(couple_schema_1.Couple.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], CouplesService);
//# sourceMappingURL=couples.service.js.map