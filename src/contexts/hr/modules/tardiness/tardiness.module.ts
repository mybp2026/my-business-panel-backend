import { Module } from '@nestjs/common';
import { TardinessService } from './tardiness.service';
import { TardinessController } from './tardiness.controller';

@Module({
  providers: [TardinessService],
  controllers: [TardinessController]
})
export class TardinessModule {}
