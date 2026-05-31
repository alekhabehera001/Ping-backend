import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { UserDocument } from '../schemas/user.schema';
import { WinstonLoggerService } from '../logger/winston-logger.service';
interface AuthSocket extends Socket {
    userId?: string;
    coupleId?: string;
}
export declare class PingGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwtService;
    private readonly userModel;
    private readonly logger;
    server: Server;
    private connectedUsers;
    constructor(jwtService: JwtService, userModel: Model<UserDocument>, logger: WinstonLoggerService);
    afterInit(): void;
    handleConnection(client: AuthSocket): Promise<void>;
    handleDisconnect(client: AuthSocket): Promise<void>;
    handleHello(client: AuthSocket): void;
    handleMoodCreated(payload: {
        senderId: string;
        coupleId: string;
        mood: string;
        note?: string;
        moodId: string;
    }): void;
    handleAnswersRevealed(payload: {
        coupleId: string;
        questionId: string;
        answers: {
            userId: string;
            text: string;
        }[];
    }): void;
    handleMemoryCreated(payload: {
        senderId: string;
        coupleId: string;
        memoryId: string;
        type: string;
    }): void;
    handleStreakMilestone(payload: {
        coupleId: string;
        badges: string[];
        streak: number;
    }): void;
    sendNotificationToUser(userId: string, notification: {
        title: string;
        body: string;
        data?: any;
    }): void;
}
export {};
