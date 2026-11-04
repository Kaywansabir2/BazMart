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
  /**
   * Pull delta changes (new products, modified descriptions, price changes) from external ERP
   */
  fetchDeltaCatalog(since?: Date): Promise<ErpCatalogItem[]>;

  /**
   * Query real-time inventory levels for a specific dark store warehouse from external ERP / POS
   */
  fetchBranchStock(warehouseId: string): Promise<ErpStockDelta[]>;

  /**
   * Push a completed customer order to the ERP system for financial reconciliation & master stock decrement
   */
  pushCompletedOrderToErp(order: any): Promise<{ success: boolean; erpTransactionId: string }>;
}

