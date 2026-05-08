import { Module } from '@nestjs/common';
import { FoulController } from './foul.controller';
import { FoulService } from './foul.service';

@Module({
  controllers: [FoulController],
  providers: [FoulService]
})
export class FoulModule {}
