import { Module } from '@nestjs/common';
import { PaysheetService } from './paysheet.service';
import { PaysheetController } from './paysheet.controller';

@Module({
  providers: [PaysheetService],
  controllers: [PaysheetController]
})
export class PaysheetModule {}
