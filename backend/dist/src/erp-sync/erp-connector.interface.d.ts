export interface ErpCatalogItem {
    externalErpId: string;
    barcode?: string;
    titleEn: string;
    titleCkb: string;
    titleAr: string;
    brandName?: string;
    categorySlug?: string;
    countryCode?: string;
    unitText: string;
    storageTemp?: string;
    originalPriceIqd: number;
    discountedPriceIqd?: number;
    imageUrl?: string;
    isBestSeller?: boolean;
    isFreshPick?: boolean;
    isTopSaver?: boolean;
    stockQuantity: number;
}
export interface ErpStockDelta {
    externalErpId: string;
    warehouseId: string;
    stockQuantity: number;
    originalPriceIqd?: number;
    discountedPriceIqd?: number;
}
export interface IErpConnector {
    fetchDeltaCatalog(since?: Date): Promise<ErpCatalogItem[]>;
    fetchBranchStock(warehouseId: string): Promise<ErpStockDelta[]>;
    pushCompletedOrderToErp(order: any): Promise<{
        success: boolean;
        erpTransactionId: string;
    }>;
}
