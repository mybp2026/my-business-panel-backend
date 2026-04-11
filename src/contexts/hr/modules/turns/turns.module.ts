import { Module } from '@nestjs/common';
import { TurnsService } from './turns.service';
import { TurnsController } from './turns.controller';

@Module({
  providers: [TurnsService],
  controllers: [TurnsController]
})
export class TurnsModule {}
