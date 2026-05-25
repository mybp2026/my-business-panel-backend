import { Module } from '@nestjs/common';
import { CollectionAlertsService } from './collection-alerts.service';
import { CollectionAlertsController } from './collection-alerts.controller';

@Module({
  controllers: [CollectionAlertsController],
  providers: [CollectionAlertsService],
})
export class CollectionAlertsModule {}
