import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CouponsService, ValidateCouponDto } from './coupons.service';

@Controller('api/v1/coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get('available')
  async getAvailableCoupons(@Query('phone') phone?: string) {
    const coupons = await this.couponsService.getAvailableCoupons(phone);
    return {
      success: true,
      data: coupons,
    };
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  async validateCoupon(@Body() dto: ValidateCouponDto) {
    const result = await this.couponsService.validateCoupon(dto);
    return {
      success: true,
      data: result,
    };
  }

  // Admin endpoints mounted under /api/v1/coupons/admin or /api/v1/admin/coupons
  @Get('admin/all')
  async getAllCoupons() {
    const coupons = await this.couponsService.getAllCoupons();
    return {
      success: true,
      data: coupons,
    };
  }

  @Post('admin/create')
  @HttpCode(HttpStatus.CREATED)
  async createCoupon(@Body() data: any) {
    const coupon = await this.couponsService.createCoupon(data);
    return {
      success: true,
      message: 'Coupon created successfully.',
      data: coupon,
    };
  }

  @Patch('admin/:id/toggle')
  async toggleCoupon(@Param('id') id: string) {
    const updated = await this.couponsService.toggleCouponActive(id);
    return {
      success: true,
      message: `Coupon "${updated.code}" is now ${updated.isActive ? 'Active' : 'Inactive'}.`,
      data: updated,
    };
  }
}

