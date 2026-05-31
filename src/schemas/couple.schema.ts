import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

export type CoupleDocument = Couple & Document;

export enum CoupleStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  UNLINKED = 'unlinked',
}

@Schema({ timestamps: true })
export class Couple extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user1: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null })
  user2?: Types.ObjectId;

  @Prop({ type: String, required: true, uppercase: true, maxlength: 10 })
  inviteCode: string;

  @Prop({ type: String, enum: CoupleStatus, default: CoupleStatus.PENDING })
  status: CoupleStatus;

  @Prop({ type: Date, default: null })
  anniversary?: Date;

  @Prop({ type: Date, default: null })
  unlinkedAt?: Date;
}

export const CoupleSchema = SchemaFactory.createForClass(Couple);

CoupleSchema.index({ inviteCode: 1 }, { unique: true });
CoupleSchema.index({ user1: 1 });
CoupleSchema.index({ user2: 1 });
CoupleSchema.index({ status: 1 });
