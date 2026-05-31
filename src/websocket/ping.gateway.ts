import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { OnEvent } from '@nestjs/event-emitter';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { WinstonLoggerService } from '../logger/winston-logger.service';

interface AuthSocket extends Socket {
  userId?: string;
  coupleId?: string;
}

@WebSocketGateway({
  namespace: '/ping',
  cors: { origin: '*', credentials: true },
})
export class PingGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>();

  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly logger: WinstonLoggerService,
  ) {}

  afterInit() {
    this.logger.log('WebSocket gateway initialized');
  }

  async handleConnection(client: AuthSocket) {
    try {
      const token =
        client.handshake.auth?.token ||
        (client.handshake.headers.authorization as string)?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: Buffer.from(process.env.JWT_SECRET || '', 'base64').toString('utf8'),
      }) as { userId: string };

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
    } catch {
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthSocket) {
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

  @SubscribeMessage('ping:hello')
  handleHello(client: AuthSocket) {
    client.emit('ping:hello', { message: 'Connected to Ping!', userId: client.userId });
  }

  @OnEvent('mood.created')
  handleMoodCreated(payload: { senderId: string; coupleId: string; mood: string; note?: string; moodId: string }) {
    this.server.to(`couple:${payload.coupleId}`).emit('mood:update', {
      senderId: payload.senderId,
      mood: payload.mood,
      note: payload.note,
      moodId: payload.moodId,
    });
  }

  @OnEvent('answers.revealed')
  handleAnswersRevealed(payload: { coupleId: string; questionId: string; answers: { userId: string; text: string }[] }) {
    this.server.to(`couple:${payload.coupleId}`).emit('answer:reveal', {
      questionId: payload.questionId,
      answers: payload.answers,
    });
  }

  @OnEvent('memory.created')
  handleMemoryCreated(payload: { senderId: string; coupleId: string; memoryId: string; type: string }) {
    this.server.to(`couple:${payload.coupleId}`).emit('memory:new', {
      senderId: payload.senderId,
      memoryId: payload.memoryId,
      type: payload.type,
    });
  }

  @OnEvent('streak.milestone')
  handleStreakMilestone(payload: { coupleId: string; badges: string[]; streak: number }) {
    this.server.to(`couple:${payload.coupleId}`).emit('streak:milestone', {
      badges: payload.badges,
      streak: payload.streak,
    });
  }

  sendNotificationToUser(userId: string, notification: { title: string; body: string; data?: any }) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('notification:new', notification);
    }
  }
}
