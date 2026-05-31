import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

export enum StreakBadge {
  WEEK = 'week',
  MONTH = 'month',
  CENTURY = 'century',
}

export type StreakDocument = Streak & Document;

@Schema({ timestamps: true })
export class Streak extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Couple', required: true })
  coupleId: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  currentStreak: number;

  @Prop({ type: Number, default: 0 })
  longestStreak: number;

  @Prop({ type: Date, default: null })
  lastAnsweredDate?: Date;

  @Prop({ type: [String], enum: StreakBadge, default: [] })
  badges: StreakBadge[];

  @Prop({ type: Number, default: 1 })
  recoveryTokens: number;
}

export const StreakSchema = SchemaFactory.createForClass(Streak);

StreakSchema.index({ coupleId: 1 }, { unique: true });
