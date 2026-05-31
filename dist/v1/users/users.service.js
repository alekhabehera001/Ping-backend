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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const couple_schema_1 = require("../../schemas/couple.schema");
const user_schema_1 = require("../../schemas/user.schema");
let UsersService = class UsersService {
    constructor(userModel, coupleModel) {
        this.userModel = userModel;
        this.coupleModel = coupleModel;
    }
    async getMe(userId) {
        const user = await this.userModel
            .findOne({ _id: userId, isDeleted: false })
            .select('-otp -sessions -password -loginAttempts -lockUntil')
            .lean();
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async updateMe(userId, data) {
        const updated = await this.userModel
            .findOneAndUpdate({ _id: userId, isDeleted: false }, { $set: data }, { new: true, select: '-otp -sessions -password -loginAttempts -lockUntil' })
            .lean();
        if (!updated)
            throw new common_1.NotFoundException('User not found');
        return updated;
    }
    async getPartner(userId) {
        const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
        if (!user || !user.coupleId)
            throw new common_1.NotFoundException('No partner found');
        const couple = await this.coupleModel.findById(user.coupleId).lean();
        if (!couple)
            throw new common_1.NotFoundException('Couple not found');
        const partnerId = couple.user1.toString() === userId
            ? couple.user2?.toString()
            : couple.user1.toString();
        if (!partnerId)
            throw new common_1.NotFoundException('Partner not linked yet');
        const partner = await this.userModel
            .findOne({ _id: partnerId, isDeleted: false })
            .select('-otp -sessions -password -loginAttempts -lockUntil -fcmToken')
            .lean();
        if (!partner)
            throw new common_1.NotFoundException('Partner not found');
        return partner;
    }
    async findById(userId) {
        return this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(couple_schema_1.Couple.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], UsersService);
//# sourceMappingURL=users.service.js.map