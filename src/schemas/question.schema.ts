import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type QuestionDocument = Question & Document;

export enum QuestionCategory {
  EMOTIONAL = 'emotional',
  ROMANTIC = 'romantic',
  FUNNY = 'funny',
  FUTURE_GOALS = 'future_goals',
  STRESS = 'stress',
  APPRECIATION = 'appreciation',
}

@Schema({ timestamps: true })
export class Question extends Document {
  @Prop({ type: String, required: true, maxlength: 500 })
  text: string;

  @Prop({ type: String, enum: QuestionCategory, required: true })
  category: QuestionCategory;

  @Prop({ type: Date, required: true })
  scheduledFor: Date;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Boolean, default: false })
  createdByAdmin: boolean;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);

QuestionSchema.index({ scheduledFor: 1 });
QuestionSchema.index({ isActive: 1 });
QuestionSchema.index({ category: 1 });
