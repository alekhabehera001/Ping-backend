import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  DAILY_QUESTION = 'daily_question',
  PARTNER_ANSWERED = 'partner_answered',
  MOOD_PING = 'mood_ping',
  MEMORY_SHARED = 'memory_shared',
  STREAK_MILESTONE = 'streak_milestone',
}

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: NotificationType, required: true })
  type: NotificationType;

  @Prop({ type: String, required: true, maxlength: 200 })
  title: string;

  @Prop({ type: String, required: true, maxlength: 500 })
  body: string;

  @Prop({ type: mongoose.Schema.Types.Mixed, default: {} })
  data: Record<string, unknown>;

  @Prop({ type: Boolean, default: false })
  isRead: boolean;

  @Prop({ type: Date, default: null })
  sentAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });
