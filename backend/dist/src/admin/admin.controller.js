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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
let AdminController = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    async getAnalyticsOverview(warehouseId) {
        const data = await this.adminService.getAnalyticsOverview(warehouseId);
        return { success: true, data };
    }
    async getOrders(status, warehouseId, paymentMethod, search) {
        const orders = await this.adminService.getOrders({
            status,
            warehouseId,
            paymentMethod,
            search,
        });
        return { success: true, data: orders };
    }
    async getOrderById(id) {
        const order = await this.adminService.getOrderById(id);
        return { success: true, data: order };
    }
    async updateOrderStatus(id, status) {
        const order = await this.adminService.updateOrderStatus(id, status);
        return { success: true, data: order };
    }
    async markOrderPacking(id, packedItemIds, isComplete) {
        const order = await this.adminService.markOrderPacking(id, packedItemIds || [], isComplete ?? false);
        return { success: true, data: order };
    }
    async generateThermalReceipt(id) {
        const receipt = await this.adminService.generateThermalReceipt(id);
        return { success: true, data: receipt };
    }
    async getCatalog(search, categoryId, brandId) {
        const products = await this.adminService.getCatalog({
            search,
            categoryId,
            brandId,
        });
        return { success: true, data: products };
    }
    async updateProduct(id, body) {
        const product = await this.adminService.updateProduct(id, body);
        return { success: true, data: product };
    }
    async updateProductDiscount(id, body) {
        const product = await this.adminService.updateProductDiscount(id, body);
        return { success: true, data: product };
    }
    async getCampaigns() {
        const campaigns = await this.adminService.getCampaigns();
        return { success: true, data: campaigns };
    }
    async createCampaign(body) {
        const campaign = await this.adminService.createCampaign(body);
        return { success: true, data: campaign };
    }
    async updateCampaign(id, body) {
        const campaign = await this.adminService.updateCampaign(id, body);
        return { success: true, data: campaign };
    }
    async deleteCampaign(id) {
        const result = await this.adminService.deleteCampaign(id);
        return { success: true, data: result };
    }
    async getWarehouses() {
        const warehouses = await this.adminService.getWarehouses();
        return { success: true, data: warehouses };
    }
    async updateWarehouse(id, body) {
        const warehouse = await this.adminService.updateWarehouse(id, body);
        return { success: true, data: warehouse };
    }
    async getPaymentSettings() {
        const settings = await this.adminService.getPaymentSettings();
        return { success: true, data: settings };
    }
    async updatePaymentSetting(id, body) {
        const result = await this.adminService.updatePaymentSetting(id, body);
        return { success: true, data: result };
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('analytics/overview'),
    __param(0, (0, common_1.Query)('warehouseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAnalyticsOverview", null);
__decorate([
    (0, common_1.Get)('orders'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('warehouseId')),
    __param(2, (0, common_1.Query)('paymentMethod')),
    __param(3, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Get)('orders/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getOrderById", null);
__decorate([
    (0, common_1.Patch)('orders/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateOrderStatus", null);
__decorate([
    (0, common_1.Patch)('orders/:id/packing'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('packedItemIds')),
    __param(2, (0, common_1.Body)('isComplete')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Boolean]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "markOrderPacking", null);
__decorate([
    (0, common_1.Get)('orders/:id/receipt'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "generateThermalReceipt", null);
__decorate([
    (0, common_1.Get)('catalog'),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('categoryId')),
    __param(2, (0, common_1.Query)('brandId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getCatalog", null);
__decorate([
    (0, common_1.Put)('catalog/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Patch)('catalog/:id/discount'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateProductDiscount", null);
__decorate([
    (0, common_1.Get)('campaigns'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getCampaigns", null);
__decorate([
    (0, common_1.Post)('campaigns'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createCampaign", null);
__decorate([
    (0, common_1.Put)('campaigns/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateCampaign", null);
__decorate([
    (0, common_1.Delete)('campaigns/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteCampaign", null);
__decorate([
    (0, common_1.Get)('warehouses'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getWarehouses", null);
__decorate([
    (0, common_1.Put)('warehouses/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateWarehouse", null);
__decorate([
    (0, common_1.Get)('settings/payments'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPaymentSettings", null);
__decorate([
    (0, common_1.Put)('settings/payments/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updatePaymentSetting", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('api/v1/admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map