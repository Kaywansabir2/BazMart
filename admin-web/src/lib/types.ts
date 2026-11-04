export interface Warehouse {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  deliveryRadiusKm: number;
  minOrderIqd: number;
  deliveryFeeIqd: number;
  isActive: boolean;
  activeOrdersCount?: number;
  assignedDriversCount?: number;
  inventorySkusCount?: number;
}

export interface CustomerAddress {
  title?: string;
  city: string;
  neighborhood: string;
  street?: string;
  building?: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  deliveryInstructions?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  titleEn: string;
  titleCkb: string;
  titleAr: string;
  barcode?: string;
  storageTemp?: string;
  quantity: number;
  unitPriceIqd: number;
  totalIqd: number;
  imageUrl?: string;
  isPacked?: boolean;
  unitCostPriceIqd?: number;
  totalCostPriceIqd?: number;
  unitProfitIqd?: number;
  totalProfitIqd?: number;
  marginPercentage?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  warehouseId: string;
  warehouseName?: string;
  warehouseCity?: string;
  warehouse?: { name: string; city: string };
  orderStatus: 'PLACED' | 'PACKING_IN_DARKSTORE' | 'READY_FOR_PICKUP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  paymentMethod: 'COD' | 'FASTPAY' | 'ZAINCASH' | 'FIB' | 'CARD';
  paymentStatus: 'PENDING_COD' | 'PAID' | 'FAILED';
  subtotalIqd: number;
  discountTotalIqd: number;
  couponCode?: string;
  couponDiscountIqd?: number;
  deliveryFeeIqd: number;
  totalIqd: number;
  isPacked: boolean;
  packedItemIds?: string[];
  totalCogsIqd?: number;
  grossProfitIqd?: number;
  driverPayoutIqd?: number;
  netProfitIqd?: number;
  profitMarginPercentage?: number;
  driverId?: string;
  assignedDriverName?: string;
  assignedDriverPhone?: string;
  estimatedDeliveryMinutes: string;
  addressSnapshot?: string;
  customerAddress: CustomerAddress;
  unavailableItemPreference?: 'REPLACE_WITH_BEST_MATCH' | 'CALL_ME' | 'REMOVE_AND_REFUND_ITEM' | string;
  riderTipIqd?: number;
  deliveryDropoffOptions?: { leaveAtDoor?: boolean; doNotRingBell?: boolean; buildingType?: string } | string;
  walletAmountUsedIqd?: number;
  netCodPayableIqd?: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductStock {
  id?: string;
  warehouseId: string;
  stockQuantity: number;
  reservedQuantity: number;
  warehouse?: { name: string; city: string };
}

export interface Product {
  id: string;
  externalErpId: string;
  barcode?: string;
  titleEn: string;
  titleCkb: string;
  titleAr: string;
  descriptionEn?: string;
  descriptionCkb?: string;
  descriptionAr?: string;
  unitText: string;
  storageTemp?: string;
  originalPriceIqd: number;
  discountedPriceIqd?: number | null;
  discountPercentage?: number | null;
  imageUrl?: string;
  isBestSeller: boolean;
  isFreshPick: boolean;
  isTopSaver: boolean;
  categoryId?: string;
  brandId?: string;
  countryOriginId?: string;
  category?: { id: string; nameEn: string; nameCkb: string; nameAr: string };
  brand?: { id: string; name: string };
  countryOrigin?: { id: string; code: string; nameEn: string; flagAsset?: string };
  stocks?: ProductStock[];
  lastSyncedAt?: string;
  costPriceIqd?: number;
  minMarginPercentThreshold?: number;
  supplierName?: string;
  taxOrCustomsIqd?: number;
  unitProfitIqd?: number;
  marginPercent?: number;
}

export interface Driver {
  id: string;
  fullName: string;
  phone: string;
  vehicleType: string;
  plateNumber: string;
  warehouseId: string;
  warehouseName?: string;
  warehouseCity?: string;
  status: 'AVAILABLE' | 'BUSY_DELIVERING' | 'OFFLINE';
  cashInHandIqd: number;
  averageRating?: number;
  totalRatingsCount?: number;
  activeOrder?: {
    id: string;
    orderNumber: string;
    totalIqd: number;
    paymentMethod: string;
    orderStatus: string;
    estimatedDeliveryMinutes: string;
  } | null;
  createdAt: string;
}

export interface PaymentConfig {
  id: string;
  name: string;
  isEnabled: boolean;
  credentials?: string;
  updatedAt: string;
}

export interface CampaignBanner {
  id: string;
  type: 'VERTICAL_PROMO_CARD' | 'FULL_WIDTH_BANNER' | 'SPLIT_FRESH_BANNER';
  titleEn: string;
  titleCkb: string;
  titleAr: string;
  subtitle?: string;
  badgeText?: string;
  bgColorHex?: string;
  imageUrl?: string;
  linkedCategoryId?: string;
  linkedBrandId?: string;
  sortOrder: number;
}

export interface AnalyticsOverview {
  gmvTodayIqd: number;
  totalOrders: number;
  avgBasketIqd: number;
  activeRiders: number;
  totalRiders: number;
  ordersPackedUnder3MinsPercent: number;
  avgDeliveryTimeMinutes: number;
  pendingCodCashInFieldIqd: number;
  lowStockAlertsCount: number;
  lowStockAlerts: Array<{
    id: string;
    productId: string;
    productTitle: string;
    barcode: string;
    warehouseName: string;
    availableStock: number;
  }>;
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
  topSellingProducts: Array<{
    product: Product;
    unitsSold: number;
    revenueIqd: number;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    warehouseId: string;
    orderStatus: string;
    paymentMethod: string;
    totalIqd: number;
    assignedDriverName?: string;
    itemsCount: number;
    createdAt: string;
  }>;
}

export interface Coupon {
  id: string;
  code: string;
  titleEn: string;
  titleCkb: string;
  titleAr: string;
  descriptionEn?: string;
  descriptionCkb?: string;
  descriptionAr?: string;
  discountType: 'PERCENTAGE' | 'FIXED_IQD' | 'FREE_DELIVERY';
  discountValue: number;
  maxDiscountIqd?: number | null;
  minOrderSubtotalIqd: number;
  firstOrderOnly: boolean;
  applicableCategoryIds?: string | null;
  applicableBrandIds?: string | null;
  excludeDiscountedItems: boolean;
  usageLimitGlobal?: number | null;
  usageLimitPerCustomer: number;
  currentUsageCount: number;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
  _count?: { redemptions: number };
}

export interface CustomerItem {
  id: string;
  phone: string;
  name: string;
  preferredLanguage: string;
  totalOrders: number;
  lifetimeSpendIqd: number;
  savedAddressesCount: number;
  addresses: Array<{
    id: string;
    title: string;
    city: string;
    neighborhood: string;
    street: string;
    building: string;
    landmark?: string;
    isDefault: boolean;
  }>;
  lastOrderNumber?: string | null;
  lastOrderAt?: string | null;
  createdAt: string;
}

export interface OrderRatingItem {
  id: string;
  orderId: string;
  orderNumber: string;
  totalIqd: number;
  customerName: string;
  customerPhone: string;
  driverName: string;
  driverPhone: string;
  driverVehicle: string;
  overallStoreStars: number;
  driverStars: number;
  feedbackTags: string[];
  comment?: string;
  createdAt: string;
}

export interface RatingsData {
  summary: {
    avgStoreStars: number;
    avgDriverStars: number;
    totalRatings: number;
    fiveStarSatisfactionRate: number;
    tagCounts: Record<string, number>;
  };
  ratings: OrderRatingItem[];
}

export interface SupplierItem {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  countryCode: string;
  leadTimeDays: number;
  paymentTerms: string;
  totalPurchasedIqd: number;
  isActive: boolean;
  purchaseOrdersCount?: number;
}

export interface PurchaseOrderItemRow {
  id: number;
  productId: string;
  productTitle: string;
  productSku: string;
  orderedQuantity: number;
  receivedQuantity: number;
  unitCostIqd: number;
  lineTotalCostIqd: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface PurchaseOrderRow {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  supplierCity: string;
  warehouseId: string;
  warehouseName: string;
  status: 'DRAFT' | 'SENT_TO_SUPPLIER' | 'RECEIVED_INTO_STOCK' | 'CANCELLED';
  totalCostIqd: number;
  expectedDeliveryDate: string;
  receivedAt?: string | null;
  notes?: string;
  itemsCount: number;
  items: PurchaseOrderItemRow[];
}

export interface InventoryBatchItem {
  id: number;
  batchNumber: string;
  warehouseId: string;
  warehouseName: string;
  productId: string;
  productSku: string;
  productTitle: string;
  productBarcode: string;
  categoryName: string;
  initialQuantity: number;
  remainingQuantity: number;
  unitCostIqd: number;
  totalBatchCostIqd: number;
  productionDate?: string;
  expiryDate: string;
  daysRemaining: number;
  status: 'ACTIVE' | 'NEAR_EXPIRY_PROMO' | 'EXPIRED_QUARANTINED' | 'DEPLETED';
  urgency: 'HEALTHY' | 'NEAR_EXPIRY' | 'EXPIRED';
  productDiscountPercentage?: number | null;
}

export interface SupplyChainOverview {
  activeSuppliersCount: number;
  openPurchaseOrdersCount: number;
  totalInventoryValueCostIqd: number;
  nearExpiryBatchesCount: number;
  quarantinedValueIqd: number;
}
