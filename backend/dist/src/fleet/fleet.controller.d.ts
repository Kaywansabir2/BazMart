import { FleetService } from './fleet.service';
export declare class FleetController {
    private readonly fleetService;
    constructor(fleetService: FleetService);
    getAllDrivers(warehouseId?: string): Promise<{
        success: boolean;
        data: {
            id: string;
            fullName: string;
            phone: string;
            vehicleType: string;
            plateNumber: string;
            warehouseId: string;
            warehouseName: string;
            warehouseCity: string;
            status: string;
            cashInHandIqd: number;
            activeOrder: {
                id: string;
                orderNumber: string;
                totalIqd: number;
                paymentMethod: string;
                orderStatus: string;
                estimatedDeliveryMinutes: string;
            };
            createdAt: Date;
        }[];
    }>;
    getDriverById(id: string): Promise<{
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
            assignedOrders: ({
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
            })[];
        } & {
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
    }>;
    createDriver(body: any): Promise<{
        success: boolean;
        data: {
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
    }>;
    updateDriver(id: string, body: any): Promise<{
        success: boolean;
        data: {
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
    }>;
    assignOrder(orderId: string, driverId: string): Promise<{
        success: boolean;
        data: {
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
    updateDeliveryStatus(orderId: string, status: string, driverId?: string): Promise<{
        success: boolean;
        data: {
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
    settleDriverCash(driverId: string): Promise<{
        success: boolean;
        data: {
            success: boolean;
            driverId: string;
            driverName: string;
            settledAmountIqd: number;
            remainingCashInHandIqd: number;
            settledAt: string;
            receiptNumber: string;
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
        };
    }>;
    getDriverOrders(driverId: string): Promise<{
        success: boolean;
        data: ({
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
        })[];
    }>;
}
