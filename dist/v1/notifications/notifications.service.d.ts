import { Model, Types } from 'mongoose';
import { NotificationDocument, NotificationType } from '../../schemas/notification.schema';
import { WinstonLoggerService } from '../../logger/winston-logger.service';
export declare class NotificationsService {
    private readonly notificationModel;
    private readonly logger;
    constructor(notificationModel: Model<NotificationDocument>, logger: WinstonLoggerService);
    sendFcm(fcmToken: string, title: string, body: string, data?: Record<string, string>): Promise<void>;
    createNotification(userId: string, type: NotificationType, title: string, body: string, data?: Record<string, unknown>): Promise<NotificationDocument>;
    getNotifications(userId: string, page: number, limit: number): Promise<{
        items: (import("mongoose").FlattenMaps<NotificationDocument> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
    }>;
    markRead(userId: string, notificationId: string): Promise<void>;
    markAllRead(userId: string): Promise<void>;
    getUnreadCount(userId: string): Promise<number>;
}
