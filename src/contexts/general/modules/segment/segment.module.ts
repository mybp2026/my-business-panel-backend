import { Module } from '@nestjs/common';
import { SegmentService } from './segment.service';
import { SegmentController } from './segment.controller';

@Module({
  providers: [SegmentService],
  controllers: [SegmentController]
})
export class SegmentModule {}
