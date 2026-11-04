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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FleetService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FleetService = class FleetService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllDrivers(warehouseId) {
        const where = {};
        if (warehouseId && warehouseId !== 'all') {
            where.warehouseId = warehouseId;
        }
        const drivers = await this.prisma.driver.findMany({
            where,
            include: {
                warehouse: true,
                assignedOrders: {
                    where: {
                        orderStatus: { in: ['PACKING_IN_DARKSTORE', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'] },
                    },
                    select: {
                        id: true,
                        orderNumber: true,
                        totalIqd: true,
                        paymentMethod: true,
                        orderStatus: true,
                        estimatedDeliveryMinutes: true,
                    },
                },
            },
            orderBy: { fullName: 'asc' },
        });
        return drivers.map(d => ({
            id: d.id,
            fullName: d.fullName,
            phone: d.phone,
            vehicleType: d.vehicleType,
            plateNumber: d.plateNumber,
            warehouseId: d.warehouseId,
            warehouseName: d.warehouse?.name,
            warehouseCity: d.warehouse?.city,
            status: d.status,
            cashInHandIqd: d.cashInHandIqd,
            activeOrder: d.assignedOrders[0] || null,
            createdAt: d.createdAt,
        }));
    }
    async getDriverById(id) {
        const driver = await this.prisma.driver.findUnique({
            where: { id },
            include: {
                warehouse: true,
                assignedOrders: {
                    include: {
                        items: {
                            include: { product: true },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });
        if (!driver) {
            throw new common_1.NotFoundException(`Driver with ID "${id}" not found.`);
        }
        return driver;
    }
    async createDriver(data) {
        return this.prisma.driver.create({
            data: {
                fullName: data.fullName,
                phone: data.phone,
                vehicleType: data.vehicleType || 'Motorcycle',
                plateNumber: data.plateNumber,
                warehouseId: data.warehouseId,
                status: 'AVAILABLE',
                cashInHandIqd: 0,
            },
        });
    }
    async updateDriver(id, data) {
        return this.prisma.driver.update({
            where: { id },
            data,
        });
    }
    async assignOrderToDriver(orderId, driverId) {
        const driver = await this.prisma.driver.findUnique({ where: { id: driverId } });
        if (!driver) {
            throw new common_1.NotFoundException(`Driver "${driverId}" not found.`);
        }
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order) {
            throw new common_1.NotFoundException(`Order "${orderId}" not found.`);
        }
        const updatedOrder = await this.prisma.order.update({
            where: { id: orderId },
            data: {
                driverId,
                assignedDriverName: driver.fullName,
                assignedDriverPhone: driver.phone,
                orderStatus: 'OUT_FOR_DELIVERY',
                estimatedDeliveryMinutes: '12-15 mins',
            },
            include: {
                items: { include: { product: true } },
            },
        });
        await this.prisma.driver.update({
            where: { id: driverId },
            data: { status: 'BUSY_DELIVERING' },
        });
        return updatedOrder;
    }
    async updateDeliveryStatus(orderId, status, driverId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { driver: true },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order "${orderId}" not found.`);
        }
        const validStatuses = ['PICKED_UP', 'ARRIVED_AT_CUSTOMER', 'DELIVERED', 'DELIVERED_COD_COLLECTED'];
        if (!validStatuses.includes(status)) {
            throw new common_1.BadRequestException(`Invalid delivery status "${status}". Allowed: ${validStatuses.join(', ')}`);
        }
        const effectiveDriverId = driverId || order.driverId;
        if (status === 'PICKED_UP') {
            return this.prisma.order.update({
                where: { id: orderId },
                data: {
                    orderStatus: 'OUT_FOR_DELIVERY',
                    pickedUpAt: new Date(),
                    estimatedDeliveryMinutes: '10-12 mins',
                },
            });
        }
        if (status === 'ARRIVED_AT_CUSTOMER') {
            return this.prisma.order.update({
                where: { id: orderId },
                data: {
                    estimatedDeliveryMinutes: 'Arrived at your door',
                },
            });
        }
        if (status === 'DELIVERED' || status === 'DELIVERED_COD_COLLECTED') {
            const isCod = order.paymentMethod === 'COD';
            const updatedOrder = await this.prisma.order.update({
                where: { id: orderId },
                data: {
                    orderStatus: 'DELIVERED',
                    paymentStatus: 'PAID',
                    deliveredAt: new Date(),
                    estimatedDeliveryMinutes: 'Delivered',
                },
            });
            if (effectiveDriverId) {
                await this.prisma.driver.update({
                    where: { id: effectiveDriverId },
                    data: {
                        status: 'AVAILABLE',
                        ...(isCod ? { cashInHandIqd: { increment: order.totalIqd } } : {}),
                    },
                });
            }
            return updatedOrder;
        }
        return order;
    }
    async settleDriverCash(driverId) {
        const driver = await this.prisma.driver.findUnique({ where: { id: driverId } });
        if (!driver) {
            throw new common_1.NotFoundException(`Driver "${driverId}" not found.`);
        }
        const settledAmount = driver.cashInHandIqd;
        const updatedDriver = await this.prisma.driver.update({
            where: { id: driverId },
            data: { cashInHandIqd: 0 },
        });
        return {
            success: true,
            driverId,
            driverName: driver.fullName,
            settledAmountIqd: settledAmount,
            remainingCashInHandIqd: 0,
            settledAt: new Date().toISOString(),
            receiptNumber: `SETTLE-${Date.now().toString().slice(-6)}`,
            driver: updatedDriver,
        };
    }
    async getDriverAssignedOrders(driverId) {
        return this.prisma.order.findMany({
            where: {
                OR: [
                    { driverId },
                    { assignedDriverName: { contains: driverId } },
                ],
            },
            include: {
                items: {
                    include: { product: true },
                },
                warehouse: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
    }
};
exports.FleetService = FleetService;
exports.FleetService = FleetService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FleetService);
//# sourceMappingURL=fleet.service.js.map