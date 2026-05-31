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
exports.PingGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const event_emitter_1 = require("@nestjs/event-emitter");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../schemas/user.schema");
const winston_logger_service_1 = require("../logger/winston-logger.service");
let PingGateway = class PingGateway {
    constructor(jwtService, userModel, logger) {
        this.jwtService = jwtService;
        this.userModel = userModel;
        this.logger = logger;
        this.connectedUsers = new Map();
    }
    afterInit() {
        this.logger.log('WebSocket gateway initialized');
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth?.token ||
                client.handshake.headers.authorization?.split(' ')[1];
            if (!token) {
                client.disconnect();
                return;
            }
            const payload = this.jwtService.verify(token, {
                secret: Buffer.from(process.env.JWT_SECRET || '', 'base64').toString('utf8'),
            });
            const user = await this.userModel.findOne({ _id: payload.userId, isDeleted: false }).lean();
            if (!user) {
                client.disconnect();
                return;
            }
            client.userId = payload.userId;
            client.coupleId = user.coupleId?.toString();
            if (client.coupleId) {
                await client.join(`couple:${client.coupleId}`);
            }
            this.connectedUsers.set(payload.userId, client.id);
            if (client.coupleId) {
                this.server.to(`couple:${client.coupleId}`).emit('partner:online', {
                    userId: payload.userId,
                    online: true,
                });
            }
            this.logger.log(`Client connected: ${client.id} user: ${payload.userId}`);
        }
        catch {
            client.disconnect();
        }
    }
    async handleDisconnect(client) {
        if (client.userId) {
            this.connectedUsers.delete(client.userId);
            if (client.coupleId) {
                this.server.to(`couple:${client.coupleId}`).emit('partner:online', {
                    userId: client.userId,
                    online: false,
                });
            }
        }
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    handleHello(client) {
        client.emit('ping:hello', { message: 'Connected to Ping!', userId: client.userId });
    }
    handleMoodCreated(payload) {
        this.server.to(`couple:${payload.coupleId}`).emit('mood:update', {
            senderId: payload.senderId,
            mood: payload.mood,
            note: payload.note,
            moodId: payload.moodId,
        });
    }
    handleAnswersRevealed(payload) {
        this.server.to(`couple:${payload.coupleId}`).emit('answer:reveal', {
            questionId: payload.questionId,
            answers: payload.answers,
        });
    }
    handleMemoryCreated(payload) {
        this.server.to(`couple:${payload.coupleId}`).emit('memory:new', {
            senderId: payload.senderId,
            memoryId: payload.memoryId,
            type: payload.type,
        });
    }
    handleStreakMilestone(payload) {
        this.server.to(`couple:${payload.coupleId}`).emit('streak:milestone', {
            badges: payload.badges,
            streak: payload.streak,
        });
    }
    sendNotificationToUser(userId, notification) {
        const socketId = this.connectedUsers.get(userId);
        if (socketId) {
            this.server.to(socketId).emit('notification:new', notification);
        }
    }
};
exports.PingGateway = PingGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], PingGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('ping:hello'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PingGateway.prototype, "handleHello", null);
__decorate([
    (0, event_emitter_1.OnEvent)('mood.created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PingGateway.prototype, "handleMoodCreated", null);
__decorate([
    (0, event_emitter_1.OnEvent)('answers.revealed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PingGateway.prototype, "handleAnswersRevealed", null);
__decorate([
    (0, event_emitter_1.OnEvent)('memory.created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PingGateway.prototype, "handleMemoryCreated", null);
__decorate([
    (0, event_emitter_1.OnEvent)('streak.milestone'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PingGateway.prototype, "handleStreakMilestone", null);
exports.PingGateway = PingGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: '/ping',
        cors: { origin: '*', credentials: true },
    }),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        mongoose_2.Model,
        winston_logger_service_1.WinstonLoggerService])
], PingGateway);
//# sourceMappingURL=ping.gateway.js.map