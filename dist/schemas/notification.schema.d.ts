import mongoose, { Document, Types } from 'mongoose';
export type NotificationDocument = Notification & Document;
export declare enum NotificationType {
    DAILY_QUESTION = "daily_question",
    PARTNER_ANSWERED = "partner_answered",
    MOOD_PING = "mood_ping",
    MEMORY_SHARED = "memory_shared",
    STREAK_MILESTONE = "streak_milestone"
}
export declare class Notification extends Document {
    userId: Types.ObjectId;
    type: NotificationType;
    title: string;
    body: string;
    data: Record<string, unknown>;
    isRead: boolean;
    sentAt?: Date;
}
export declare const NotificationSchema: mongoose.Schema<Notification, mongoose.Model<Notification, any, any, any, mongoose.Document<unknown, any, Notification, any, {}> & Notification & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Notification, mongoose.Document<unknown, {}, mongoose.FlatRecord<Notification>, {}, mongoose.DefaultSchemaOptions> & mongoose.FlatRecord<Notification> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
