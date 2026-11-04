import { OrdersService, CreateOrderDto } from './orders.service';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(dto: CreateOrderDto): Promise<{
        success: boolean;
        message: string;
        data: {
            order: {
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
            payment: import("../payments/payment-gateway.interface").PaymentProcessResult;
        };
    }>;
    getOrder(id: string): Promise<{
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
    updateStatus(id: string, status: string): Promise<{
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
}
