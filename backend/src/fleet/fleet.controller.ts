import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { FleetService } from './fleet.service';

@Controller('api/v1/fleet')
export class FleetController {
  constructor(private readonly fleetService: FleetService) {}

  @Get('drivers')
  async getAllDrivers(@Query('warehouseId') warehouseId?: string) {
    const drivers = await this.fleetService.getAllDrivers(warehouseId);
    return {
      success: true,
      data: drivers,
    };
  }

  @Get('drivers/:id')
  async getDriverById(@Param('id') id: string) {
    const driver = await this.fleetService.getDriverById(id);
    return {
      success: true,
      data: driver,
    };
  }

  @Post('drivers')
  async createDriver(@Body() body: any) {
    const driver = await this.fleetService.createDriver(body);
    return {
      success: true,
      data: driver,
    };
  }

  @Put('drivers/:id')
  async updateDriver(@Param('id') id: string, @Body() body: any) {
    const driver = await this.fleetService.updateDriver(id, body);
    return {
      success: true,
      data: driver,
    };
  }

  @Post('orders/:orderId/assign')
  async assignOrder(
    @Param('orderId') orderId: string,
    @Body('driverId') driverId: string,
  ) {
    const order = await this.fleetService.assignOrderToDriver(orderId, driverId);
    return {
      success: true,
      data: order,
    };
  }

  @Post('orders/:orderId/status')
  async updateDeliveryStatus(
    @Param('orderId') orderId: string,
    @Body('status') status: string,
    @Body('driverId') driverId?: string,
  ) {
    const order = await this.fleetService.updateDeliveryStatus(orderId, status, driverId);
    return {
      success: true,
      data: order,
    };
  }

  @Post('drivers/:driverId/settle-cash')
  async settleDriverCash(@Param('driverId') driverId: string) {
    const result = await this.fleetService.settleDriverCash(driverId);
    return {
      success: true,
      data: result,
    };
  }

  @Get('drivers/:driverId/orders')
  async getDriverOrders(@Param('driverId') driverId: string) {
    const orders = await this.fleetService.getDriverAssignedOrders(driverId);
    return {
      success: true,
      data: orders,
    };
  }
}

