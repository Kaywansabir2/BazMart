"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogController = void 0;
const common_1 = require("@nestjs/common");
const catalog_service_1 = require("./catalog.service");
let CatalogController = class CatalogController {
    constructor(catalogService) {
        this.catalogService = catalogService;
    }
    async getHomeScreenData() {
        const data = await this.catalogService.getHomeScreenData();
        return {
            success: true,
            data,
        };
    }
    async getCategories() {
        const data = await this.catalogService.getAllCategories();
        return { success: true, data };
    }
    async getCategoryProducts(id) {
        const data = await this.catalogService.getCategoryProducts(id);
        return { success: true, data };
    }
    async getBrands() {
        const data = await this.catalogService.getAllBrands();
        return { success: true, data };
    }
    async getBrandProducts(id) {
        const data = await this.catalogService.getBrandProducts(id);
        return { success: true, data };
    }
    async getCountries() {
        const data = await this.catalogService.getAllCountries();
        return { success: true, data };
    }
    async getCountryProducts(id) {
        const data = await this.catalogService.getCountryProducts(id);
        return { success: true, data };
    }
    async search(q) {
        const data = await this.catalogService.searchProducts(q);
        return { success: true, data };
    }
    async getProduct(id) {
        const data = await this.catalogService.getProductById(id);
        return { success: true, data };
    }
};
exports.CatalogController = CatalogController;
__decorate([
    (0, common_1.Get)('home'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "getHomeScreenData", null);
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)('categories/:id/products'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "getCategoryProducts", null);
__decorate([
    (0, common_1.Get)('brands'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "getBrands", null);
__decorate([
    (0, common_1.Get)('brands/:id/products'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "getBrandProducts", null);
__decorate([
    (0, common_1.Get)('countries'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "getCountries", null);
__decorate([
    (0, common_1.Get)('countries/:id/products'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "getCountryProducts", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('products/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "getProduct", null);
exports.CatalogController = CatalogController = __decorate([
    (0, common_1.Controller)('api/v1/catalog'),
    __metadata("design:paramtypes", [catalog_service_1.CatalogService])
], CatalogController);
//# sourceMappingURL=catalog.controller.js.map