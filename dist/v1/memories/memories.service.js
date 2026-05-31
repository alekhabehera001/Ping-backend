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
exports.MemoriesService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const s3_service_1 = require("../../services/s3.service");
const memory_schema_1 = require("../../schemas/memory.schema");
const user_schema_1 = require("../../schemas/user.schema");
const S3_BUCKET = process.env.AWS_S3_BUCKET || 'ping-app-memories';
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'audio/m4a', 'audio/x-m4a'];
let MemoriesService = class MemoriesService {
    constructor(memoryModel, userModel, s3Service, eventEmitter) {
        this.memoryModel = memoryModel;
        this.userModel = userModel;
        this.s3Service = s3Service;
        this.eventEmitter = eventEmitter;
    }
    async getPresignedUrl(userId, contentType, fileName) {
        if (!ALLOWED_MIME.includes(contentType)) {
            throw new common_1.BadRequestException('File type not allowed');
        }
        const ext = fileName.split('.').pop()?.toLowerCase() || 'bin';
        const key = `couples/${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const uploadUrl = await this.s3Service.generatePresignedPutUrl(S3_BUCKET, key, contentType, 300);
        const publicUrl = `https://${S3_BUCKET}.s3.amazonaws.com/${key}`;
        return { uploadUrl, key, publicUrl };
    }
    async createMemory(userId, data) {
        const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
        if (!user || !user.coupleId)
            throw new common_1.BadRequestException('Must be in a couple');
        let s3Url;
        if (data.s3Key) {
            s3Url = `https://${S3_BUCKET}.s3.amazonaws.com/${data.s3Key}`;
        }
        const memory = await this.memoryModel.create({
            coupleId: user.coupleId,
            uploadedBy: new mongoose_2.Types.ObjectId(userId),
            type: data.type,
            s3Key: data.s3Key,
            s3Url,
            caption: data.caption,
            noteText: data.noteText,
        });
        this.eventEmitter.emit('memory.created', {
            senderId: userId,
            coupleId: user.coupleId.toString(),
            memoryId: memory._id.toString(),
            type: data.type,
        });
        return memory;
    }
    async getTimeline(userId, cursor, limit = 20) {
        const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
        if (!user || !user.coupleId)
            return { items: [], nextCursor: null };
        const filter = { coupleId: user.coupleId, isDeleted: false };
        if (cursor) {
            filter.createdAt = { $lt: new Date(cursor) };
        }
        const items = await this.memoryModel
            .find(filter)
            .populate('uploadedBy', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(limit + 1)
            .lean();
        const hasMore = items.length > limit;
        if (hasMore)
            items.pop();
        const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;
        return { items, nextCursor };
    }
    async getMonthlyRecap(userId) {
        const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
        if (!user || !user.coupleId)
            return [];
        return this.memoryModel.aggregate([
            { $match: { coupleId: user.coupleId, isDeleted: false } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                    },
                    count: { $sum: 1 },
                    items: { $push: { _id: '$_id', type: '$type', s3Url: '$s3Url', caption: '$caption', createdAt: '$createdAt' } },
                },
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 },
        ]);
    }
    async deleteMemory(userId, memoryId) {
        const memory = await this.memoryModel
            .findOne({ _id: memoryId, uploadedBy: new mongoose_2.Types.ObjectId(userId), isDeleted: false })
            .exec();
        if (!memory)
            throw new common_1.NotFoundException('Memory not found');
        memory.isDeleted = true;
        await memory.save();
    }
};
exports.MemoriesService = MemoriesService;
exports.MemoriesService = MemoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(memory_schema_1.Memory.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        s3_service_1.S3Service,
        event_emitter_1.EventEmitter2])
], MemoriesService);
//# sourceMappingURL=memories.service.js.map