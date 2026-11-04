import { Module } from '@nestjs/common';
import { ErpSyncService } from './erp-sync.service';
import { ErpSyncController } from './erp-sync.controller';

@Module({
  controllers: [ErpSyncController],
  providers: [ErpSyncService],
  exports: [ErpSyncService],
})
export class ErpSyncModule {}

