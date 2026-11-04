<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Supplier;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\InventoryBatch;
use Carbon\Carbon;

class SupplyChainSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        // 1. Seed 8 Regional & International Suppliers
        $suppliers = [
            [
                'id' => 'sup-alrahma-dairy',
                'name' => 'Al Rahma Dairy Distribution',
                'contact_person' => 'Kardo Rostam',
                'phone' => '+964 770 123 4101',
                'email' => 'orders@alrahma-dairy.krd',
                'city' => 'Sulaymaniyah',
                'country_code' => 'KRD',
                'lead_time_days' => 1,
                'payment_terms' => 'Net 15',
                'total_purchased_iqd' => 140000,
                'is_active' => true,
            ],
            [
                'id' => 'sup-kurdistan-poultry',
                'name' => 'Kurdistan Fresh Poultry & Egg Terminal',
                'contact_person' => 'Halgurd Aziz',
                'phone' => '+964 750 123 4102',
                'email' => 'supply@kurdistanpoultry.iq',
                'city' => 'Erbil',
                'country_code' => 'KRD',
                'lead_time_days' => 1,
                'payment_terms' => 'Cash on Receipt',
                'total_purchased_iqd' => 177000,
                'is_active' => true,
            ],
            [
                'id' => 'sup-nestle-iraq',
                'name' => 'Nestlé Levant & Iraq Distribution',
                'contact_person' => 'Zana Jalal',
                'phone' => '+964 750 123 4103',
                'email' => 'orders.iraq@nestle-me.com',
                'city' => 'Erbil',
                'country_code' => 'EU',
                'lead_time_days' => 2,
                'payment_terms' => 'Net 30',
                'total_purchased_iqd' => 112500,
                'is_active' => true,
            ],
            [
                'id' => 'sup-anadol-produce',
                'name' => 'Anadol & Erbil Fresh Produce Terminal',
                'contact_person' => 'Darya Othman',
                'phone' => '+964 750 123 4104',
                'email' => 'logistics@anadolproduce.krd',
                'city' => 'Erbil',
                'country_code' => 'KRD',
                'lead_time_days' => 1,
                'payment_terms' => 'Cash on Receipt',
                'total_purchased_iqd' => 126000,
                'is_active' => true,
            ],
            [
                'id' => 'sup-pepsico-baghdad',
                'name' => 'Baghdad Soft Drinks Co. / PepsiCo Iraq',
                'contact_person' => 'Sarmad Hashim',
                'phone' => '+964 780 123 4105',
                'email' => 'distribution@pepsico-iraq.com',
                'city' => 'Baghdad',
                'country_code' => 'USA',
                'lead_time_days' => 3,
                'payment_terms' => 'Net 30',
                'total_purchased_iqd' => 66000,
                'is_active' => true,
            ],
            [
                'id' => 'sup-henkel-levant',
                'name' => 'Henkel Consumer Goods Levant',
                'contact_person' => 'Lana Burhan',
                'phone' => '+964 770 123 4106',
                'email' => 'orders@henkel-levant.com',
                'city' => 'Sulaymaniyah',
                'country_code' => 'EU',
                'lead_time_days' => 2,
                'payment_terms' => 'Net 15',
                'total_purchased_iqd' => 135000,
                'is_active' => true,
            ],
            [
                'id' => 'sup-asian-food-hub',
                'name' => 'Asian Master Food & Noodle Import Hub',
                'contact_person' => 'Soran Qadir',
                'phone' => '+964 770 123 4107',
                'email' => 'sales@asianfoodhub.krd',
                'city' => 'Sulaymaniyah',
                'country_code' => 'KOR',
                'lead_time_days' => 5,
                'payment_terms' => 'Net 30',
                'total_purchased_iqd' => 90000,
                'is_active' => true,
            ],
            [
                'id' => 'sup-golden-wheat',
                'name' => 'Golden Wheat Industrial Bakery Corp',
                'contact_person' => 'Shvan Botan',
                'phone' => '+964 750 123 4108',
                'email' => 'bakery@goldenwheat.krd',
                'city' => 'Duhok',
                'country_code' => 'KRD',
                'lead_time_days' => 1,
                'payment_terms' => 'Cash on Receipt',
                'total_purchased_iqd' => 85000,
                'is_active' => true,
            ],
        ];

        foreach ($suppliers as $s) {
            Supplier::updateOrCreate(['id' => $s['id']], $s);
        }

        // 2. Seed 6 Purchase Orders
        $pos = [
            [
                'id' => 'po-10001',
                'po_number' => '#PO-10001',
                'supplier_id' => 'sup-alrahma-dairy',
                'warehouse_id' => 'erbil-central-darkstore',
                'status' => 'RECEIVED_INTO_STOCK',
                'total_cost_iqd' => 70000,
                'expected_delivery_date' => $now->copy()->subDays(3)->toDateString(),
                'received_at' => $now->copy()->subDays(3),
                'notes' => 'Weekly pasteurized milk and dairy replenishment',
                'items' => [
                    [
                        'product_id' => 'p-alrahma',
                        'ordered_quantity' => 40,
                        'received_quantity' => 40,
                        'unit_cost_iqd' => 1750,
                        'line_total_cost_iqd' => 70000,
                        'batch_number' => 'LOT-ALRAHMA-1101',
                        'production_date' => $now->copy()->subDays(10)->toDateString(),
                        'expiry_date' => $now->copy()->addDays(4)->toDateString(), // 4 Days left (Near Expiry)
                    ]
                ]
            ],
            [
                'id' => 'po-10002',
                'po_number' => '#PO-10002',
                'supplier_id' => 'sup-kurdistan-poultry',
                'warehouse_id' => 'erbil-central-darkstore',
                'status' => 'RECEIVED_INTO_STOCK',
                'total_cost_iqd' => 88500,
                'expected_delivery_date' => $now->copy()->subDays(4)->toDateString(),
                'received_at' => $now->copy()->subDays(4),
                'notes' => 'Grade A Farm Fresh Eggs Tray (30 Pcs)',
                'items' => [
                    [
                        'product_id' => 'p-eggs',
                        'ordered_quantity' => 30,
                        'received_quantity' => 30,
                        'unit_cost_iqd' => 2950,
                        'line_total_cost_iqd' => 88500,
                        'batch_number' => 'LOT-EGGS-1102',
                        'production_date' => $now->copy()->subDays(8)->toDateString(),
                        'expiry_date' => $now->copy()->addDays(6)->toDateString(), // 6 Days left (Near Expiry)
                    ]
                ]
            ],
            [
                'id' => 'po-10003',
                'po_number' => '#PO-10003',
                'supplier_id' => 'sup-nestle-iraq',
                'warehouse_id' => 'erbil-central-darkstore',
                'status' => 'RECEIVED_INTO_STOCK',
                'total_cost_iqd' => 75000,
                'expected_delivery_date' => $now->copy()->subDays(5)->toDateString(),
                'received_at' => $now->copy()->subDays(5),
                'notes' => 'Nescafe Cold Brew RTD Cans Restock',
                'items' => [
                    [
                        'product_id' => 'p-nescafe-latte',
                        'ordered_quantity' => 50,
                        'received_quantity' => 50,
                        'unit_cost_iqd' => 750,
                        'line_total_cost_iqd' => 37500,
                        'batch_number' => 'LOT-NESCAFE-1103',
                        'production_date' => $now->copy()->subDays(20)->toDateString(),
                        'expiry_date' => $now->copy()->addDays(180)->toDateString(), // Healthy
                    ],
                    [
                        'product_id' => 'p-nescafe-cappuccino',
                        'ordered_quantity' => 50,
                        'received_quantity' => 50,
                        'unit_cost_iqd' => 750,
                        'line_total_cost_iqd' => 37500,
                        'batch_number' => 'LOT-NESCAFE-1104',
                        'production_date' => $now->copy()->subDays(20)->toDateString(),
                        'expiry_date' => $now->copy()->addDays(180)->toDateString(), // Healthy
                    ]
                ]
            ],
            [
                'id' => 'po-10004',
                'po_number' => '#PO-10004',
                'supplier_id' => 'sup-anadol-produce',
                'warehouse_id' => 'erbil-central-darkstore',
                'status' => 'RECEIVED_INTO_STOCK',
                'total_cost_iqd' => 63000,
                'expected_delivery_date' => $now->copy()->subDays(2)->toDateString(),
                'received_at' => $now->copy()->subDays(2),
                'notes' => 'Fresh Local Crisp Cucumbers 1kg crate batch',
                'items' => [
                    [
                        'product_id' => 'p-cucumber',
                        'ordered_quantity' => 60,
                        'received_quantity' => 60,
                        'unit_cost_iqd' => 1050,
                        'line_total_cost_iqd' => 63000,
                        'batch_number' => 'LOT-CUCUMBER-1105',
                        'production_date' => $now->copy()->subDays(4)->toDateString(),
                        'expiry_date' => $now->copy()->addDays(5)->toDateString(), // 5 Days left (Near Expiry)
                    ]
                ]
            ],
            [
                'id' => 'po-10005',
                'po_number' => '#PO-10005',
                'supplier_id' => 'sup-henkel-levant',
                'warehouse_id' => 'erbil-central-darkstore',
                'status' => 'SENT_TO_SUPPLIER', // PENDING RECEIVE WORKFLOW
                'total_cost_iqd' => 135000,
                'expected_delivery_date' => $now->copy()->addDays(2)->toDateString(),
                'received_at' => null,
                'notes' => 'Schauma Shampoo Inbound Darkstore Shipment awaiting warehouse dock check-in',
                'items' => [
                    [
                        'product_id' => 'p-schauma',
                        'ordered_quantity' => 25,
                        'received_quantity' => 0,
                        'unit_cost_iqd' => 5400,
                        'line_total_cost_iqd' => 135000,
                        'batch_number' => 'LOT-SCHAUMA-PO5',
                        'production_date' => $now->copy()->subDays(10)->toDateString(),
                        'expiry_date' => $now->copy()->addDays(365)->toDateString(),
                    ]
                ]
            ],
            [
                'id' => 'po-10006',
                'po_number' => '#PO-10006',
                'supplier_id' => 'sup-asian-food-hub',
                'warehouse_id' => 'erbil-central-darkstore',
                'status' => 'SENT_TO_SUPPLIER', // PENDING RECEIVE
                'total_cost_iqd' => 90000,
                'expected_delivery_date' => $now->copy()->addDays(3)->toDateString(),
                'received_at' => null,
                'notes' => 'Tabasco Hot & Spicy Chicken Ramen carton replenishment',
                'items' => [
                    [
                        'product_id' => 'p-tabasco-chicken',
                        'ordered_quantity' => 100,
                        'received_quantity' => 0,
                        'unit_cost_iqd' => 900,
                        'line_total_cost_iqd' => 90000,
                        'batch_number' => 'LOT-TABASCO-PO6',
                        'production_date' => $now->copy()->subDays(15)->toDateString(),
                        'expiry_date' => $now->copy()->addDays(240)->toDateString(),
                    ]
                ]
            ],
        ];

        foreach ($pos as $poData) {
            $items = $poData['items'];
            unset($poData['items']);

            $po = PurchaseOrder::updateOrCreate(['id' => $poData['id']], $poData);
            PurchaseOrderItem::where('purchase_order_id', $po->id)->delete();

            foreach ($items as $it) {
                $it['purchase_order_id'] = $po->id;
                PurchaseOrderItem::create($it);
            }
        }

        // 3. Seed Inventory Batches
        InventoryBatch::truncate();

        $batches = [
            // Near Expiry Warning Batches (Amber Alert <= 7 days)
            [
                'batch_number' => 'LOT-ALRAHMA-1101',
                'warehouse_id' => 'erbil-central-darkstore',
                'product_id' => 'p-alrahma',
                'purchase_order_id' => 'po-10001',
                'initial_quantity' => 40,
                'remaining_quantity' => 15,
                'unit_cost_iqd' => 1750,
                'production_date' => $now->copy()->subDays(10)->toDateString(),
                'expiry_date' => $now->copy()->addDays(4)->toDateString(),
                'status' => 'ACTIVE',
            ],
            [
                'batch_number' => 'LOT-CUCUMBER-1105',
                'warehouse_id' => 'erbil-central-darkstore',
                'product_id' => 'p-cucumber',
                'purchase_order_id' => 'po-10004',
                'initial_quantity' => 60,
                'remaining_quantity' => 18,
                'unit_cost_iqd' => 1050,
                'production_date' => $now->copy()->subDays(4)->toDateString(),
                'expiry_date' => $now->copy()->addDays(5)->toDateString(),
                'status' => 'ACTIVE',
            ],
            [
                'batch_number' => 'LOT-EGGS-1102',
                'warehouse_id' => 'erbil-central-darkstore',
                'product_id' => 'p-eggs',
                'purchase_order_id' => 'po-10002',
                'initial_quantity' => 30,
                'remaining_quantity' => 12,
                'unit_cost_iqd' => 2950,
                'production_date' => $now->copy()->subDays(8)->toDateString(),
                'expiry_date' => $now->copy()->addDays(6)->toDateString(),
                'status' => 'ACTIVE',
            ],

            // Healthy Stock Batches (> 90 days away)
            [
                'batch_number' => 'LOT-NESCAFE-1103',
                'warehouse_id' => 'erbil-central-darkstore',
                'product_id' => 'p-nescafe-latte',
                'purchase_order_id' => 'po-10003',
                'initial_quantity' => 50,
                'remaining_quantity' => 45,
                'unit_cost_iqd' => 750,
                'production_date' => $now->copy()->subDays(20)->toDateString(),
                'expiry_date' => $now->copy()->addDays(180)->toDateString(),
                'status' => 'ACTIVE',
            ],
            [
                'batch_number' => 'LOT-NESCAFE-1104',
                'warehouse_id' => 'erbil-central-darkstore',
                'product_id' => 'p-nescafe-cappuccino',
                'purchase_order_id' => 'po-10003',
                'initial_quantity' => 50,
                'remaining_quantity' => 45,
                'unit_cost_iqd' => 750,
                'production_date' => $now->copy()->subDays(20)->toDateString(),
                'expiry_date' => $now->copy()->addDays(180)->toDateString(),
                'status' => 'ACTIVE',
            ],
            [
                'batch_number' => 'LOT-PEPSI-26B',
                'warehouse_id' => 'erbil-central-darkstore',
                'product_id' => 'p-mountain-dew',
                'purchase_order_id' => null,
                'initial_quantity' => 60,
                'remaining_quantity' => 50,
                'unit_cost_iqd' => 220,
                'production_date' => $now->copy()->subDays(30)->toDateString(),
                'expiry_date' => $now->copy()->addDays(120)->toDateString(),
                'status' => 'ACTIVE',
            ],
            [
                'batch_number' => 'LOT-SCHAUMA-26C',
                'warehouse_id' => 'erbil-central-darkstore',
                'product_id' => 'p-schauma',
                'purchase_order_id' => null,
                'initial_quantity' => 25,
                'remaining_quantity' => 20,
                'unit_cost_iqd' => 5400,
                'production_date' => $now->copy()->subDays(30)->toDateString(),
                'expiry_date' => $now->copy()->addDays(365)->toDateString(),
                'status' => 'ACTIVE',
            ],
            [
                'batch_number' => 'LOT-RAMEN-26D',
                'warehouse_id' => 'erbil-central-darkstore',
                'product_id' => 'p-tabasco-chicken',
                'purchase_order_id' => null,
                'initial_quantity' => 100,
                'remaining_quantity' => 80,
                'unit_cost_iqd' => 900,
                'production_date' => $now->copy()->subDays(25)->toDateString(),
                'expiry_date' => $now->copy()->addDays(240)->toDateString(),
                'status' => 'ACTIVE',
            ],

            // 1 Quarantined Expired Batch (Red Alert in past)
            [
                'batch_number' => 'LOT-RAMAK-EXPIRED',
                'warehouse_id' => 'erbil-central-darkstore',
                'product_id' => 'p-ramak',
                'purchase_order_id' => null,
                'initial_quantity' => 10,
                'remaining_quantity' => 6,
                'unit_cost_iqd' => 1750,
                'production_date' => $now->copy()->subDays(20)->toDateString(),
                'expiry_date' => $now->copy()->subDays(2)->toDateString(),
                'status' => 'EXPIRED_QUARANTINED',
            ],

            // 1 Expired Active Batch (Expired yesterday, ready for Quarantine Action Button!)
            [
                'batch_number' => 'LOT-ALMARAI-EXPIRED-NOW',
                'warehouse_id' => 'erbil-central-darkstore',
                'product_id' => 'p-almarai',
                'purchase_order_id' => null,
                'initial_quantity' => 8,
                'remaining_quantity' => 4,
                'unit_cost_iqd' => 2150,
                'production_date' => $now->copy()->subDays(15)->toDateString(),
                'expiry_date' => $now->copy()->subDays(1)->toDateString(),
                'status' => 'ACTIVE',
            ],
        ];

        foreach ($batches as $b) {
            InventoryBatch::create($b);
        }
    }
}

