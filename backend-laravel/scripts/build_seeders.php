<?php

function now() {
    return date('Y-m-d H:i:s');
}

$src = new PDO('sqlite:c:/Users/zakar/BazMart/backend/prisma/dev.db');
$src->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

function camelToSnake($input) {
    return strtolower(preg_replace('/(?<!^)[A-Z]/', '_$0', $input));
}

// 1. Warehouses
$warehouses = $src->query('SELECT * FROM Warehouse')->fetchAll();
$whData = [];
foreach ($warehouses as $w) {
    $whData[] = [
        'id' => $w['id'],
        'name' => $w['name'],
        'city' => $w['city'],
        'latitude' => (float)$w['latitude'],
        'longitude' => (float)$w['longitude'],
        'delivery_radius_km' => (int)($w['deliveryRadiusKm'] ?? 20),
        'min_order_iqd' => (int)($w['minOrderIqd'] ?? 7000),
        'delivery_fee_iqd' => (int)($w['deliveryFeeIqd'] ?? 500),
        'is_active' => (bool)$w['isActive'],
        'created_at' => now(),
        'updated_at' => now(),
    ];
}

// 2. Categories
$categories = $src->query('SELECT * FROM Category ORDER BY sortOrder ASC')->fetchAll();
$catData = [];
foreach ($categories as $c) {
    $catData[] = [
        'id' => $c['id'],
        'slug' => $c['slug'],
        'name_en' => $c['nameEn'],
        'name_ckb' => $c['nameCkb'],
        'name_ar' => $c['nameAr'],
        'image_url' => $c['imageUrl'],
        'sort_order' => (int)($c['sortOrder'] ?? 0),
        'parent_id' => $c['parentId'] ?? null,
        'created_at' => now(),
        'updated_at' => now(),
    ];
}

// 3. Brands
$brands = $src->query('SELECT * FROM Brand ORDER BY sortOrder ASC')->fetchAll();
$brandData = [];
$primaryBrands = ['brand_maggi', 'b-maggi', 'brand_parex', 'b-parex', 'brand_kinder', 'b-kinder', 'brand_nescafe_dg', 'b-nescafe-dg', 'brand_john_west', 'b-john-west', 'brand_vaseline', 'b-vaseline', 'brand_sanita', 'b-sanita', 'brand_coca_cola', 'b-coca-cola'];
foreach ($brands as $b) {
    $isFeatured = in_array(strtolower($b['id']), $primaryBrands) || in_array(strtolower($b['name']), ['maggi', 'parex', 'kinder', 'nescafe dolce gusto', 'john west', 'vaseline', 'sanita', 'coca-cola']);
    $brandData[] = [
        'id' => $b['id'],
        'name' => $b['name'],
        'logo_url' => $b['logoUrl'] ?? null,
        'bg_color_hex' => $b['bgColorHex'] ?? '#FFFFFF',
        'is_featured_grid' => $isFeatured,
        'sort_order' => (int)($b['sortOrder'] ?? 0),
        'created_at' => now(),
        'updated_at' => now(),
    ];
}

// 4. Country Origins
$countries = $src->query('SELECT * FROM CountryOrigin')->fetchAll();
$countryData = [];
foreach ($countries as $co) {
    $countryData[] = [
        'id' => $co['id'],
        'code' => $co['code'],
        'name_en' => $co['nameEn'],
        'name_ckb' => $co['nameCkb'],
        'name_ar' => $co['nameAr'],
        'flag_asset' => $co['flagAsset'],
        'sort_order' => 0,
        'created_at' => now(),
        'updated_at' => now(),
    ];
}

// 5. Products & Warehouse Stocks
$products = $src->query('SELECT * FROM Product')->fetchAll();
$prodData = [];
$stockData = [];
$movementData = [];

foreach ($products as $p) {
    $searchIndex = strtolower(implode(' ', array_filter([
        $p['titleEn'], $p['titleCkb'], $p['titleAr'],
        $p['descriptionEn'] ?? '', $p['descriptionCkb'] ?? '',
        $p['externalErpId'], $p['barcode'],
    ])));

    $prodData[] = [
        'id' => $p['id'],
        'external_erp_id' => $p['externalErpId'],
        'barcode' => $p['barcode'],
        'title_en' => $p['titleEn'],
        'title_ckb' => $p['titleCkb'],
        'title_ar' => $p['titleAr'],
        'normalized_search_index' => $searchIndex,
        'description_en' => $p['descriptionEn'] ?? null,
        'description_ckb' => $p['descriptionCkb'] ?? null,
        'description_ar' => $p['descriptionAr'] ?? null,
        'unit_text' => $p['unitText'] ?? '1 Pc',
        'storage_temp' => $p['storageTemp'] ?? 'Ambient',
        'original_price_iqd' => (int)$p['originalPriceIqd'],
        'discounted_price_iqd' => isset($p['discountedPriceIqd']) && $p['discountedPriceIqd'] !== '' && $p['discountedPriceIqd'] !== null ? (int)$p['discountedPriceIqd'] : null,
        'discount_percentage' => isset($p['discountPercentage']) && $p['discountPercentage'] !== '' && $p['discountPercentage'] !== null ? (int)$p['discountPercentage'] : null,
        'image_url' => $p['imageUrl'],
        'is_best_seller' => (bool)($p['isBestSeller'] ?? false),
        'is_fresh_pick' => (bool)($p['isFreshPick'] ?? false),
        'is_top_saver' => (bool)($p['isTopSaver'] ?? false),
        'brand_id' => $p['brandId'],
        'category_id' => $p['categoryId'],
        'country_origin_id' => $p['countryOriginId'] ?? null,
        'last_synced_at' => now(),
        'created_at' => now(),
        'updated_at' => now(),
    ];

    // Seed stock for both dark stores
    foreach (['erbil-central-darkstore', 'suly-main-darkstore'] as $whId) {
        $qty = 80 + (abs(crc32($p['id'] . $whId)) % 100);
        $stockData[] = [
            'warehouse_id' => $whId,
            'product_id' => $p['id'],
            'stock_quantity' => $qty,
            'reserved_quantity' => 0,
            'low_stock_threshold' => 10,
            'created_at' => now(),
            'updated_at' => now(),
        ];

        $movementData[] = [
            'warehouse_id' => $whId,
            'product_id' => $p['id'],
            'order_id' => null,
            'movement_type' => 'ERP_SYNC_DELTA',
            'quantity_before' => 0,
            'quantity_change' => $qty,
            'quantity_after' => $qty,
            'reference_note' => 'Initial Master ERP Dark Store Ingestion',
            'created_at' => now(),
        ];
    }
}

// 6. Campaign Banners
$banners = $src->query('SELECT * FROM CampaignBanner')->fetchAll();
$bannerData = [];
foreach ($banners as $b) {
    $bannerData[] = [
        'id' => $b['id'],
        'type' => $b['type'],
        'title_en' => $b['titleEn'],
        'title_ckb' => $b['titleCkb'] ?? null,
        'title_ar' => $b['titleAr'] ?? null,
        'subtitle' => $b['subtitle'] ?? null,
        'badge_text' => $b['badgeText'] ?? null,
        'bg_color_hex' => $b['bgColorHex'] ?? null,
        'image_url' => $b['imageUrl'] ?? null,
        'linked_category_id' => $b['linkedCategoryId'] ?? null,
        'linked_brand_id' => $b['linkedBrandId'] ?? null,
        'linked_product_ids' => $b['linkedProductIds'] ?? null,
        'sort_order' => (int)($b['sortOrder'] ?? 0),
        'is_active' => true,
        'created_at' => now(),
        'updated_at' => now(),
    ];
}

// 7. Coupons
$coupons = $src->query('SELECT * FROM Coupon')->fetchAll();
$couponData = [];
foreach ($coupons as $cpn) {
    $couponData[] = [
        'id' => $cpn['id'],
        'code' => $cpn['code'],
        'title_en' => $cpn['titleEn'],
        'title_ckb' => $cpn['titleCkb'] ?? null,
        'title_ar' => $cpn['titleAr'] ?? null,
        'description_en' => $cpn['descriptionEn'] ?? null,
        'description_ckb' => $cpn['descriptionCkb'] ?? null,
        'description_ar' => $cpn['descriptionAr'] ?? null,
        'discount_type' => $cpn['discountType'],
        'discount_value' => (int)$cpn['discountValue'],
        'max_discount_iqd' => isset($cpn['maxDiscountIqd']) && $cpn['maxDiscountIqd'] !== '' && $cpn['maxDiscountIqd'] !== null ? (int)$cpn['maxDiscountIqd'] : null,
        'min_order_subtotal_iqd' => (int)($cpn['minOrderSubtotalIqd'] ?? 7000),
        'first_order_only' => (bool)($cpn['firstOrderOnly'] ?? false),
        'applicable_category_ids' => $cpn['applicableCategoryIds'] ?? null,
        'applicable_brand_ids' => $cpn['applicableBrandIds'] ?? null,
        'exclude_discounted_items' => (bool)($cpn['excludeDiscountedItems'] ?? false),
        'usage_limit_global' => isset($cpn['usageLimitGlobal']) && $cpn['usageLimitGlobal'] !== '' && $cpn['usageLimitGlobal'] !== null ? (int)$cpn['usageLimitGlobal'] : null,
        'usage_limit_per_customer' => (int)($cpn['usageLimitPerCustomer'] ?? 1),
        'current_usage_count' => (int)($cpn['currentUsageCount'] ?? 0),
        'starts_at' => $cpn['startsAt'] ?? now(),
        'expires_at' => $cpn['expiresAt'] ?? null,
        'is_active' => (bool)($cpn['isActive'] ?? true),
        'created_at' => now(),
        'updated_at' => now(),
    ];
}

// 8. Drivers & Driver Cash Ledgers
$drivers = $src->query('SELECT * FROM Driver')->fetchAll();
$driverData = [];
$ledgerData = [];
foreach ($drivers as $d) {
    $cash = (int)($d['cashInHandIqd'] ?? 0);
    $driverData[] = [
        'id' => $d['id'],
        'full_name' => $d['fullName'],
        'phone' => $d['phone'],
        'vehicle_type' => $d['vehicleType'] ?? 'Motorcycle',
        'plate_number' => $d['plateNumber'],
        'warehouse_id' => $d['warehouseId'],
        'status' => $d['status'] ?? 'AVAILABLE',
        'cash_in_hand_iqd' => $cash,
        'average_rating' => (float)($d['averageRating'] ?? 4.90),
        'total_ratings_count' => (int)($d['totalRatingsCount'] ?? 12),
        'created_at' => now(),
        'updated_at' => now(),
    ];

    if ($cash > 0) {
        $ledgerData[] = [
            'driver_id' => $d['id'],
            'order_id' => null,
            'transaction_type' => 'COD_COLLECTED',
            'amount_iqd' => $cash,
            'balance_after_iqd' => $cash,
            'receipt_reference' => '#OPENING-CASH-ON-HAND',
            'created_at' => now(),
        ];
    }
}

// 9. Customers & Addresses
$customers = $src->query('SELECT * FROM Customer')->fetchAll();
$custData = [];
foreach ($customers as $c) {
    $custData[] = [
        'id' => $c['id'],
        'phone' => $c['phone'],
        'name' => $c['name'],
        'preferred_language' => $c['preferredLanguage'] ?? 'en',
        'api_token' => 'demo-token-' . md5($c['phone']),
        'created_at' => now(),
        'updated_at' => now(),
    ];
}

$addresses = $src->query('SELECT * FROM CustomerAddress')->fetchAll();
$addrData = [];
foreach ($addresses as $a) {
    $addrData[] = [
        'id' => $a['id'],
        'customer_id' => $a['customerId'],
        'title' => $a['title'] ?? 'Home',
        'city' => $a['city'],
        'neighborhood' => $a['neighborhood'] ?? null,
        'street' => $a['street'] ?? null,
        'building' => $a['building'] ?? null,
        'landmark' => $a['landmark'] ?? null,
        'latitude' => (float)$a['latitude'],
        'longitude' => (float)$a['longitude'],
        'is_default' => (bool)$a['isDefault'],
        'created_at' => now(),
        'updated_at' => now(),
    ];
}

// 10. Payment Configs
$payments = $src->query('SELECT * FROM PaymentConfig')->fetchAll();
$payData = [];
foreach ($payments as $p) {
    $payData[] = [
        'id' => $p['id'],
        'name' => $p['name'],
        'is_enabled' => (bool)$p['isEnabled'],
        'credentials' => $p['credentials'] ?? null,
        'created_at' => now(),
        'updated_at' => now(),
    ];
}

// 11. Initial Orders, Items, Notifications, Ratings
$orders = $src->query('SELECT * FROM "Order"')->fetchAll();
$orderData = [];
foreach ($orders as $o) {
    $orderData[] = [
        'id' => $o['id'],
        'order_number' => $o['orderNumber'],
        'idempotency_key' => $o['idempotencyKey'] ?? null,
        'customer_id' => $o['customerId'] ?? null,
        'customer_phone' => $o['customerPhone'] ?? '+9647701234567',
        'warehouse_id' => $o['warehouseId'],
        'address_snapshot' => $o['addressSnapshot'] ?? json_encode(['city' => 'Erbil']),
        'subtotal_iqd' => (int)$o['subtotalIqd'],
        'discount_total_iqd' => (int)($o['discountTotalIqd'] ?? 0),
        'delivery_fee_iqd' => (int)($o['deliveryFeeIqd'] ?? 0),
        'coupon_code' => $o['couponCode'] ?? null,
        'coupon_discount_iqd' => (int)($o['couponDiscountIqd'] ?? 0),
        'total_iqd' => (int)$o['totalIqd'],
        'payment_method' => $o['paymentMethod'] ?? 'COD',
        'payment_status' => $o['paymentStatus'] ?? 'PENDING',
        'order_status' => $o['orderStatus'] ?? 'DELIVERED',
        'driver_id' => $o['driverId'] ?? null,
        'assigned_driver_name' => $o['assignedDriverName'] ?? null,
        'assigned_driver_phone' => $o['assignedDriverPhone'] ?? null,
        'estimated_delivery_minutes' => $o['estimatedDeliveryMinutes'] ?? null,
        'is_packed' => (bool)($o['isPacked'] ?? false),
        'packed_items' => $o['packedItems'] ?? null,
        'placed_at' => $o['placedAt'] ?? now(),
        'packing_at' => $o['packingAt'] ?? null,
        'out_for_delivery_at' => $o['outForDeliveryAt'] ?? null,
        'delivered_at' => $o['deliveredAt'] ?? null,
        'created_at' => now(),
        'updated_at' => now(),
    ];
}

$orderItems = $src->query('SELECT * FROM OrderItem')->fetchAll();
$orderItemData = [];
foreach ($orderItems as $oi) {
    $orderItemData[] = [
        'order_id' => $oi['orderId'],
        'product_id' => $oi['productId'],
        'quantity' => (int)$oi['quantity'],
        'unit_price_iqd' => (int)$oi['unitPriceIqd'],
        'total_iqd' => (int)$oi['totalIqd'],
        'product_snapshot' => $oi['productSnapshot'] ?? null,
        'is_packed' => (bool)($oi['isPacked'] ?? false),
        'created_at' => now(),
        'updated_at' => now(),
    ];
}

$notifications = $src->query('SELECT * FROM Notification')->fetchAll();
$notifData = [];
foreach ($notifications as $n) {
    $notifData[] = [
        'customer_id' => $n['customerId'] ?? null,
        'customer_phone' => $n['customerPhone'] ?? null,
        'order_id' => $n['orderId'] ?? null,
        'type' => $n['type'] ?? 'ORDER_UPDATE',
        'title_en' => $n['titleEn'],
        'title_ckb' => $n['titleCkb'] ?? null,
        'title_ar' => $n['titleAr'] ?? null,
        'body_en' => $n['bodyEn'],
        'body_ckb' => $n['bodyCkb'] ?? null,
        'body_ar' => $n['bodyAr'] ?? null,
        'is_read' => (bool)($n['isRead'] ?? false),
        'created_at' => now(),
        'updated_at' => now(),
    ];
}

$ratings = $src->query('SELECT * FROM OrderRating')->fetchAll();
$ratingData = [];
foreach ($ratings as $r) {
    $ratingData[] = [
        'order_id' => $r['orderId'],
        'customer_id' => $r['customerId'] ?? null,
        'customer_phone' => $r['customerPhone'] ?? null,
        'driver_id' => $r['driverId'] ?? null,
        'overall_store_stars' => (int)($r['overallStoreStars'] ?? 5),
        'driver_stars' => (int)($r['driverStars'] ?? 5),
        'feedback_tags' => $r['feedbackTags'] ?? json_encode(['Fast Delivery ⚡']),
        'comment' => $r['comment'] ?? null,
        'created_at' => now(),
        'updated_at' => now(),
    ];
}

// Dump files into backend-laravel/database/seeders/data/
$dataDir = 'c:/Users/zakar/BazMart/backend-laravel/database/seeders/data';
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0777, true);
}

file_put_contents("$dataDir/warehouses.json", json_encode($whData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
file_put_contents("$dataDir/categories.json", json_encode($catData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
file_put_contents("$dataDir/brands.json", json_encode($brandData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
file_put_contents("$dataDir/countries.json", json_encode($countryData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
file_put_contents("$dataDir/products.json", json_encode($prodData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
file_put_contents("$dataDir/stocks.json", json_encode($stockData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
file_put_contents("$dataDir/stock_movements.json", json_encode($movementData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
file_put_contents("$dataDir/banners.json", json_encode($bannerData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
file_put_contents("$dataDir/coupons.json", json_encode($couponData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
file_put_contents("$dataDir/drivers.json", json_encode($driverData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
file_put_contents("$dataDir/ledgers.json", json_encode($ledgerData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
file_put_contents("$dataDir/customers.json", json_encode($custData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
file_put_contents("$dataDir/addresses.json", json_encode($addrData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
file_put_contents("$dataDir/payments.json", json_encode($payData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
file_put_contents("$dataDir/orders.json", json_encode($orderData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
file_put_contents("$dataDir/order_items.json", json_encode($orderItemData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
file_put_contents("$dataDir/notifications.json", json_encode($notifData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
file_put_contents("$dataDir/ratings.json", json_encode($ratingData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo "Successfully dumped seed data to JSON fixtures!\n";
echo "Products: " . count($prodData) . "\n";
echo "Categories: " . count($catData) . "\n";
echo "Brands: " . count($brandData) . "\n";
echo "Countries: " . count($countryData) . "\n";
echo "Coupons: " . count($couponData) . "\n";
echo "Drivers: " . count($driverData) . "\n";
echo "Orders: " . count($orderData) . "\n";
