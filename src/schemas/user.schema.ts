import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ _id: false })
export class Otp {
  @Prop({ type: String, select: false })
  code: string;

  @Prop({
    type: String,
    required: true,
    enum: ['email_verification', 'password_reset', 'account_deletion'],
  })
  type: string;

  @Prop({ type: Date })
  expiresAt: Date;

  @Prop({ type: Number, default: 0 })
  attempts: number;

  @Prop({ type: Boolean, default: false })
  isUsed: boolean;

  @Prop({ type: Date })
  lastSentAt: Date;

  @Prop({ type: Date })
  verifiedAt?: Date;
}

@Schema({ _id: false })
export class Session {
  @Prop({ type: String, required: true })
  jti: string;

  @Prop({ type: String, required: false })
  refreshTokenHash?: string;

  @Prop({ type: String })
  deviceInfo: string;

  @Prop({ type: Date, required: true })
  createdAt: Date;

  @Prop({ type: Date, required: true })
  expiresAt: Date;
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, lowercase: true, trim: true, maxlength: 255 })
  email: string;

  @Prop({ type: String, select: false, maxlength: 1024 })
  password: string;

  @Prop({ type: String, maxlength: 100 })
  name: string;

  @Prop({ type: String, maxlength: 512 })
  avatar?: string;

  @Prop({ type: String, maxlength: 512 })
  fcmToken?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Couple', default: null })
  coupleId?: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  isEmailVerified: boolean;

  @Prop({ type: String, default: 'email' })
  provider: string;

  @Prop({ type: String })
  providerId: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Number, default: 0 })
  loginAttempts: number;

  @Prop({ type: Date, default: null })
  lockUntil: Date;

  @Prop({ type: Otp })
  otp: Otp;

  @Prop({ type: [Session], default: [] })
  sessions: Session[];

  @Prop({ type: String, maxlength: 10 })
  appLanguage?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ providerId: 1 }, { unique: true, sparse: true });
UserSchema.index({ coupleId: 1 });
UserSchema.index({ isDeleted: 1 });
