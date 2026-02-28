import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Question, QuestionSchema } from './question.schema';
import { QuestionService } from './question.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Question.name, schema: QuestionSchema }]),
  ],
  providers: [QuestionService],
  exports: [QuestionService],
})
export class QuestionModule {}