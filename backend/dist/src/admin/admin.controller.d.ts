import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getAnalyticsOverview(warehouseId?: string): Promise<{
        success: boolean;
        data: {
            gmvTodayIqd: number;
            totalOrders: number;
            avgBasketIqd: number;
            activeRiders: number;
            totalRiders: number;
            ordersPackedUnder3MinsPercent: number;
            avgDeliveryTimeMinutes: number;
            pendingCodCashInFieldIqd: number;
            lowStockAlertsCount: number;
            lowStockAlerts: {
                id: string;
                productId: string;
                productTitle: string;
                barcode: string;
                warehouseName: string;
                availableStock: number;
            }[];
            ordersByStatus: {
                PLACED: number;
                PACKING_IN_DARKSTORE: number;
                READY_FOR_PICKUP: number;
                OUT_FOR_DELIVERY: number;
                DELIVERED: number;
                CANCELLED: number;
            };
            erpSyncHealth: {
                status: string;
                lastSyncedAt: string;
                syncedSkusCount: number;
            };
            topSellingProducts: {
                product: any;
                unitsSold: number;
                revenueIqd: number;
            }[];
            recentOrders: {
                id: string;
                orderNumber: string;
                warehouseId: string;
                orderStatus: string;
                paymentMethod: string;
                totalIqd: number;
                assignedDriverName: string;
                itemsCount: number;
                createdAt: Date;
            }[];
        };
    }>;
    getOrders(status?: string, warehouseId?: string, paymentMethod?: string, search?: string): Promise<{
        success: boolean;
        data: {
            id: string;
            orderNumber: string;
            warehouseId: string;
            warehouseName: string;
            warehouseCity: string;
            orderStatus: string;
            paymentMethod: string;
            paymentStatus: string;
            subtotalIqd: number;
            discountTotalIqd: number;
            deliveryFeeIqd: number;
            totalIqd: number;
            isPacked: boolean;
            packedItemIds: string[];
            driverId: string;
            assignedDriverName: string;
            assignedDriverPhone: string;
            estimatedDeliveryMinutes: string;
            customerAddress: any;
            items: {
                id: string;
                productId: string;
                titleEn: string;
                titleCkb: string;
                titleAr: string;
                barcode: string;
                storageTemp: string;
                quantity: number;
                unitPriceIqd: number;
                totalIqd: number;
                imageUrl: string;
                isPacked: boolean;
            }[];
            createdAt: Date;
            updatedAt: Date;
        }[];
    }>;
    getOrderById(id: string): Promise<{
        success: boolean;
        data: {
            customerAddress: any;
            warehouse: {
                id: string;
                name: string;
                city: string;
                latitude: number;
                longitude: number;
                deliveryRadiusKm: number;
                minOrderIqd: number;
                deliveryFeeIqd: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
            driver: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                warehouseId: string;
                phone: string;
                fullName: string;
                vehicleType: string;
                plateNumber: string;
                status: string;
                cashInHandIqd: number;
            };
            items: ({
                product: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    imageUrl: string | null;
                    countryOriginId: string | null;
                    discountedPriceIqd: number | null;
                    isFreshPick: boolean;
                    isTopSaver: boolean;
                    storageTemp: string | null;
                    isBestSeller: boolean;
                    brandId: string | null;
                    externalErpId: string;
                    barcode: string | null;
                    titleEn: string;
                    titleCkb: string;
                    titleAr: string;
                    categoryId: string | null;
                    unitText: string;
                    originalPriceIqd: number;
                    discountPercentage: number | null;
                    descriptionEn: string | null;
                    descriptionCkb: string | null;
                    descriptionAr: string | null;
                    lastSyncedAt: Date;
                };
            } & {
                id: string;
                productId: string;
                totalIqd: number;
                isPacked: boolean;
                quantity: number;
                unitPriceIqd: number;
                productSnapshot: string | null;
                orderId: string;
            })[];
            id: string;
            deliveryFeeIqd: number;
            createdAt: Date;
            updatedAt: Date;
            warehouseId: string;
            driverId: string | null;
            orderNumber: string;
            addressSnapshot: string;
            subtotalIqd: number;
            discountTotalIqd: number;
            totalIqd: number;
            paymentMethod: string;
            paymentStatus: string;
            orderStatus: string;
            assignedDriverName: string | null;
            assignedDriverPhone: string | null;
            estimatedDeliveryMinutes: string;
            isPacked: boolean;
            customerId: string | null;
            packedItems: string | null;
            pickedUpAt: Date | null;
            deliveredAt: Date | null;
        };
    }>;
    updateOrderStatus(id: string, status: string): Promise<{
        success: boolean;
        data: {
            warehouse: {
                id: string;
                name: string;
                city: string;
                latitude: number;
                longitude: number;
                deliveryRadiusKm: number;
                minOrderIqd: number;
                deliveryFeeIqd: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
            driver: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                warehouseId: string;
                phone: string;
                fullName: string;
                vehicleType: string;
                plateNumber: string;
                status: string;
                cashInHandIqd: number;
            };
            items: ({
                product: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    imageUrl: string | null;
                    countryOriginId: string | null;
                    discountedPriceIqd: number | null;
                    isFreshPick: boolean;
                    isTopSaver: boolean;
                    storageTemp: string | null;
                    isBestSeller: boolean;
                    brandId: string | null;
                    externalErpId: string;
                    barcode: string | null;
                    titleEn: string;
                    titleCkb: string;
                    titleAr: string;
                    categoryId: string | null;
                    unitText: string;
                    originalPriceIqd: number;
                    discountPercentage: number | null;
                    descriptionEn: string | null;
                    descriptionCkb: string | null;
                    descriptionAr: string | null;
                    lastSyncedAt: Date;
                };
            } & {
                id: string;
                productId: string;
                totalIqd: number;
                isPacked: boolean;
                quantity: number;
                unitPriceIqd: number;
                productSnapshot: string | null;
                orderId: string;
            })[];
        } & {
            id: string;
            deliveryFeeIqd: number;
            createdAt: Date;
            updatedAt: Date;
            warehouseId: string;
            driverId: string | null;
            orderNumber: string;
            addressSnapshot: string;
            subtotalIqd: number;
            discountTotalIqd: number;
            totalIqd: number;
            paymentMethod: string;
            paymentStatus: string;
            orderStatus: string;
            assignedDriverName: string | null;
            assignedDriverPhone: string | null;
            estimatedDeliveryMinutes: string;
            isPacked: boolean;
            customerId: string | null;
            packedItems: string | null;
            pickedUpAt: Date | null;
            deliveredAt: Date | null;
        };
    }>;
    markOrderPacking(id: string, packedItemIds: string[], isComplete: boolean): Promise<{
        success: boolean;
        data: {
            warehouse: {
                id: string;
                name: string;
                city: string;
                latitude: number;
                longitude: number;
                deliveryRadiusKm: number;
                minOrderIqd: number;
                deliveryFeeIqd: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
            driver: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                warehouseId: string;
                phone: string;
                fullName: string;
                vehicleType: string;
                plateNumber: string;
                status: string;
                cashInHandIqd: number;
            };
            items: ({
                product: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    imageUrl: string | null;
                    countryOriginId: string | null;
                    discountedPriceIqd: number | null;
                    isFreshPick: boolean;
                    isTopSaver: boolean;
                    storageTemp: string | null;
                    isBestSeller: boolean;
                    brandId: string | null;
                    externalErpId: string;
                    barcode: string | null;
                    titleEn: string;
                    titleCkb: string;
                    titleAr: string;
                    categoryId: string | null;
                    unitText: string;
                    originalPriceIqd: number;
                    discountPercentage: number | null;
                    descriptionEn: string | null;
                    descriptionCkb: string | null;
                    descriptionAr: string | null;
                    lastSyncedAt: Date;
                };
            } & {
                id: string;
                productId: string;
                totalIqd: number;
                isPacked: boolean;
                quantity: number;
                unitPriceIqd: number;
                productSnapshot: string | null;
                orderId: string;
            })[];
        } & {
            id: string;
            deliveryFeeIqd: number;
            createdAt: Date;
            updatedAt: Date;
            warehouseId: string;
            driverId: string | null;
            orderNumber: string;
            addressSnapshot: string;
            subtotalIqd: number;
            discountTotalIqd: number;
            totalIqd: number;
            paymentMethod: string;
            paymentStatus: string;
            orderStatus: string;
            assignedDriverName: string | null;
            assignedDriverPhone: string | null;
            estimatedDeliveryMinutes: string;
            isPacked: boolean;
            customerId: string | null;
            packedItems: string | null;
            pickedUpAt: Date | null;
            deliveredAt: Date | null;
        };
    }>;
    generateThermalReceipt(id: string): Promise<{
        success: boolean;
        data: {
            orderId: string;
            orderNumber: string;
            totalIqd: number;
            paymentMethod: string;
            asciiReceipt: string;
            rawOrder: {
                warehouse: {
                    id: string;
                    name: string;
                    city: string;
                    latitude: number;
                    longitude: number;
                    deliveryRadiusKm: number;
                    minOrderIqd: number;
                    deliveryFeeIqd: number;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                };
                driver: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    warehouseId: string;
                    phone: string;
                    fullName: string;
                    vehicleType: string;
                    plateNumber: string;
                    status: string;
                    cashInHandIqd: number;
                };
                items: ({
                    product: {
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
                        imageUrl: string | null;
                        countryOriginId: string | null;
                        discountedPriceIqd: number | null;
                        isFreshPick: boolean;
                        isTopSaver: boolean;
                        storageTemp: string | null;
                        isBestSeller: boolean;
                        brandId: string | null;
                        externalErpId: string;
                        barcode: string | null;
                        titleEn: string;
                        titleCkb: string;
                        titleAr: string;
                        categoryId: string | null;
                        unitText: string;
                        originalPriceIqd: number;
                        discountPercentage: number | null;
                        descriptionEn: string | null;
                        descriptionCkb: string | null;
                        descriptionAr: string | null;
                        lastSyncedAt: Date;
                    };
                } & {
                    id: string;
                    productId: string;
                    totalIqd: number;
                    isPacked: boolean;
                    quantity: number;
                    unitPriceIqd: number;
                    productSnapshot: string | null;
                    orderId: string;
                })[];
            } & {
                id: string;
                deliveryFeeIqd: number;
                createdAt: Date;
                updatedAt: Date;
                warehouseId: string;
                driverId: string | null;
                orderNumber: string;
                addressSnapshot: string;
                subtotalIqd: number;
                discountTotalIqd: number;
                totalIqd: number;
                paymentMethod: string;
                paymentStatus: string;
                orderStatus: string;
                assignedDriverName: string | null;
                assignedDriverPhone: string | null;
                estimatedDeliveryMinutes: string;
                isPacked: boolean;
                customerId: string | null;
                packedItems: string | null;
                pickedUpAt: Date | null;
                deliveredAt: Date | null;
            };
        };
    }>;
    getCatalog(search?: string, categoryId?: string, brandId?: string): Promise<{
        success: boolean;
        data: ({
            stocks: ({
                warehouse: {
                    id: string;
                    name: string;
                    city: string;
                    latitude: number;
                    longitude: number;
                    deliveryRadiusKm: number;
                    minOrderIqd: number;
                    deliveryFeeIqd: number;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                };
            } & {
                id: string;
                updatedAt: Date;
                stockQuantity: number;
                warehouseId: string;
                productId: string;
                reservedQuantity: number;
            })[];
            category: {
                id: string;
                createdAt: Date;
                slug: string;
                nameEn: string;
                nameCkb: string;
                nameAr: string;
                imageUrl: string | null;
                sortOrder: number;
                parentId: string | null;
            };
            brand: {
                id: string;
                name: string;
                createdAt: Date;
                sortOrder: number;
                logoUrl: string | null;
                bgColorHex: string | null;
            };
            countryOrigin: {
                id: string;
                createdAt: Date;
                nameEn: string;
                nameCkb: string;
                nameAr: string;
                code: string;
                flagAsset: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            imageUrl: string | null;
            countryOriginId: string | null;
            discountedPriceIqd: number | null;
            isFreshPick: boolean;
            isTopSaver: boolean;
            storageTemp: string | null;
            isBestSeller: boolean;
            brandId: string | null;
            externalErpId: string;
            barcode: string | null;
            titleEn: string;
            titleCkb: string;
            titleAr: string;
            categoryId: string | null;
            unitText: string;
            originalPriceIqd: number;
            discountPercentage: number | null;
            descriptionEn: string | null;
            descriptionCkb: string | null;
            descriptionAr: string | null;
            lastSyncedAt: Date;
        })[];
    }>;
    updateProduct(id: string, body: any): Promise<{
        success: boolean;
        data: {
            stocks: ({
                warehouse: {
                    id: string;
                    name: string;
                    city: string;
                    latitude: number;
                    longitude: number;
                    deliveryRadiusKm: number;
                    minOrderIqd: number;
                    deliveryFeeIqd: number;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                };
            } & {
                id: string;
                updatedAt: Date;
                stockQuantity: number;
                warehouseId: string;
                productId: string;
                reservedQuantity: number;
            })[];
            category: {
                id: string;
                createdAt: Date;
                slug: string;
                nameEn: string;
                nameCkb: string;
                nameAr: string;
                imageUrl: string | null;
                sortOrder: number;
                parentId: string | null;
            };
            brand: {
                id: string;
                name: string;
                createdAt: Date;
                sortOrder: number;
                logoUrl: string | null;
                bgColorHex: string | null;
            };
            countryOrigin: {
                id: string;
                createdAt: Date;
                nameEn: string;
                nameCkb: string;
                nameAr: string;
                code: string;
                flagAsset: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            imageUrl: string | null;
            countryOriginId: string | null;
            discountedPriceIqd: number | null;
            isFreshPick: boolean;
            isTopSaver: boolean;
            storageTemp: string | null;
            isBestSeller: boolean;
            brandId: string | null;
            externalErpId: string;
            barcode: string | null;
            titleEn: string;
            titleCkb: string;
            titleAr: string;
            categoryId: string | null;
            unitText: string;
            originalPriceIqd: number;
            discountPercentage: number | null;
            descriptionEn: string | null;
            descriptionCkb: string | null;
            descriptionAr: string | null;
            lastSyncedAt: Date;
        };
    }>;
    updateProductDiscount(id: string, body: {
        discountPercentage?: number;
        discountedPriceIqd?: number;
    }): Promise<{
        success: boolean;
        data: {
            stocks: {
                id: string;
                updatedAt: Date;
                stockQuantity: number;
                warehouseId: string;
                productId: string;
                reservedQuantity: number;
            }[];
            category: {
                id: string;
                createdAt: Date;
                slug: string;
                nameEn: string;
                nameCkb: string;
                nameAr: string;
                imageUrl: string | null;
                sortOrder: number;
                parentId: string | null;
            };
            brand: {
                id: string;
                name: string;
                createdAt: Date;
                sortOrder: number;
                logoUrl: string | null;
                bgColorHex: string | null;
            };
            countryOrigin: {
                id: string;
                createdAt: Date;
                nameEn: string;
                nameCkb: string;
                nameAr: string;
                code: string;
                flagAsset: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            imageUrl: string | null;
            countryOriginId: string | null;
            discountedPriceIqd: number | null;
            isFreshPick: boolean;
            isTopSaver: boolean;
            storageTemp: string | null;
            isBestSeller: boolean;
            brandId: string | null;
            externalErpId: string;
            barcode: string | null;
            titleEn: string;
            titleCkb: string;
            titleAr: string;
            categoryId: string | null;
            unitText: string;
            originalPriceIqd: number;
            discountPercentage: number | null;
            descriptionEn: string | null;
            descriptionCkb: string | null;
            descriptionAr: string | null;
            lastSyncedAt: Date;
        };
    }>;
    getCampaigns(): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            imageUrl: string | null;
            sortOrder: number;
            bgColorHex: string | null;
            titleEn: string;
            titleCkb: string;
            titleAr: string;
            type: string;
            subtitle: string | null;
            badgeText: string | null;
            linkedCategoryId: string | null;
            linkedBrandId: string | null;
            linkedProductIds: string | null;
        }[];
    }>;
    createCampaign(body: any): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            imageUrl: string | null;
            sortOrder: number;
            bgColorHex: string | null;
            titleEn: string;
            titleCkb: string;
            titleAr: string;
            type: string;
            subtitle: string | null;
            badgeText: string | null;
            linkedCategoryId: string | null;
            linkedBrandId: string | null;
            linkedProductIds: string | null;
        };
    }>;
    updateCampaign(id: string, body: any): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            imageUrl: string | null;
            sortOrder: number;
            bgColorHex: string | null;
            titleEn: string;
            titleCkb: string;
            titleAr: string;
            type: string;
            subtitle: string | null;
            badgeText: string | null;
            linkedCategoryId: string | null;
            linkedBrandId: string | null;
            linkedProductIds: string | null;
        };
    }>;
    deleteCampaign(id: string): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            imageUrl: string | null;
            sortOrder: number;
            bgColorHex: string | null;
            titleEn: string;
            titleCkb: string;
            titleAr: string;
            type: string;
            subtitle: string | null;
            badgeText: string | null;
            linkedCategoryId: string | null;
            linkedBrandId: string | null;
            linkedProductIds: string | null;
        };
    }>;
    getWarehouses(): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            city: string;
            latitude: number;
            longitude: number;
            deliveryRadiusKm: number;
            minOrderIqd: number;
            deliveryFeeIqd: number;
            isActive: boolean;
            activeOrdersCount: number;
            assignedDriversCount: number;
            inventorySkusCount: number;
        }[];
    }>;
    updateWarehouse(id: string, body: any): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            city: string;
            latitude: number;
            longitude: number;
            deliveryRadiusKm: number;
            minOrderIqd: number;
            deliveryFeeIqd: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    getPaymentSettings(): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            updatedAt: Date;
            isEnabled: boolean;
            credentials: string | null;
        }[];
    }>;
    updatePaymentSetting(id: string, body: {
        isEnabled: boolean;
        credentials?: string;
    }): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            updatedAt: Date;
            isEnabled: boolean;
            credentials: string | null;
        };
    }>;
}
