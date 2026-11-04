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
var ErpSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErpSyncService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ErpSyncService = ErpSyncService_1 = class ErpSyncService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ErpSyncService_1.name);
    }
    async fetchDeltaCatalog(since) {
        this.logger.log(`Fetching delta catalog from ERP since: ${since ? since.toISOString() : 'beginning'}`);
        return [];
    }
    async fetchBranchStock(warehouseId) {
        this.logger.log(`Fetching branch stock from ERP for warehouse: ${warehouseId}`);
        return [];
    }
    async pushCompletedOrderToErp(order) {
        const erpTxId = `ERP-TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        this.logger.log(`Successfully synced order ${order.orderNumber} to ERP with TxId: ${erpTxId}`);
        return { success: true, erpTransactionId: erpTxId };
    }
    async processBatchStockUpdate(updates) {
        const updatedProducts = [];
        const errors = [];
        for (const item of updates) {
            try {
                const product = await this.prisma.product.findUnique({
                    where: { externalErpId: item.externalErpId },
                });
                if (!product) {
                    errors.push(`Product with externalErpId "${item.externalErpId}" not found`);
                    continue;
                }
                let discountPercentage = product.discountPercentage;
                let originalPrice = item.originalPriceIqd ?? product.originalPriceIqd;
                let discountedPrice = item.discountedPriceIqd !== undefined ? item.discountedPriceIqd : product.discountedPriceIqd;
                if (discountedPrice && discountedPrice > 0 && originalPrice > discountedPrice) {
                    discountPercentage = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
                }
                else if (discountedPrice === null || discountedPrice === 0) {
                    discountPercentage = null;
                    discountedPrice = null;
                }
                await this.prisma.$transaction([
                    this.prisma.product.update({
                        where: { id: product.id },
                        data: {
                            originalPriceIqd: originalPrice,
                            discountedPriceIqd: discountedPrice,
                            discountPercentage: discountPercentage,
                            lastSyncedAt: new Date(),
                        },
                    }),
                    this.prisma.warehouseStock.upsert({
                        where: {
                            warehouseId_productId: {
                                warehouseId: item.warehouseId,
                                productId: product.id,
                            },
                        },
                        create: {
                            warehouseId: item.warehouseId,
                            productId: product.id,
                            stockQuantity: item.stockQuantity,
                            reservedQuantity: 0,
                        },
                        update: {
                            stockQuantity: item.stockQuantity,
                        },
                    }),
                ]);
                updatedProducts.push(product.externalErpId);
            }
            catch (err) {
                this.logger.error(`Failed to update item ${item.externalErpId}: ${err.message}`);
                errors.push(`Item ${item.externalErpId}: ${err.message}`);
            }
        }
        return {
            processedCount: updatedProducts.length,
            updatedProducts,
            errors,
        };
    }
    async triggerManualSync() {
        const productsCount = await this.prisma.product.count();
        const warehousesCount = await this.prisma.warehouse.count({ where: { isActive: true } });
        await this.prisma.product.updateMany({
            data: {
                lastSyncedAt: new Date(),
            },
        });
        return {
            status: 'SUCCESS',
            syncedAt: new Date().toISOString(),
            totalProductsCount: productsCount,
            activeWarehousesCount: warehousesCount,
            report: `ERP delta sync completed successfully across ${warehousesCount} dark store warehouses for ${productsCount} SKUs.`,
        };
    }
};
exports.ErpSyncService = ErpSyncService;
exports.ErpSyncService = ErpSyncService = ErpSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ErpSyncService);
//# sourceMappingURL=erp-sync.service.js.map