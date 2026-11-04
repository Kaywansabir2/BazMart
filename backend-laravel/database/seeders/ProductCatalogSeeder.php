<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\WarehouseStock;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;

class ProductCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $productsFile = __DIR__ . '/data/products.json';
        if (file_exists($productsFile)) {
            $products = json_decode(file_get_contents($productsFile), true);
            foreach ($products as $p) {
                $p['pos_item_code'] = $p['external_erp_id'] ?? ('POS-' . $p['id']);
                $p['pos_shelf_price_iqd'] = $p['original_price_iqd'];
                $p['pos_promo_price_iqd'] = $p['discounted_price_iqd'] ?? null;
                $p['pos_parity_verified'] = true;
                $p['commission_rate_percent'] = 3.00;
                Product::updateOrCreate(['id' => $p['id']], $p);
            }
        }

        $stocksFile = __DIR__ . '/data/stocks.json';
        if (file_exists($stocksFile)) {
            $stocks = json_decode(file_get_contents($stocksFile), true);
            foreach (array_chunk($stocks, 200) as $chunk) {
                WarehouseStock::upsert($chunk, ['warehouse_id', 'product_id'], ['stock_quantity', 'reserved_quantity', 'low_stock_threshold', 'updated_at']);
            }
        }

        $movementsFile = __DIR__ . '/data/stock_movements.json';
        if (file_exists($movementsFile)) {
            $movements = json_decode(file_get_contents($movementsFile), true);
            foreach (array_chunk($movements, 200) as $chunk) {
                StockMovement::insert($chunk);
            }
        }
    }
}

