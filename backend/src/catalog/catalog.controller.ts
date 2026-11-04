import { Controller, Get, Param, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller('api/v1/catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('home')
  async getHomeScreenData() {
    const data = await this.catalogService.getHomeScreenData();
    return {
      success: true,
      data,
    };
  }

  @Get('categories')
  async getCategories() {
    const data = await this.catalogService.getAllCategories();
    return { success: true, data };
  }

  @Get('categories/:id/products')
  async getCategoryProducts(@Param('id') id: string) {
    const data = await this.catalogService.getCategoryProducts(id);
    return { success: true, data };
  }

  @Get('brands')
  async getBrands() {
    const data = await this.catalogService.getAllBrands();
    return { success: true, data };
  }

  @Get('brands/:id/products')
  async getBrandProducts(@Param('id') id: string) {
    const data = await this.catalogService.getBrandProducts(id);
    return { success: true, data };
  }

  @Get('countries')
  async getCountries() {
    const data = await this.catalogService.getAllCountries();
    return { success: true, data };
  }

  @Get('countries/:id/products')
  async getCountryProducts(@Param('id') id: string) {
    const data = await this.catalogService.getCountryProducts(id);
    return { success: true, data };
  }

  @Get('search')
  async search(@Query('q') q: string) {
    const data = await this.catalogService.searchProducts(q);
    return { success: true, data };
  }

  @Get('products/:id')
  async getProduct(@Param('id') id: string) {
    const data = await this.catalogService.getProductById(id);
    return { success: true, data };
  }
}

