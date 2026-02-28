import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ResultDocument = Result & Document;

@Schema()
export class Result {
  @Prop()
  telegramId: string;

  @Prop()
  level: number;

  @Prop()
  correct: number;

  @Prop()
  wrong: number;

  @Prop()
  total: number;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const ResultSchema = SchemaFactory.createForClass(Result);