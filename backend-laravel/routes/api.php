<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CustomerController;
use App\Http\Controllers\Api\V1\CatalogController;
use App\Http\Controllers\Api\V1\CouponsController;
use App\Http\Controllers\Api\V1\OrdersController;
use App\Http\Controllers\Api\V1\FleetController;
use App\Http\Controllers\Api\V1\AdminController;
use App\Http\Controllers\Api\V1\AdminFinanceController;
use App\Http\Controllers\Api\V1\AdminSupplyChainController;
use App\Http\Controllers\Api\V1\AdminSupportController;
use App\Http\Controllers\Api\V1\ErpSyncController;
use App\Http\Controllers\Api\V1\NotificationsController;
use App\Http\Controllers\Api\V1\RatingsController;
use App\Http\Controllers\Api\V1\PaymentsController;
use App\Http\Controllers\Api\V1\Step18RetailOperationsController;
use App\Http\Controllers\Api\V1\Step19ScaleBarcodeAndPartialReturnController;
use App\Http\Controllers\Api\V1\Step22RetailHardeningController;

Route::prefix('v1')->group(function () {
    Route::get('health', function () {
        return response()->json(['status' => 'ok', 'engine' => 'Laravel 11 Enterprise API', 'version' => '1.0.0']);
    });

    // 1. Auth Endpoints
    Route::prefix('auth')->group(function () {
        Route::post('request-otp', [AuthController::class, 'requestOtp']);
        Route::post('send-otp', [AuthController::class, 'requestOtp']);
        Route::post('verify-otp', [AuthController::class, 'verifyOtp']);
        Route::post('complete-registration', [AuthController::class, 'completeRegistration']);
        Route::post('logout', [AuthController::class, 'logout']);
    });

    // 2. Customer Endpoints
    Route::prefix('customer')->group(function () {
        Route::get('profile', [CustomerController::class, 'getProfile']);
        Route::put('profile', [CustomerController::class, 'updateProfile']);
        Route::post('sync-guest-state', [CustomerController::class, 'syncGuestState']);
        Route::delete('account', [CustomerController::class, 'deleteAccount']);
        Route::get('favorites', [CustomerController::class, 'getFavorites']);
        Route::post('favorites/toggle', [CustomerController::class, 'toggleFavorite']);
        Route::get('wallet', [CustomerController::class, 'getWallet']);
        Route::post('orders/{orderId}/report-issue', [CustomerController::class, 'reportOrderIssue']);
        Route::get('support-tickets', [CustomerController::class, 'getSupportTickets']);
        Route::get('addresses', [CustomerController::class, 'getAddresses']);
        Route::post('addresses', [CustomerController::class, 'addAddress']);
        Route::put('addresses/{id}', [CustomerController::class, 'updateAddress']);
        Route::delete('addresses/{id}', [CustomerController::class, 'deleteAddress']);
        Route::get('orders', [CustomerController::class, 'getOrders']);
        Route::get('personalized-products', [CustomerController::class, 'getPersonalizedProducts']);
    });

    // 3. Catalog Endpoints
    Route::prefix('catalog')->group(function () {
        Route::get('home', [CatalogController::class, 'getHomeScreenData']);
        Route::get('categories', [CatalogController::class, 'getCategories']);
        Route::get('categories/{id}/products', [CatalogController::class, 'getCategoryProducts']);
        Route::get('brands', [CatalogController::class, 'getBrands']);
        Route::get('brands/{id}/products', [CatalogController::class, 'getBrandProducts']);
        Route::get('countries', [CatalogController::class, 'getCountries']);
        Route::get('countries/{id}/products', [CatalogController::class, 'getCountryProducts']);
        Route::get('search', [CatalogController::class, 'search']);
        Route::get('products/{id}', [CatalogController::class, 'getProduct']);
        Route::get('barcode/{barcode}', [CatalogController::class, 'getByBarcode']);
        Route::post('parse-scale-barcode', [Step19ScaleBarcodeAndPartialReturnController::class, 'parseScaleBarcode']);
        Route::post('products/{id}/notify-when-available', [CatalogController::class, 'subscribeStockAlert']);
    });

    // 4. Coupons Endpoints
    Route::prefix('coupons')->group(function () {
        Route::get('available', [CouponsController::class, 'getAvailable']);
        Route::post('validate', [CouponsController::class, 'validateCoupon']);
        Route::get('admin/all', [CouponsController::class, 'getAllAdmin']);
        Route::post('admin/create', [CouponsController::class, 'createAdmin']);
        Route::put('admin/{id}', [CouponsController::class, 'updateAdmin']);
        Route::delete('admin/{id}', [CouponsController::class, 'deleteAdmin']);
    });

    // 5. Orders Endpoints
    Route::prefix('orders')->group(function () {
        Route::post('/', [OrdersController::class, 'create']);
        Route::post('checkout', [OrdersController::class, 'create']);
        Route::post('validate-cart', [OrdersController::class, 'validateCart']);
        Route::get('{id}', [OrdersController::class, 'show']);
        Route::patch('{id}/status', [OrdersController::class, 'updateStatus']);
        Route::get('{id}/live-status', [RatingsController::class, 'getLiveStatus']);
        Route::post('{id}/rate', [RatingsController::class, 'rateOrder']);
    });

    // 6. Fleet & Driver Dispatch Endpoints
    Route::prefix('fleet')->group(function () {
        Route::get('drivers', [FleetController::class, 'getAllDrivers']);
        Route::get('drivers/{id}', [FleetController::class, 'getDriverById']);
        Route::post('drivers', [FleetController::class, 'createDriver']);
        Route::put('drivers/{id}', [FleetController::class, 'updateDriver']);
        Route::post('orders/{orderId}/assign', [FleetController::class, 'assignOrder']);
        Route::post('orders/{orderId}/status', [FleetController::class, 'updateDeliveryStatus']);
        Route::post('orders/{orderId}/partial-return', [Step19ScaleBarcodeAndPartialReturnController::class, 'partialReturn']);
        Route::post('drivers/{driverId}/settle-cash', [FleetController::class, 'settleDriverCash']);
        Route::get('drivers/{driverId}/orders', [FleetController::class, 'getDriverOrders']);
    });

    // 7. Admin Operations Endpoints
    Route::prefix('admin')->group(function () {
        Route::get('analytics/overview', [AdminController::class, 'getAnalyticsOverview']);
        Route::get('orders', [AdminController::class, 'getOrders']);
        Route::get('orders/{id}', [AdminController::class, 'getOrderById']);
        Route::patch('orders/{id}/status', [AdminController::class, 'updateOrderStatus']);
        Route::patch('orders/{id}/packing', [AdminController::class, 'markOrderPacking']);
        Route::get('orders/{id}/receipt', [AdminController::class, 'generateThermalReceipt']);
        Route::get('catalog', [AdminController::class, 'getCatalog']);
        Route::put('catalog/{id}', [AdminController::class, 'updateProduct']);
        Route::patch('catalog/{id}/discount', [AdminController::class, 'updateProductDiscount']);
        Route::get('campaigns', [AdminController::class, 'getCampaigns']);
        Route::post('campaigns', [AdminController::class, 'createCampaign']);
        Route::put('campaigns/{id}', [AdminController::class, 'updateCampaign']);
        Route::delete('campaigns/{id}', [AdminController::class, 'deleteCampaign']);
        Route::get('warehouses', [AdminController::class, 'getWarehouses']);
        Route::put('warehouses/{id}', [AdminController::class, 'updateWarehouse']);
        Route::get('settings/payments', [AdminController::class, 'getPaymentSettings']);
        Route::put('settings/payments/{id}', [AdminController::class, 'updatePaymentSetting']);
        Route::get('customers', [AdminController::class, 'getCustomers']);
        Route::get('coupons', [CouponsController::class, 'getAllAdmin']);
        Route::post('coupons/create', [CouponsController::class, 'createAdmin']);
        Route::put('coupons/{id}', [CouponsController::class, 'updateAdmin']);
        Route::delete('coupons/{id}', [CouponsController::class, 'deleteAdmin']);
        Route::get('ratings', [RatingsController::class, 'getAdminRatings']);
        Route::post('notifications/broadcast', [NotificationsController::class, 'adminBroadcast']);
        Route::post('orders/{orderId}/items/{orderItemId}/substitute-or-remove', [AdminController::class, 'substituteOrRemoveOrderItem']);
        Route::get('audit-logs', [AdminController::class, 'getAuditLogs']);
        Route::put('store/operating-status', [AdminController::class, 'updateStoreOperatingStatus']);

        // Step 18: In-Store Picker & Partner Supermarket Operations
        Route::patch('orders/{id}/pick-item', [Step18RetailOperationsController::class, 'pickOrderItem']);
        Route::post('orders/{id}/complete-picking', [Step18RetailOperationsController::class, 'completeOrderPicking']);
        Route::get('partner-portal/summary', [Step18RetailOperationsController::class, 'getPartnerPortalSummary']);
        Route::get('partner-portal/orders', [Step18RetailOperationsController::class, 'getPartnerPortalOrders']);
        Route::post('partner-portal/generate-settlement', [Step18RetailOperationsController::class, 'generatePartnerSettlement']);
        Route::post('erp/test-connection', [Step19ScaleBarcodeAndPartialReturnController::class, 'testPosConnection']);

        // Support & Refunds
        Route::get('support-tickets', [AdminSupportController::class, 'getTickets']);
        Route::post('support-tickets/{id}/resolve', [AdminSupportController::class, 'resolveTicket']);

        // Step 22: System Backup Snapshot & Two-Way POS Outbound Invoices
        Route::post('system/backup-database', [Step22RetailHardeningController::class, 'backupDatabase']);
        Route::get('pos/outbound-invoices', [Step22RetailHardeningController::class, 'getOutboundInvoices']);
        Route::get('pos/safety-buffer', [Step22RetailHardeningController::class, 'getSafetyBuffer']);
        Route::post('pos/safety-buffer', [Step22RetailHardeningController::class, 'updateSafetyBuffer']);

        // Finance & Cost Accounting
        Route::prefix('finance')->group(function () {
            Route::get('summary', [AdminFinanceController::class, 'getSummary']);
            Route::get('daily-report', [AdminFinanceController::class, 'getDailyReport']);
            Route::get('daily-z-report', [AdminFinanceController::class, 'getDailyZReport']);
            Route::get('category-profitability', [AdminFinanceController::class, 'getCategoryProfitability']);
            Route::get('categories', [AdminFinanceController::class, 'getCategoryProfitability']);
            Route::get('sku-margins', [AdminFinanceController::class, 'getSkuMargins']);
            Route::get('skus', [AdminFinanceController::class, 'getSkuMargins']);
            Route::post('wastage', [AdminFinanceController::class, 'recordWastage']);
            Route::get('ledger', [AdminFinanceController::class, 'getLedger']);
            Route::post('settle-supermarket', [AdminFinanceController::class, 'settleSupermarket']);
            Route::get('supermarket-settlements', [AdminFinanceController::class, 'getSupermarketSettlements']);
        });

        // Supply Chain & FEFO Expiry Radar
        Route::prefix('supply-chain')->group(function () {
            Route::get('overview', [AdminSupplyChainController::class, 'getOverview']);
            Route::get('batches', [AdminSupplyChainController::class, 'getBatches']);
            Route::get('purchase-orders', [AdminSupplyChainController::class, 'getPurchaseOrders']);
            Route::post('purchase-orders', [AdminSupplyChainController::class, 'createPurchaseOrder']);
            Route::post('purchase-orders/{id}/receive', [AdminSupplyChainController::class, 'receivePurchaseOrder']);
            Route::post('batches/{batchId}/apply-clearance-discount', [AdminSupplyChainController::class, 'applyClearanceDiscount']);
            Route::post('batches/{batchId}/quarantine-writeoff', [AdminSupplyChainController::class, 'quarantineAndWriteOff']);
            Route::get('suppliers', [AdminSupplyChainController::class, 'getSuppliers']);
        });

        // POS Parity Audit
        Route::get('erp/pos-parity-audit', [ErpSyncController::class, 'getPosParityAudit']);
    });

    // 8. ERP Sync Endpoints
    Route::prefix('erp')->group(function () {
        Route::get('pos-parity-audit', [ErpSyncController::class, 'getPosParityAudit']);
        Route::post('webhook/stock-update', [ErpSyncController::class, 'handleStockUpdate']);
        Route::post('sync/trigger', [ErpSyncController::class, 'triggerSync']);
        Route::get('sync/logs', [ErpSyncController::class, 'getLogs']);
        Route::get('outbound-invoices', [Step22RetailHardeningController::class, 'getOutboundInvoices']);
        Route::get('safety-buffer', [Step22RetailHardeningController::class, 'getSafetyBuffer']);
        Route::post('safety-buffer', [Step22RetailHardeningController::class, 'updateSafetyBuffer']);
    });

    // 9. Notifications Endpoints
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationsController::class, 'getNotifications']);
        Route::patch('{id}/read', [NotificationsController::class, 'markRead']);
        Route::post('read-all', [NotificationsController::class, 'readAll']);
    });

    // 10. Payments Endpoints
    Route::prefix('payments')->group(function () {
        Route::get('methods', [PaymentsController::class, 'getMethods']);
    });
});
