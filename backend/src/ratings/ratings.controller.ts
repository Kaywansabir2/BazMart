import {
  Controller,
  Get,
  Post,
  Param,
  Body,
} from '@nestjs/common';
import { RatingsService, RateOrderDto } from './ratings.service';

@Controller('api/v1')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Get('orders/:orderId/live-status')
  async getLiveStatus(@Param('orderId') orderId: string) {
    return this.ratingsService.getLiveOrderStatus(orderId);
  }

  @Post('orders/:orderId/rate')
  async rateOrder(
    @Param('orderId') orderId: string,
    @Body() dto: RateOrderDto,
  ) {
    return this.ratingsService.rateOrder(orderId, dto);
  }

  @Get('admin/ratings')
  async getAdminRatings() {
    return this.ratingsService.getAdminRatings();
  }
}

