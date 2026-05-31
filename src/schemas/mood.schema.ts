import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

export type MoodDocument = Mood & Document;

export enum MoodType {
  HAPPY = 'happy',
  SAD = 'sad',
  STRESSED = 'stressed',
  ANGRY = 'angry',
  EXCITED = 'excited',
  LOVED = 'loved',
  TIRED = 'tired',
}

@Schema({ timestamps: true })
export class Mood extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Couple', required: true })
  coupleId: Types.ObjectId;

  @Prop({ type: String, enum: MoodType, required: true })
  mood: MoodType;

  @Prop({ type: String, maxlength: 200 })
  note?: string;
}

export const MoodSchema = SchemaFactory.createForClass(Mood);

MoodSchema.index({ userId: 1, createdAt: -1 });
MoodSchema.index({ coupleId: 1, createdAt: -1 });
