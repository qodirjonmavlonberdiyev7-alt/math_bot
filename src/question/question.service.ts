import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question, QuestionDocument } from './question.schema';

@Injectable()
export class QuestionService {
  constructor(
    @InjectModel(Question.name)
    private questionModel: Model<QuestionDocument>,
  ) {}

  async getRandomQuestions(level: number) {
    return this.questionModel.aggregate([
      { $match: { level } },
      { $sample: { size: 10 } },
    ]);
  }
}