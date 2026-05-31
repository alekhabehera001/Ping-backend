import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

export type MemoryDocument = Memory & Document;

export enum MemoryType {
  PHOTO = 'photo',
  VOICE = 'voice',
  NOTE = 'note',
}

@Schema({ timestamps: true })
export class Memory extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Couple', required: true })
  coupleId: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  uploadedBy: Types.ObjectId;

  @Prop({ type: String, enum: MemoryType, required: true })
  type: MemoryType;

  @Prop({ type: String, maxlength: 512 })
  s3Key?: string;

  @Prop({ type: String, maxlength: 1024 })
  s3Url?: string;

  @Prop({ type: String, maxlength: 500 })
  caption?: string;

  @Prop({ type: String, maxlength: 2000 })
  noteText?: string;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;
}

export const MemorySchema = SchemaFactory.createForClass(Memory);

MemorySchema.index({ coupleId: 1, createdAt: -1 });
MemorySchema.index({ coupleId: 1, isDeleted: 1 });
MemorySchema.index({ uploadedBy: 1 });
