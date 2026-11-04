import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CustomerService, UpdateProfileDto, AddressDto } from './customer.service';
import { verifySessionToken } from '../auth/jwt.util';

@Controller('api/v1/customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  private extractIdentifier(authHeader?: string, phoneQuery?: string, xPhone?: string, xId?: string) {
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      const payload = verifySessionToken(token);
      if (payload) {
        return { customerId: payload.sub, phone: payload.phone };
      }
    }
    if (xId) return { customerId: xId };
    if (xPhone) return { phone: xPhone };
    if (phoneQuery) return { phone: phoneQuery };
    return {};
  }

  @Get('profile')
  async getProfile(
    @Headers('authorization') authHeader?: string,
    @Headers('x-customer-phone') xPhone?: string,
    @Headers('x-customer-id') xId?: string,
    @Query('phone') phoneQuery?: string,
  ) {
    const ident = this.extractIdentifier(authHeader, phoneQuery, xPhone, xId);
    return this.customerService.getProfile(ident);
  }

  @Put('profile')
  async updateProfile(
    @Body() dto: UpdateProfileDto,
    @Headers('authorization') authHeader?: string,
    @Headers('x-customer-phone') xPhone?: string,
    @Headers('x-customer-id') xId?: string,
    @Query('phone') phoneQuery?: string,
  ) {
    const ident = this.extractIdentifier(authHeader, phoneQuery, xPhone, xId);
    return this.customerService.updateProfile(ident, dto);
  }

  @Get('addresses')
  async getAddresses(
    @Headers('authorization') authHeader?: string,
    @Headers('x-customer-phone') xPhone?: string,
    @Headers('x-customer-id') xId?: string,
    @Query('phone') phoneQuery?: string,
  ) {
    const ident = this.extractIdentifier(authHeader, phoneQuery, xPhone, xId);
    return this.customerService.getAddresses(ident);
  }

  @Post('addresses')
  async addAddress(
    @Body() dto: AddressDto,
    @Headers('authorization') authHeader?: string,
    @Headers('x-customer-phone') xPhone?: string,
    @Headers('x-customer-id') xId?: string,
    @Query('phone') phoneQuery?: string,
  ) {
    const ident = this.extractIdentifier(authHeader, phoneQuery, xPhone, xId);
    return this.customerService.addAddress(ident, dto);
  }

  @Put('addresses/:id')
  async updateAddress(
    @Param('id') addressId: string,
    @Body() dto: AddressDto,
    @Headers('authorization') authHeader?: string,
    @Headers('x-customer-phone') xPhone?: string,
    @Headers('x-customer-id') xId?: string,
    @Query('phone') phoneQuery?: string,
  ) {
    const ident = this.extractIdentifier(authHeader, phoneQuery, xPhone, xId);
    return this.customerService.updateAddress(ident, addressId, dto);
  }

  @Delete('addresses/:id')
  async deleteAddress(
    @Param('id') addressId: string,
    @Headers('authorization') authHeader?: string,
    @Headers('x-customer-phone') xPhone?: string,
    @Headers('x-customer-id') xId?: string,
    @Query('phone') phoneQuery?: string,
  ) {
    const ident = this.extractIdentifier(authHeader, phoneQuery, xPhone, xId);
    return this.customerService.deleteAddress(ident, addressId);
  }

  @Get('orders')
  async getOrders(
    @Headers('authorization') authHeader?: string,
    @Headers('x-customer-phone') xPhone?: string,
    @Headers('x-customer-id') xId?: string,
    @Query('phone') phoneQuery?: string,
  ) {
    const ident = this.extractIdentifier(authHeader, phoneQuery, xPhone, xId);
    return this.customerService.getOrders(ident);
  }

  @Post('orders/:id/reorder')
  @HttpCode(HttpStatus.OK)
  async reorder(
    @Param('id') orderId: string,
    @Query('warehouseId') warehouseId?: string,
    @Headers('authorization') authHeader?: string,
    @Headers('x-customer-phone') xPhone?: string,
    @Headers('x-customer-id') xId?: string,
    @Query('phone') phoneQuery?: string,
  ) {
    const ident = this.extractIdentifier(authHeader, phoneQuery, xPhone, xId);
    return this.customerService.reorder(ident, orderId, warehouseId);
  }

  @Get('personalized-products')
  async getPersonalizedProducts(
    @Query('limit') limit?: string,
    @Headers('authorization') authHeader?: string,
    @Headers('x-customer-phone') xPhone?: string,
    @Headers('x-customer-id') xId?: string,
    @Query('phone') phoneQuery?: string,
  ) {
    const ident = this.extractIdentifier(authHeader, phoneQuery, xPhone, xId);
    return this.customerService.getPersonalizedProducts(ident, limit ? parseInt(limit, 10) : 8);
  }
}

