import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';
import { QuestionModule } from 'src/question/question.module';
import { ResultModule } from 'src/result/result.module';
import { BotModule } from 'src/bot/bot.module';

@Module({
  imports: [
    ConfigModule.forRoot({envFilePath: ".env", isGlobal: true}),
    MongooseModule.forRoot(process.env.MONGO_URI as string),
    UserModule,
    QuestionModule,
    ResultModule,
    BotModule,
  ],
})
export class AppModule {}