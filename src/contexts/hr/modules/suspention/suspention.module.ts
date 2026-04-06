import { Module } from '@nestjs/common';
import { SuspentionController } from './suspention.controller';
import { SuspentionService } from './suspention.service';

@Module({
  controllers: [SuspentionController],
  providers: [SuspentionService]
})
export class SuspentionModule {}
