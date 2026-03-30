import { Module } from '@nestjs/common';
import { TenantHaciendaConfigService } from './tenant-hacienda-config.service';

@Module({
  providers: [TenantHaciendaConfigService],
  exports: [TenantHaciendaConfigService],
})
export class TenantHaciendaConfigModule {}
