import { Controller, Post, Body, HttpCode, HttpStatus, Headers, UnauthorizedException } from '@nestjs/common';
import { ErpSyncService } from './erp-sync.service';
import { ErpStockDelta } from './erp-connector.interface';

@Controller('api/v1/erp')
export class ErpSyncController {
  constructor(private readonly erpSyncService: ErpSyncService) {}

  @Post('webhook/stock-update')
  @HttpCode(HttpStatus.OK)
  async handleStockUpdate(
    @Body() body: { updates: ErpStockDelta[] },
    @Headers('x-erp-signature') signature?: string,
  ) {
    const updates = Array.isArray(body?.updates) ? body.updates : (Array.isArray(body) ? body : []);
    const result = await this.erpSyncService.processBatchStockUpdate(updates);
    return {
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    };
  }

  @Post('sync/trigger')
  @HttpCode(HttpStatus.OK)
  async triggerSync(@Headers('x-admin-key') adminKey?: string) {
    const report = await this.erpSyncService.triggerManualSync();
    return {
      success: true,
      data: report,
    };
  }
}

