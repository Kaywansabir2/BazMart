import {
  AnalyticsOverview,
  Order,
  Product,
  Driver,
  Warehouse,
  PaymentConfig,
  CampaignBanner,
  Coupon,
  SupplierItem,
  PurchaseOrderRow,
  InventoryBatchItem,
  SupplyChainOverview,
} from './types';

const API_BASE = 'http://localhost:4001/api/v1';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error [${res.status}]: ${errorText}`);
  }

  const json = await res.json();
  return json.data as T;
}

export const api = {
  // Analytics
  getAnalytics: (warehouseId?: string) =>
    fetchJson<AnalyticsOverview>(`/admin/analytics/overview${warehouseId ? `?warehouseId=${warehouseId}` : ''}`),

  // Orders & Dispatch
  getOrders: (params?: { status?: string; warehouseId?: string; paymentMethod?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.warehouseId) searchParams.set('warehouseId', params.warehouseId);
    if (params?.paymentMethod) searchParams.set('paymentMethod', params.paymentMethod);
    if (params?.search) searchParams.set('search', params.search);
    const query = searchParams.toString();
    return fetchJson<Order[]>(`/admin/orders${query ? `?${query}` : ''}`);
  },

  getOrderById: (id: string) => fetchJson<Order>(`/admin/orders/${id}`),

  updateOrderStatus: (id: string, status: string) =>
    fetchJson<Order>(`/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  markOrderPacking: (id: string, packedItemIds: string[], isComplete: boolean) =>
    fetchJson<Order>(`/admin/orders/${id}/packing`, {
      method: 'PATCH',
      body: JSON.stringify({ packedItemIds, isComplete }),
    }),

  getThermalReceipt: (id: string) =>
    fetchJson<{ orderId: string; orderNumber: string; totalIqd: number; paymentMethod: string; asciiReceipt: string }>(
      `/admin/orders/${id}/receipt`,
    ),

  // Catalog
  getCatalog: (params?: { search?: string; categoryId?: string; brandId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.categoryId) searchParams.set('categoryId', params.categoryId);
    if (params?.brandId) searchParams.set('brandId', params.brandId);
    const query = searchParams.toString();
    return fetchJson<Product[]>(`/admin/catalog${query ? `?${query}` : ''}`);
  },

  updateProduct: (id: string, data: any) =>
    fetchJson<Product>(`/admin/catalog/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateProductDiscount: (id: string, data: { discountPercentage?: number; discountedPriceIqd?: number }) =>
    fetchJson<Product>(`/admin/catalog/${id}/discount`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // ERP Sync
  triggerErpSync: () =>
    fetchJson<{ message: string; scannedSkusCount: number; timestamp: string }>('/erp/sync/trigger', {
      method: 'POST',
    }),

  simulateErpWebhook: (payload: { externalErpId: string; stockUpdates?: Array<{ warehouseId: string; stockQuantity: number }>; newOriginalPriceIqd?: number; newDiscountedPriceIqd?: number }) =>
    fetchJson<any>('/erp/webhook/stock-update', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Fleet & In-House Drivers
  getDrivers: (warehouseId?: string) =>
    fetchJson<Driver[]>(`/fleet/drivers${warehouseId ? `?warehouseId=${warehouseId}` : ''}`),

  getDriverById: (id: string) => fetchJson<Driver>(`/fleet/drivers/${id}`),

  createDriver: (data: any) =>
    fetchJson<Driver>('/fleet/drivers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateDriver: (id: string, data: any) =>
    fetchJson<Driver>(`/fleet/drivers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  assignOrderToDriver: (orderId: string, driverId: string) =>
    fetchJson<Order>(`/fleet/orders/${orderId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ driverId }),
    }),

  updateDeliveryStatus: (orderId: string, status: string, driverId?: string) =>
    fetchJson<Order>(`/fleet/orders/${orderId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, driverId }),
    }),

  settleDriverCash: (driverId: string) =>
    fetchJson<{
      success: boolean;
      driverId: string;
      driverName: string;
      settledAmountIqd: number;
      settledAt: string;
      receiptNumber: string;
    }>(`/fleet/drivers/${driverId}/settle-cash`, {
      method: 'POST',
    }),

  getDriverOrders: (driverId: string) =>
    fetchJson<Order[]>(`/fleet/drivers/${driverId}/orders`),

  // Campaigns & Banners
  getCampaigns: () => fetchJson<CampaignBanner[]>('/admin/campaigns'),

  createCampaign: (data: any) =>
    fetchJson<CampaignBanner>('/admin/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCampaign: (id: string, data: any) =>
    fetchJson<CampaignBanner>(`/admin/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteCampaign: (id: string) =>
    fetchJson<any>(`/admin/campaigns/${id}`, {
      method: 'DELETE',
    }),

  // Warehouses
  getWarehouses: () => fetchJson<Warehouse[]>('/admin/warehouses'),

  updateWarehouse: (id: string, data: any) =>
    fetchJson<Warehouse>(`/admin/warehouses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Payment Gateways & Settings
  getPaymentSettings: () => fetchJson<PaymentConfig[]>('/admin/settings/payments'),

  updatePaymentSetting: (id: string, isEnabled: boolean, credentials?: string) =>
    fetchJson<PaymentConfig>(`/admin/settings/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ isEnabled, credentials }),
    }),

  // Coupons & Vouchers
  getCoupons: () => fetchJson<Coupon[]>('/coupons/admin/all'),

  createCoupon: (data: any) =>
    fetchJson<Coupon>('/coupons/admin/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  toggleCoupon: (id: string) =>
    fetchJson<Coupon>(`/coupons/admin/${id}/toggle`, {
      method: 'PATCH',
    }),

  // Customers CRM
  getCustomers: () => fetchJson<any[]>('/admin/customers'),

  // Ratings & Reviews
  getRatings: () => fetchJson<any>('/admin/ratings'),

  // Broadcast Notifications
  broadcastNotification: (payload: {
    titleEn: string;
    titleCkb?: string;
    titleAr?: string;
    bodyEn: string;
    bodyCkb?: string;
    bodyAr?: string;
    type?: string;
  }) =>
    fetchJson<any>('/admin/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Supply Chain & FEFO Expiry Radar
  getSupplyChainOverview: (warehouseId?: string) =>
    fetchJson<SupplyChainOverview>(`/admin/supply-chain/overview${warehouseId ? `?warehouseId=${warehouseId}` : ''}`),

  getBatches: (params?: { warehouseId?: string; urgency?: string; search?: string }) => {
    const sp = new URLSearchParams();
    if (params?.warehouseId) sp.set('warehouseId', params.warehouseId);
    if (params?.urgency) sp.set('urgency', params.urgency);
    if (params?.search) sp.set('search', params.search);
    const q = sp.toString();
    return fetchJson<InventoryBatchItem[]>(`/admin/supply-chain/batches${q ? `?${q}` : ''}`);
  },

  getPurchaseOrders: (warehouseId?: string) =>
    fetchJson<PurchaseOrderRow[]>(`/admin/supply-chain/purchase-orders${warehouseId ? `?warehouseId=${warehouseId}` : ''}`),

  createPurchaseOrder: (data: any) =>
    fetchJson<{ purchaseOrder: any }>('/admin/supply-chain/purchase-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  receivePurchaseOrder: (id: string) =>
    fetchJson<any>(`/admin/supply-chain/purchase-orders/${id}/receive`, {
      method: 'POST',
    }),

  applyClearanceDiscount: (batchId: number) =>
    fetchJson<any>(`/admin/supply-chain/batches/${batchId}/apply-clearance-discount`, {
      method: 'POST',
    }),

  quarantineBatch: (batchId: number, reason?: string) =>
    fetchJson<any>(`/admin/supply-chain/batches/${batchId}/quarantine-writeoff`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  getSuppliers: () =>
    fetchJson<SupplierItem[]>('/admin/supply-chain/suppliers'),

  // Step 15 Operational Parity
  substituteOrRemoveOrderItem: (orderId: string, orderItemId: string, data: { action: 'REMOVE_AND_REFUND' | 'REPLACE_BEST_MATCH'; replacementProductId?: string; reason?: string }) =>
    fetchJson<any>(`/admin/orders/${orderId}/items/${orderItemId}/substitute-or-remove`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAuditLogs: (limit = 50) =>
    fetchJson<any[]>(`/admin/audit-logs?limit=${limit}`),

  getDailyZReport: (warehouseId?: string) =>
    fetchJson<any>(`/admin/finance/daily-z-report${warehouseId ? `?warehouseId=${warehouseId}` : ''}`),

  updateStoreOperatingStatus: (warehouseId: string, status: string) =>
    fetchJson<any>('/admin/store/operating-status', {
      method: 'PUT',
      body: JSON.stringify({ warehouseId, status }),
    }),

  getSupermarketSettlements: () =>
    fetchJson<any>('/admin/finance/supermarket-settlements'),

  // Step 18 & 19 In-Store Picker, Partner Supermarket & Scale Barcode Operations
  pickOrderItem: (orderId: string, data: { itemId?: string; barcode?: string; isPicked?: boolean }) =>
    fetchJson<any>(`/admin/orders/${orderId}/pick-item`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  completeOrderPicking: (orderId: string) =>
    fetchJson<any>(`/admin/orders/${orderId}/complete-picking`, {
      method: 'POST',
    }),

  getPartnerPortalSummary: (warehouseId?: string) =>
    fetchJson<any>(`/admin/partner-portal/summary${warehouseId ? `?warehouseId=${warehouseId}` : ''}`),

  getPartnerPortalOrders: (warehouseId?: string) =>
    fetchJson<any>(`/admin/partner-portal/orders${warehouseId ? `?warehouseId=${warehouseId}` : ''}`),

  generatePartnerSettlement: (data: { warehouseId: string; amountIqd: number; periodDate: string; ordersCount?: number }) =>
    fetchJson<any>('/admin/partner-portal/generate-settlement', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  parseScaleBarcode: (barcode: string) =>
    fetchJson<any>('/catalog/parse-scale-barcode', {
      method: 'POST',
      body: JSON.stringify({ barcode }),
    }),

  processPartialReturn: (orderId: string, data: { orderItemId?: number | string; productId?: string; returnedQuantity: number; reason?: string }) =>
    fetchJson<any>(`/fleet/orders/${orderId}/partial-return`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  testPosConnection: (data: any) =>
    fetchJson<any>('/admin/erp/test-connection', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

