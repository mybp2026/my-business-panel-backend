import { Module } from '@nestjs/common';
import { PosRoyaltyController } from './pos-royalty.controller';
import { PosRoyaltyService } from './pos-royalty.service';

@Module({
  controllers: [PosRoyaltyController],
  providers: [PosRoyaltyService],
})
export class PosRoyaltyModule {}
