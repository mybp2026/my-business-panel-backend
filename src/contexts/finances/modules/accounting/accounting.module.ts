import { Module } from '@nestjs/common';
import { AccountingService } from './accounting.service';
import { AccountingJournalService } from './accounting-journal.service';
import { AccountingController } from './accounting.controller';

@Module({
  controllers: [AccountingController],
  providers: [AccountingService, AccountingJournalService],
  exports: [AccountingService, AccountingJournalService],
})
export class AccountingModule {}
