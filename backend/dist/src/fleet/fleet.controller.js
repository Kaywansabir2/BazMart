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
exports.FleetController = void 0;
const common_1 = require("@nestjs/common");
const fleet_service_1 = require("./fleet.service");
let FleetController = class FleetController {
    constructor(fleetService) {
        this.fleetService = fleetService;
    }
    async getAllDrivers(warehouseId) {
        const drivers = await this.fleetService.getAllDrivers(warehouseId);
        return {
            success: true,
            data: drivers,
        };
    }
    async getDriverById(id) {
        const driver = await this.fleetService.getDriverById(id);
        return {
            success: true,
            data: driver,
        };
    }
    async createDriver(body) {
        const driver = await this.fleetService.createDriver(body);
        return {
            success: true,
            data: driver,
        };
    }
    async updateDriver(id, body) {
        const driver = await this.fleetService.updateDriver(id, body);
        return {
            success: true,
            data: driver,
        };
    }
    async assignOrder(orderId, driverId) {
        const order = await this.fleetService.assignOrderToDriver(orderId, driverId);
        return {
            success: true,
            data: order,
        };
    }
    async updateDeliveryStatus(orderId, status, driverId) {
        const order = await this.fleetService.updateDeliveryStatus(orderId, status, driverId);
        return {
            success: true,
            data: order,
        };
    }
    async settleDriverCash(driverId) {
        const result = await this.fleetService.settleDriverCash(driverId);
        return {
            success: true,
            data: result,
        };
    }
    async getDriverOrders(driverId) {
        const orders = await this.fleetService.getDriverAssignedOrders(driverId);
        return {
            success: true,
            data: orders,
        };
    }
};
exports.FleetController = FleetController;
__decorate([
    (0, common_1.Get)('drivers'),
    __param(0, (0, common_1.Query)('warehouseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FleetController.prototype, "getAllDrivers", null);
__decorate([
    (0, common_1.Get)('drivers/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FleetController.prototype, "getDriverById", null);
__decorate([
    (0, common_1.Post)('drivers'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FleetController.prototype, "createDriver", null);
__decorate([
    (0, common_1.Put)('drivers/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FleetController.prototype, "updateDriver", null);
__decorate([
    (0, common_1.Post)('orders/:orderId/assign'),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)('driverId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FleetController.prototype, "assignOrder", null);
__decorate([
    (0, common_1.Post)('orders/:orderId/status'),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Body)('driverId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], FleetController.prototype, "updateDeliveryStatus", null);
__decorate([
    (0, common_1.Post)('drivers/:driverId/settle-cash'),
    __param(0, (0, common_1.Param)('driverId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FleetController.prototype, "settleDriverCash", null);
__decorate([
    (0, common_1.Get)('drivers/:driverId/orders'),
    __param(0, (0, common_1.Param)('driverId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FleetController.prototype, "getDriverOrders", null);
exports.FleetController = FleetController = __decorate([
    (0, common_1.Controller)('api/v1/fleet'),
    __metadata("design:paramtypes", [fleet_service_1.FleetService])
], FleetController);
//# sourceMappingURL=fleet.controller.js.map