"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const admin = __importStar(require("firebase-admin"));
const mongoose_2 = require("mongoose");
const notification_schema_1 = require("../../schemas/notification.schema");
const winston_logger_service_1 = require("../../logger/winston-logger.service");
let NotificationsService = class NotificationsService {
    constructor(notificationModel, logger) {
        this.notificationModel = notificationModel;
        this.logger = logger;
    }
    async sendFcm(fcmToken, title, body, data = {}) {
        try {
            if (!admin.apps.length)
                return;
            await admin.messaging().send({
                token: fcmToken,
                notification: { title, body },
                data,
                android: { priority: 'high' },
                apns: { payload: { aps: { sound: 'default', badge: 1 } } },
            });
        }
        catch (err) {
            this.logger.warn(`FCM send failed: ${err.message}`);
        }
    }
    async createNotification(userId, type, title, body, data = {}) {
        return this.notificationModel.create({
            userId: new mongoose_2.Types.ObjectId(userId),
            type,
            title,
            body,
            data,
            sentAt: new Date(),
        });
    }
    async getNotifications(userId, page, limit) {
        const [items, total] = await Promise.all([
            this.notificationModel
                .find({ userId: new mongoose_2.Types.ObjectId(userId) })
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            this.notificationModel.countDocuments({ userId: new mongoose_2.Types.ObjectId(userId) }),
        ]);
        return { items, total };
    }
    async markRead(userId, notificationId) {
        await this.notificationModel.updateOne({ _id: notificationId, userId: new mongoose_2.Types.ObjectId(userId) }, { isRead: true });
    }
    async markAllRead(userId) {
        await this.notificationModel.updateMany({ userId: new mongoose_2.Types.ObjectId(userId), isRead: false }, { isRead: true });
    }
    async getUnreadCount(userId) {
        return this.notificationModel.countDocuments({ userId: new mongoose_2.Types.ObjectId(userId), isRead: false });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(notification_schema_1.Notification.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        winston_logger_service_1.WinstonLoggerService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map