import { Controller, Post, Get, Body, Param, Patch, Headers } from '@nestjs/common';
import { OrdersService, CreateOrderDto } from './orders.service';

@Controller('api/v1/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(
    @Body() dto: CreateOrderDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    const result = await this.ordersService.createOrder(dto, idempotencyKey);
    return {
      success: true,
      message: 'Order created successfully and queued for dark store fulfillment.',
      data: result,
    };
  }

  @Post('validate-cart')
  async validateCart(@Body() dto: { warehouseId?: string; items: Array<{ productId: string; quantity: number; expectedPriceIqd?: number }> }) {
    const result = await this.ordersService.validateCart(dto);
    return {
      success: true,
      data: result,
    };
  }

  @Get(':id')
  async getOrder(@Param('id') id: string) {
    const order = await this.ordersService.getOrder(id);
    return {
      success: true,
      data: order,
    };
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    const updated = await this.ordersService.updateOrderStatus(id, status);
    return {
      success: true,
      data: updated,
    };
  }
}
