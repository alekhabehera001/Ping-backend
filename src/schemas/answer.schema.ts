import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

export type AnswerDocument = Answer & Document;

@Schema({ timestamps: true })
export class Answer extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true })
  questionId: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Couple', required: true })
  coupleId: Types.ObjectId;

  @Prop({ type: String, required: true, maxlength: 1000 })
  text: string;

  @Prop({ type: Boolean, default: false })
  isRevealed: boolean;
}

export const AnswerSchema = SchemaFactory.createForClass(Answer);

AnswerSchema.index({ questionId: 1, coupleId: 1 });
AnswerSchema.index({ userId: 1 });
AnswerSchema.index({ coupleId: 1 });
AnswerSchema.index({ questionId: 1, userId: 1 }, { unique: true });
