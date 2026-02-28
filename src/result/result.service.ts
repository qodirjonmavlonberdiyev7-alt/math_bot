import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Result, ResultDocument } from './result.schema';

@Injectable()
export class ResultService {
  constructor(
    @InjectModel(Result.name)
    private resultModel: Model<ResultDocument>,
  ) {}

  async saveResult(data: any) {
    return this.resultModel.create(data);
  }
}