import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { UserModule } from '../user/user.module';
import { QuestionModule } from '../question/question.module';
import { ResultModule } from '../result/result.module';

@Module({
  imports: [UserModule, QuestionModule, ResultModule],
  providers: [BotService],
})
export class BotModule {}