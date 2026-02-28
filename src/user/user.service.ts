import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findByTelegramId(telegramId: string): Promise<User | null> {
    return this.userModel.findOne({ telegramId }).exec();
  }

  async createUser(telegramId: string, firstName: string): Promise<User> {
    return this.userModel.create({ telegramId, firstName });
  }
}