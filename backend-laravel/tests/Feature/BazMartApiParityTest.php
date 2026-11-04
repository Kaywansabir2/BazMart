<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Product;
use App\Models\Coupon;
use App\Models\Driver;
use App\Models\WarehouseStock;

class BazMartApiParityTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        \App\Models\CouponRedemption::where('customer_phone', '+9647701234567')->delete();
    }

    public function test_catalog_home_returns_complete_composite_payload(): void
    {
        $response = $this->getJson('/api/v1/catalog/home');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'success',
                'data' => [
                    'categories',
                    'brands',
                    'countries',
                    'buyAgain',
                    'bestSellers',
                    'topSavers',
                    'freshPicks',
                    'allProducts',
                ],
            ]);

        $data = $response->json('data');
        $this->assertCount(20, $data['categories']);
        $this->assertGreaterThanOrEqual(10, count($data['brands']));
        $this->assertGreaterThanOrEqual(400, count($data['allProducts']));
    }

    public function test_auth_otp_flow_succeeds_with_dev_otp(): void
    {
        $req = $this->postJson('/api/v1/auth/request-otp', [
            'phone' => '07701234567',
        ]);

        $req->assertStatus(200)
            ->assertJson([
                'success' => true,
                'normalizedPhone' => '+9647701234567',
                'devOtpHint' => '123456',
            ]);

        $verify = $this->postJson('/api/v1/auth/verify-otp', [
            'phone' => '07701234567',
            'otpCode' => '123456',
        ]);

        $verify->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'accessToken',
                'customer' => ['id', 'phone', 'name'],
            ]);
    }

    public function test_coupon_validation_and_calculation(): void
    {
        $response = $this->postJson('/api/v1/coupons/validate', [
            'code' => 'BAZ20',
            'customerPhone' => '+9647701234567',
            'cartItems' => [
                [
                    'productId' => 'p-alrahma',
                    'quantity' => 6, // 6 x 1688 = 10,128 (> 10,000 min)
                ],
            ],
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'isValid' => true,
                    'code' => 'BAZ20',
                ],
            ]);
    }

    public function test_atomic_order_placement_and_idempotency_replay(): void
    {
        $idempotencyKey = 'test-idem-' . bin2hex(random_bytes(8));

        $orderPayload = [
            'customerPhone' => '+9647701234567',
            'customerName' => 'Ako Muhamad',
            'warehouseId' => 'erbil-central-darkstore',
            'address' => [
                'city' => 'Erbil',
                'neighborhood' => 'Dream City',
                'street' => '100m Road',
                'latitude' => 36.1911,
                'longitude' => 44.0092,
            ],
            'items' => [
                [
                    'productId' => 'p-alrahma',
                    'quantity' => 5, // 5 x 2250 = 11,250 (> 10,000 min) // 4 x 2250 = 9000 IQD (> 7000 min basket)
                ],
            ],
            'paymentMethod' => 'COD',
        ];

        // 1. First Placement
        $res1 = $this->withHeader('idempotency-key', $idempotencyKey)
            ->postJson('/api/v1/orders', $orderPayload);

        $res1->assertStatus(201)
            ->assertJson([
                'success' => true,
            ]);

        $orderId = $res1->json('data.order.id');
        $this->assertNotEmpty($orderId);

        // 2. Idempotent Replay
        $res2 = $this->withHeader('idempotency-key', $idempotencyKey)
            ->postJson('/api/v1/orders', $orderPayload);

        $res2->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'isIdempotentReplay' => true,
                ],
            ]);

        $this->assertEquals($orderId, $res2->json('data.order.id'));
    }

    public function test_fleet_dispatch_and_cash_settlement(): void
    {
        $driver = Driver::first();
        $this->assertNotNull($driver);

        // Settle cash
        $settle = $this->postJson("/api/v1/fleet/drivers/{$driver->id}/settle-cash");
        $settle->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'remainingCashInHandIqd' => 0,
                ],
            ]);
    }

    public function test_erp_webhook_stock_update(): void
    {
        $response = $this->postJson('/api/v1/erp/webhook/stock-update', [
            'updates' => [
                [
                    'productId' => 'p-alrahma',
                    'warehouseId' => 'erbil-central-darkstore',
                    'stockQuantity' => 125,
                    'originalPriceIqd' => 2250,
                ],
            ],
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'processedCount' => 1,
            ]);

        $stock = WarehouseStock::where('warehouse_id', 'erbil-central-darkstore')
            ->where('product_id', 'p-alrahma')
            ->first();

        $this->assertEquals(125, $stock->stock_quantity);
    }
}
