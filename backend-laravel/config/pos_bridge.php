<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Partner Supermarket POS Integration Bridge Configuration
    |--------------------------------------------------------------------------
    |
    | Supported Drivers:
    |   - "simulated" (Default local dev: simulated partner supermarket POS database)
    |   - "direct_sql" (Direct external SQL Server / MySQL / PostgreSQL / Oracle connection)
    |   - "rest_webhook" (Partner supermarket POS REST delta pull & push adapter)
    |
    */

    'default_driver' => env('POS_BRIDGE_DRIVER', 'simulated'),

    'commercial_agreement' => [
        'partner_supermarket_name' => env('POS_PARTNER_NAME', 'Kurdistan Central Hypermarket & Supermarkets'),
        'fixed_commission_rate_percent' => 3.00,
        'supermarket_payable_share_percent' => 97.00,
        'zero_markup_policy_active' => true,
    ],

    'connections' => [
        'simulated' => [
            'total_skus' => 400,
            'warehouse_id' => 'erbil-central-darkstore',
            'sync_interval_seconds' => 30,
        ],

        'direct_sql' => [
            'driver' => env('POS_DB_CONNECTION', 'sqlsrv'), // sqlsrv, mysql, pgsql, oci
            'host' => env('POS_DB_HOST', '127.0.0.1'),
            'port' => env('POS_DB_PORT', '1433'),
            'database' => env('POS_DB_DATABASE', 'SupermarketPOS_Production'),
            'username' => env('POS_DB_USERNAME', 'pos_reader'),
            'password' => env('POS_DB_PASSWORD', ''),
            'table_name' => env('POS_DB_TABLE', 'dbo.tbl_ItemsShelfMaster'),
            'column_mappings' => [
                'pos_item_code' => 'ItemNo',
                'barcode' => 'Barcode',
                'title_en' => 'ItemNameEN',
                'title_ckb' => 'ItemNameCKB',
                'title_ar' => 'ItemNameAR',
                'pos_shelf_price_iqd' => 'ShelfPriceIQD',
                'pos_promo_price_iqd' => 'PromoPriceIQD',
                'stock_quantity' => 'WarehouseQty',
            ],
        ],

        'rest_webhook' => [
            'base_url' => env('POS_API_BASE_URL', 'https://api.supermarket-pos.iq/v1'),
            'api_key' => env('POS_API_KEY', ''),
            'webhook_secret' => env('POS_WEBHOOK_SECRET', ''),
        ],
    ],
];

