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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const payments_service_1 = require("../payments/payments.service");
const erp_sync_service_1 = require("../erp-sync/erp-sync.service");
let OrdersService = class OrdersService {
    constructor(prisma, paymentsService, erpSyncService) {
        this.prisma = prisma;
        this.paymentsService = paymentsService;
        this.erpSyncService = erpSyncService;
    }
    async createOrder(dto) {
        if (!dto.items || dto.items.length === 0) {
            throw new common_1.BadRequestException('Order must contain at least one item.');
        }
        let warehouseId = dto.warehouseId;
        if (!warehouseId) {
            const defaultWarehouse = await this.prisma.warehouse.findFirst({
                where: { isActive: true },
            });
            warehouseId = defaultWarehouse ? defaultWarehouse.id : 'erbil-central-darkstore';
        }
        const productIds = dto.items.map(i => i.productId);
        const products = await this.prisma.product.findMany({
            where: { id: { in: productIds } },
            include: {
                stocks: {
                    where: { warehouseId },
                },
            },
        });
        if (products.length !== productIds.length) {
            throw new common_1.BadRequestException('One or more products in cart do not exist in catalog.');
        }
        let subtotalIqd = 0;
        let discountTotalIqd = 0;
        const orderItemsData = [];
        for (const itemDto of dto.items) {
            const product = products.find(p => p.id === itemDto.productId);
            const unitPrice = product.discountedPriceIqd ?? product.originalPriceIqd;
            const itemSubtotal = unitPrice * itemDto.quantity;
            subtotalIqd += itemSubtotal;
            if (product.discountedPriceIqd && product.originalPriceIqd > product.discountedPriceIqd) {
                discountTotalIqd += (product.originalPriceIqd - product.discountedPriceIqd) * itemDto.quantity;
            }
            const stockRec = product.stocks[0];
            const available = stockRec ? (stockRec.stockQuantity - stockRec.reservedQuantity) : 50;
            if (itemDto.quantity > available) {
                throw new common_1.BadRequestException(`Only ${available} units available in Erbil Central Dark Store for "${product.titleEn}".`);
            }
            orderItemsData.push({
                productId: product.id,
                quantity: itemDto.quantity,
                unitPriceIqd: unitPrice,
                totalIqd: itemSubtotal,
                productSnapshot: JSON.stringify({
                    titleEn: product.titleEn,
                    titleCkb: product.titleCkb,
                    titleAr: product.titleAr,
                    unitText: product.unitText,
                    imageUrl: product.imageUrl,
                }),
            });
        }
        const minOrderIqd = 7000;
        if (subtotalIqd < minOrderIqd) {
            throw new common_1.BadRequestException(`Order subtotal (IQD ${subtotalIqd}) does not meet the minimum order requirement of IQD ${minOrderIqd}.`);
        }
        const deliveryFeeIqd = 0;
        const totalIqd = subtotalIqd + deliveryFeeIqd;
        const orderNumber = `BM-${Math.floor(10000 + Math.random() * 90000)}`;
        const paymentResult = await this.paymentsService.processPayment(dto.paymentMethod || 'COD', {
            orderNumber,
            totalIqd,
            customerPhone: dto.customerPhone,
        });
        const order = await this.prisma.$transaction(async (tx) => {
            let customerId = dto.customerId;
            if (!customerId && dto.customerPhone) {
                const customer = await tx.customer.upsert({
                    where: { phone: dto.customerPhone },
                    create: {
                        phone: dto.customerPhone,
                        name: dto.customerName || 'BazMart Customer',
                    },
                    update: {},
                });
                customerId = customer.id;
            }
            for (const itemDto of dto.items) {
                await tx.warehouseStock.updateMany({
                    where: {
                        warehouseId,
                        productId: itemDto.productId,
                    },
                    data: {
                        stockQuantity: {
                            decrement: itemDto.quantity,
                        },
                    },
                });
            }
            return tx.order.create({
                data: {
                    orderNumber,
                    customerId,
                    warehouseId,
                    addressSnapshot: JSON.stringify(dto.address),
                    subtotalIqd,
                    discountTotalIqd,
                    deliveryFeeIqd,
                    totalIqd,
                    paymentMethod: dto.paymentMethod || 'COD',
                    paymentStatus: paymentResult.paymentStatus,
                    orderStatus: 'PLACED',
                    assignedDriverName: 'Karwan Ahmed',
                    assignedDriverPhone: '+964 750 491 8822',
                    estimatedDeliveryMinutes: '15 - 20 mins',
                    items: {
                        create: orderItemsData,
                    },
                },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
            });
        });
        this.erpSyncService.pushCompletedOrderToErp(order).catch(() => { });
        return {
            order,
            payment: paymentResult,
        };
    }
    async getOrder(idOrNumber) {
        const order = await this.prisma.order.findFirst({
            where: {
                OR: [
                    { id: idOrNumber },
                    { orderNumber: idOrNumber },
                ],
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                warehouse: true,
            },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order "${idOrNumber}" not found.`);
        }
        return order;
    }
    async updateOrderStatus(orderId, status) {
        return this.prisma.order.update({
            where: { id: orderId },
            data: { orderStatus: status },
        });
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        payments_service_1.PaymentsService,
        erp_sync_service_1.ErpSyncService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map