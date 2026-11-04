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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const payments_service_1 = require("../payments/payments.service");
let AdminService = class AdminService {
    constructor(prisma, paymentsService) {
        this.prisma = prisma;
        this.paymentsService = paymentsService;
    }
    async getAnalyticsOverview(warehouseId) {
        const orderWhere = {};
        const driverWhere = {};
        if (warehouseId && warehouseId !== 'all') {
            orderWhere.warehouseId = warehouseId;
            driverWhere.warehouseId = warehouseId;
        }
        const allOrders = await this.prisma.order.findMany({
            where: orderWhere,
            include: { items: { include: { product: true } } },
            orderBy: { createdAt: 'desc' },
        });
        const totalOrders = allOrders.length;
        const gmvTotalIqd = allOrders.reduce((acc, o) => acc + o.totalIqd, 0);
        const avgBasketIqd = totalOrders > 0 ? Math.round(gmvTotalIqd / totalOrders) : 0;
        const ordersByStatus = {
            PLACED: 0,
            PACKING_IN_DARKSTORE: 0,
            READY_FOR_PICKUP: 0,
            OUT_FOR_DELIVERY: 0,
            DELIVERED: 0,
            CANCELLED: 0,
        };
        for (const o of allOrders) {
            if (ordersByStatus[o.orderStatus] !== undefined) {
                ordersByStatus[o.orderStatus]++;
            }
        }
        const drivers = await this.prisma.driver.findMany({ where: driverWhere });
        const activeRiders = drivers.filter(d => d.status === 'AVAILABLE' || d.status === 'BUSY_DELIVERING').length;
        const pendingCodCashInFieldIqd = drivers.reduce((acc, d) => acc + d.cashInHandIqd, 0);
        const stockWhere = {};
        if (warehouseId && warehouseId !== 'all') {
            stockWhere.warehouseId = warehouseId;
        }
        const lowStockRecords = await this.prisma.warehouseStock.findMany({
            where: {
                ...stockWhere,
                stockQuantity: { lt: 20 },
            },
            include: { product: true, warehouse: true },
        });
        const productSalesMap = new Map();
        for (const o of allOrders) {
            for (const item of o.items) {
                const existing = productSalesMap.get(item.productId);
                if (existing) {
                    existing.unitsSold += item.quantity;
                    existing.revenueIqd += item.totalIqd;
                }
                else {
                    productSalesMap.set(item.productId, {
                        product: item.product,
                        unitsSold: item.quantity,
                        revenueIqd: item.totalIqd,
                    });
                }
            }
        }
        const topSellingProducts = Array.from(productSalesMap.values())
            .sort((a, b) => b.unitsSold - a.unitsSold)
            .slice(0, 5);
        const totalProductsCount = await this.prisma.product.count();
        return {
            gmvTodayIqd: gmvTotalIqd,
            totalOrders,
            avgBasketIqd,
            activeRiders,
            totalRiders: drivers.length,
            ordersPackedUnder3MinsPercent: 94.2,
            avgDeliveryTimeMinutes: 14.8,
            pendingCodCashInFieldIqd,
            lowStockAlertsCount: lowStockRecords.length,
            lowStockAlerts: lowStockRecords.map(r => ({
                id: r.id,
                productId: r.productId,
                productTitle: r.product.titleEn,
                barcode: r.product.barcode || r.product.externalErpId,
                warehouseName: r.warehouse.name,
                availableStock: r.stockQuantity - r.reservedQuantity,
            })),
            ordersByStatus,
            erpSyncHealth: {
                status: 'Connected',
                lastSyncedAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
                syncedSkusCount: totalProductsCount,
            },
            topSellingProducts,
            recentOrders: allOrders.slice(0, 6).map(o => ({
                id: o.id,
                orderNumber: o.orderNumber,
                warehouseId: o.warehouseId,
                orderStatus: o.orderStatus,
                paymentMethod: o.paymentMethod,
                totalIqd: o.totalIqd,
                assignedDriverName: o.assignedDriverName,
                itemsCount: o.items.length,
                createdAt: o.createdAt,
            })),
        };
    }
    async getOrders(filters) {
        const where = {};
        if (filters.status && filters.status !== 'ALL') {
            where.orderStatus = filters.status;
        }
        if (filters.warehouseId && filters.warehouseId !== 'all') {
            where.warehouseId = filters.warehouseId;
        }
        if (filters.paymentMethod && filters.paymentMethod !== 'ALL') {
            where.paymentMethod = filters.paymentMethod;
        }
        if (filters.search) {
            where.OR = [
                { orderNumber: { contains: filters.search } },
                { assignedDriverName: { contains: filters.search } },
                { addressSnapshot: { contains: filters.search } },
            ];
        }
        const orders = await this.prisma.order.findMany({
            where,
            include: {
                items: {
                    include: { product: true },
                },
                warehouse: true,
                driver: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return orders.map(o => {
            let parsedAddress = {};
            try {
                parsedAddress = JSON.parse(o.addressSnapshot);
            }
            catch {
                parsedAddress = { city: 'Erbil', neighborhood: o.addressSnapshot };
            }
            let packedIds = [];
            try {
                packedIds = o.packedItems ? JSON.parse(o.packedItems) : [];
            }
            catch {
                packedIds = [];
            }
            return {
                id: o.id,
                orderNumber: o.orderNumber,
                warehouseId: o.warehouseId,
                warehouseName: o.warehouse?.name,
                warehouseCity: o.warehouse?.city,
                orderStatus: o.orderStatus,
                paymentMethod: o.paymentMethod,
                paymentStatus: o.paymentStatus,
                subtotalIqd: o.subtotalIqd,
                discountTotalIqd: o.discountTotalIqd,
                deliveryFeeIqd: o.deliveryFeeIqd,
                totalIqd: o.totalIqd,
                isPacked: o.isPacked,
                packedItemIds: packedIds,
                driverId: o.driverId,
                assignedDriverName: o.assignedDriverName || o.driver?.fullName,
                assignedDriverPhone: o.assignedDriverPhone || o.driver?.phone,
                estimatedDeliveryMinutes: o.estimatedDeliveryMinutes,
                customerAddress: parsedAddress,
                items: o.items.map(item => ({
                    id: item.id,
                    productId: item.productId,
                    titleEn: item.product.titleEn,
                    titleCkb: item.product.titleCkb,
                    titleAr: item.product.titleAr,
                    barcode: item.product.barcode || item.product.externalErpId,
                    storageTemp: item.product.storageTemp || 'Ambient',
                    quantity: item.quantity,
                    unitPriceIqd: item.unitPriceIqd,
                    totalIqd: item.totalIqd,
                    imageUrl: item.product.imageUrl,
                    isPacked: item.isPacked || packedIds.includes(item.productId),
                })),
                createdAt: o.createdAt,
                updatedAt: o.updatedAt,
            };
        });
    }
    async getOrderById(id) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: { product: true },
                },
                warehouse: true,
                driver: true,
            },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID "${id}" not found.`);
        }
        let parsedAddress = {};
        try {
            parsedAddress = JSON.parse(order.addressSnapshot);
        }
        catch {
            parsedAddress = { city: 'Erbil', neighborhood: order.addressSnapshot };
        }
        return {
            ...order,
            customerAddress: parsedAddress,
        };
    }
    async updateOrderStatus(id, status) {
        const validStatuses = ['PLACED', 'PACKING_IN_DARKSTORE', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            throw new common_1.BadRequestException(`Invalid order status "${status}". Allowed: ${validStatuses.join(', ')}`);
        }
        return this.prisma.order.update({
            where: { id },
            data: { orderStatus: status },
            include: {
                items: { include: { product: true } },
                warehouse: true,
                driver: true,
            },
        });
    }
    async markOrderPacking(id, packedItemIds, isComplete) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: { items: true },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order "${id}" not found.`);
        }
        for (const item of order.items) {
            const isItemPacked = packedItemIds.includes(item.productId);
            await this.prisma.orderItem.update({
                where: { id: item.id },
                data: { isPacked: isItemPacked },
            });
        }
        return this.prisma.order.update({
            where: { id },
            data: {
                isPacked: isComplete,
                packedItems: JSON.stringify(packedItemIds),
                orderStatus: isComplete ? 'READY_FOR_PICKUP' : 'PACKING_IN_DARKSTORE',
            },
            include: {
                items: { include: { product: true } },
                warehouse: true,
                driver: true,
            },
        });
    }
    async generateThermalReceipt(id) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                items: { include: { product: true } },
                warehouse: true,
                driver: true,
            },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order "${id}" not found.`);
        }
        let address = {};
        try {
            address = JSON.parse(order.addressSnapshot);
        }
        catch {
            address = { city: 'Erbil', neighborhood: order.addressSnapshot };
        }
        const pad = (str, len, alignRight = false) => {
            const s = String(str);
            if (s.length >= len)
                return s.slice(0, len);
            return alignRight ? ' '.repeat(len - s.length) + s : s + ' '.repeat(len - s.length);
        };
        const lines = [
            '==========================================',
            '               BAZMART                    ',
            '       TALABAT MART IRAQ & KURDISTAN      ',
            '==========================================',
            `DARK STORE : ${order.warehouse.name.toUpperCase()}`,
            `DATE/TIME  : ${new Date(order.createdAt).toLocaleString()}`,
            `ORDER NO.  : #${order.orderNumber}`,
            `STATUS     : ${order.orderStatus}`,
            '------------------------------------------',
            'CUSTOMER DETAILS:',
            `ADDRESS    : ${address.neighborhood || ''}, ${address.city || ''}`,
            `BUILDING   : ${address.building || ''} ${address.street || ''}`,
            `LANDMARK   : ${address.landmark || 'N/A'}`,
            '------------------------------------------',
            pad('ITEM', 24) + pad('QTY', 6, true) + pad('TOTAL IQD', 12, true),
            '------------------------------------------',
        ];
        for (const item of order.items) {
            const title = item.product.titleEn;
            const truncatedTitle = title.length > 23 ? title.slice(0, 21) + '..' : title;
            lines.push(pad(truncatedTitle, 24) +
                pad(item.quantity.toString(), 6, true) +
                pad(`IQD ${item.totalIqd.toLocaleString()}`, 12, true));
        }
        lines.push('------------------------------------------');
        lines.push(pad('SUBTOTAL', 24) + pad(`IQD ${order.subtotalIqd.toLocaleString()}`, 18, true));
        if (order.discountTotalIqd > 0) {
            lines.push(pad('DISCOUNT SAVINGS', 24) + pad(`- IQD ${order.discountTotalIqd.toLocaleString()}`, 18, true));
        }
        lines.push(pad('DELIVERY FEE', 24) + pad(order.deliveryFeeIqd === 0 ? 'FREE PROMO' : `IQD ${order.deliveryFeeIqd.toLocaleString()}`, 18, true));
        lines.push('==========================================');
        lines.push(pad('TOTAL DUE (IQD)', 24) + pad(`IQD ${order.totalIqd.toLocaleString()}`, 18, true));
        lines.push('==========================================');
        lines.push(`PAYMENT METHOD : ${order.paymentMethod === 'COD' ? 'CASH ON DELIVERY (COD)' : order.paymentMethod}`);
        lines.push(`PAYMENT STATUS : ${order.paymentStatus}`);
        lines.push(`ASSIGNED RIDER : ${order.assignedDriverName || 'Fleet Dispatch'}`);
        lines.push('==========================================');
        lines.push('       Thank you for shopping with BazMart!  ');
        lines.push('       Rapid Dark Store Delivery in 15 Mins   ');
        lines.push('==========================================');
        return {
            orderId: order.id,
            orderNumber: order.orderNumber,
            totalIqd: order.totalIqd,
            paymentMethod: order.paymentMethod,
            asciiReceipt: lines.join('\n'),
            rawOrder: order,
        };
    }
    async getCatalog(query) {
        const where = {};
        if (query.categoryId) {
            where.categoryId = query.categoryId;
        }
        if (query.brandId) {
            where.brandId = query.brandId;
        }
        if (query.search) {
            where.OR = [
                { titleEn: { contains: query.search } },
                { titleCkb: { contains: query.search } },
                { titleAr: { contains: query.search } },
                { externalErpId: { contains: query.search } },
                { barcode: { contains: query.search } },
            ];
        }
        return this.prisma.product.findMany({
            where,
            include: {
                category: true,
                brand: true,
                countryOrigin: true,
                stocks: {
                    include: { warehouse: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateProduct(id, data) {
        const { stocks, ...productData } = data;
        const product = await this.prisma.product.update({
            where: { id },
            data: {
                ...productData,
                lastSyncedAt: new Date(),
            },
            include: {
                category: true,
                brand: true,
                countryOrigin: true,
                stocks: { include: { warehouse: true } },
            },
        });
        if (stocks && Array.isArray(stocks)) {
            for (const s of stocks) {
                if (s.warehouseId && s.stockQuantity !== undefined) {
                    await this.prisma.warehouseStock.upsert({
                        where: {
                            warehouseId_productId: {
                                warehouseId: s.warehouseId,
                                productId: id,
                            },
                        },
                        update: { stockQuantity: s.stockQuantity },
                        create: {
                            warehouseId: s.warehouseId,
                            productId: id,
                            stockQuantity: s.stockQuantity,
                        },
                    });
                }
            }
        }
        return product;
    }
    async updateProductDiscount(id, data) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) {
            throw new common_1.NotFoundException(`Product "${id}" not found.`);
        }
        let discountPercentage = data.discountPercentage;
        let discountedPriceIqd = data.discountedPriceIqd;
        if (discountPercentage !== undefined && discountPercentage > 0) {
            discountedPriceIqd = Math.round(product.originalPriceIqd * (1 - discountPercentage / 100));
        }
        else if (discountedPriceIqd !== undefined && discountedPriceIqd > 0) {
            discountPercentage = Math.round(((product.originalPriceIqd - discountedPriceIqd) / product.originalPriceIqd) * 100);
        }
        else {
            discountPercentage = null;
            discountedPriceIqd = null;
        }
        return this.prisma.product.update({
            where: { id },
            data: {
                discountPercentage,
                discountedPriceIqd,
                lastSyncedAt: new Date(),
            },
            include: {
                category: true,
                brand: true,
                countryOrigin: true,
                stocks: true,
            },
        });
    }
    async getCampaigns() {
        return this.prisma.campaignBanner.findMany({
            orderBy: { sortOrder: 'asc' },
        });
    }
    async createCampaign(data) {
        return this.prisma.campaignBanner.create({
            data: {
                type: data.type || 'VERTICAL_PROMO_CARD',
                titleEn: data.titleEn,
                titleCkb: data.titleCkb || data.titleEn,
                titleAr: data.titleAr || data.titleEn,
                subtitle: data.subtitle,
                badgeText: data.badgeText,
                bgColorHex: data.bgColorHex,
                imageUrl: data.imageUrl,
                linkedCategoryId: data.linkedCategoryId,
                linkedBrandId: data.linkedBrandId,
                sortOrder: data.sortOrder || 0,
            },
        });
    }
    async updateCampaign(id, data) {
        return this.prisma.campaignBanner.update({
            where: { id },
            data,
        });
    }
    async deleteCampaign(id) {
        return this.prisma.campaignBanner.delete({ where: { id } });
    }
    async getWarehouses() {
        const warehouses = await this.prisma.warehouse.findMany({
            include: {
                stocks: true,
                drivers: true,
                orders: {
                    where: {
                        orderStatus: { in: ['PLACED', 'PACKING_IN_DARKSTORE', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'] },
                    },
                },
            },
        });
        return warehouses.map(w => ({
            id: w.id,
            name: w.name,
            city: w.city,
            latitude: w.latitude,
            longitude: w.longitude,
            deliveryRadiusKm: w.deliveryRadiusKm,
            minOrderIqd: w.minOrderIqd,
            deliveryFeeIqd: w.deliveryFeeIqd,
            isActive: w.isActive,
            activeOrdersCount: w.orders.length,
            assignedDriversCount: w.drivers.length,
            inventorySkusCount: w.stocks.length,
        }));
    }
    async updateWarehouse(id, data) {
        return this.prisma.warehouse.update({
            where: { id },
            data,
        });
    }
    async getPaymentSettings() {
        return this.paymentsService.getPaymentConfigs();
    }
    async updatePaymentSetting(id, data) {
        return this.paymentsService.togglePaymentConfig(id, data.isEnabled, data.credentials);
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        payments_service_1.PaymentsService])
], AdminService);
//# sourceMappingURL=admin.service.js.map