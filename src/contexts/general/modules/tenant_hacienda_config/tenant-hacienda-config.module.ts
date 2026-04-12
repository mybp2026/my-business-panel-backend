import { Module } from '@nestjs/common';
import { TenantHaciendaConfigService } from './tenant-hacienda-config.service';
import { TenantHaciendaConfigController } from './tenant-hacienda-config.controller';

@Module({
  controllers: [TenantHaciendaConfigController],
  providers: [TenantHaciendaConfigService],
  exports: [TenantHaciendaConfigService],
})
export class TenantHaciendaConfigModule {}
