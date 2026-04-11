import { Module } from '@nestjs/common';
import { LoyalProgramService } from './loyalty-program.service';
import { LoyalProgramController } from './loyalty-program.controller';

@Module({
  providers: [LoyalProgramService],
  controllers: [LoyalProgramController],
})
export class LoyalProgramModule {}
