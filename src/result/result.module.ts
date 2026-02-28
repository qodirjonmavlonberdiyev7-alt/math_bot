import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Result, ResultSchema } from './result.schema';
import { ResultService } from './result.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Result.name, schema: ResultSchema }]),
  ],
  providers: [ResultService],
  exports: [ResultService],
})
export class ResultModule {}