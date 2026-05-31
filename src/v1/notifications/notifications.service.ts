import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as admin from 'firebase-admin';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument, NotificationType } from '../../schemas/notification.schema';
import { WinstonLoggerService } from '../../logger/winston-logger.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private readonly notificationModel: Model<NotificationDocument>,
    private readonly logger: WinstonLoggerService,
  ) {}

  async sendFcm(fcmToken: string, title: string, body: string, data: Record<string, string> = {}): Promise<void> {
    try {
      if (!admin.apps.length) return;
      await admin.messaging().send({
        token: fcmToken,
        notification: { title, body },
        data,
        android: { priority: 'high' },
        apns: { payload: { aps: { sound: 'default', badge: 1 } } },
      });
    } catch (err) {
      this.logger.warn(`FCM send failed: ${(err as Error).message}`);
    }
  }

  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    data: Record<string, unknown> = {},
  ): Promise<NotificationDocument> {
    return this.notificationModel.create({
      userId: new Types.ObjectId(userId),
      type,
      title,
      body,
      data,
      sentAt: new Date(),
    });
  }

  async getNotifications(userId: string, page: number, limit: number) {
    const [items, total] = await Promise.all([
      this.notificationModel
        .find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.notificationModel.countDocuments({ userId: new Types.ObjectId(userId) }),
    ]);
    return { items, total };
  }

  async markRead(userId: string, notificationId: string): Promise<void> {
    await this.notificationModel.updateOne(
      { _id: notificationId, userId: new Types.ObjectId(userId) },
      { isRead: true },
    );
  }

  async markAllRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      { userId: new Types.ObjectId(userId), isRead: false },
      { isRead: true },
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({ userId: new Types.ObjectId(userId), isRead: false });
  }
}
