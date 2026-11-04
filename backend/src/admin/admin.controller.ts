import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('api/v1/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('analytics/overview')
  async getAnalyticsOverview(@Query('warehouseId') warehouseId?: string) {
    const data = await this.adminService.getAnalyticsOverview(warehouseId);
    return { success: true, data };
  }

  // Orders
  @Get('orders')
  async getOrders(
    @Query('status') status?: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('paymentMethod') paymentMethod?: string,
    @Query('search') search?: string,
  ) {
    const orders = await this.adminService.getOrders({
      status,
      warehouseId,
      paymentMethod,
      search,
    });
    return { success: true, data: orders };
  }

  @Get('orders/:id')
  async getOrderById(@Param('id') id: string) {
    const order = await this.adminService.getOrderById(id);
    return { success: true, data: order };
  }

  @Patch('orders/:id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    const order = await this.adminService.updateOrderStatus(id, status);
    return { success: true, data: order };
  }

  @Patch('orders/:id/packing')
  async markOrderPacking(
    @Param('id') id: string,
    @Body('packedItemIds') packedItemIds: string[],
    @Body('isComplete') isComplete: boolean,
  ) {
    const order = await this.adminService.markOrderPacking(
      id,
      packedItemIds || [],
      isComplete ?? false,
    );
    return { success: true, data: order };
  }

  @Get('orders/:id/receipt')
  async generateThermalReceipt(@Param('id') id: string) {
    const receipt = await this.adminService.generateThermalReceipt(id);
    return { success: true, data: receipt };
  }

  // Catalog
  @Get('catalog')
  async getCatalog(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('brandId') brandId?: string,
  ) {
    const products = await this.adminService.getCatalog({
      search,
      categoryId,
      brandId,
    });
    return { success: true, data: products };
  }

  @Put('catalog/:id')
  async updateProduct(@Param('id') id: string, @Body() body: any) {
    const product = await this.adminService.updateProduct(id, body);
    return { success: true, data: product };
  }

  @Patch('catalog/:id/discount')
  async updateProductDiscount(
    @Param('id') id: string,
    @Body() body: { discountPercentage?: number; discountedPriceIqd?: number },
  ) {
    const product = await this.adminService.updateProductDiscount(id, body);
    return { success: true, data: product };
  }

  // Campaigns
  @Get('campaigns')
  async getCampaigns() {
    const campaigns = await this.adminService.getCampaigns();
    return { success: true, data: campaigns };
  }

  @Post('campaigns')
  async createCampaign(@Body() body: any) {
    const campaign = await this.adminService.createCampaign(body);
    return { success: true, data: campaign };
  }

  @Put('campaigns/:id')
  async updateCampaign(@Param('id') id: string, @Body() body: any) {
    const campaign = await this.adminService.updateCampaign(id, body);
    return { success: true, data: campaign };
  }

  @Delete('campaigns/:id')
  async deleteCampaign(@Param('id') id: string) {
    const result = await this.adminService.deleteCampaign(id);
    return { success: true, data: result };
  }

  // Warehouses
  @Get('warehouses')
  async getWarehouses() {
    const warehouses = await this.adminService.getWarehouses();
    return { success: true, data: warehouses };
  }

  @Put('warehouses/:id')
  async updateWarehouse(@Param('id') id: string, @Body() body: any) {
    const warehouse = await this.adminService.updateWarehouse(id, body);
    return { success: true, data: warehouse };
  }

  // Settings
  @Get('settings/payments')
  async getPaymentSettings() {
    const settings = await this.adminService.getPaymentSettings();
    return { success: true, data: settings };
  }

  @Put('settings/payments/:id')
  async updatePaymentSetting(
    @Param('id') id: string,
    @Body() body: { isEnabled: boolean; credentials?: string },
  ) {
    const result = await this.adminService.updatePaymentSetting(id, body);
    return { success: true, data: result };
  }

  // Customers CRM
  @Get('customers')
  async getCustomers() {
    const customers = await this.adminService.getCustomers();
    return { success: true, data: customers };
  }
}

