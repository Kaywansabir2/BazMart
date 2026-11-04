<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\WarehouseStock;
use App\Models\SupportTicket;
use App\Models\StockAlertSubscription;
use App\Models\Notification;
use App\Models\FinancialLedgerEntry;

class Step14TalabatCustomerLifecycleTest extends TestCase
{
    public function test_customer_auth_lifecycle_and_onboarding(): void
    {
        // Clean test customer
        Customer::where('phone', '+9647501112233')->delete();

        // 1. Request OTP for new number
        $phone = '07501112233';
        $res1 = $this->postJson('/api/v1/auth/request-otp', ['phone' => $phone]);
        $res1->assertStatus(200)
            ->assertJson(['success' => true, 'normalizedPhone' => '+9647501112233']);

        // 2. Verify OTP -> Should flag isNewUser: true
        $res2 = $this->postJson('/api/v1/auth/verify-otp', [
            'phone' => '+9647501112233',
            'otpCode' => '123456',
        ]);
        $res2->assertStatus(200)
            ->assertJson([
                'success' => true,
                'isNewUser' => true,
            ]);

        $token = $res2->json('accessToken');
        $this->assertNotEmpty($token);

        // 3. Complete Registration
        $res3 = $this->postJson('/api/v1/auth/complete-registration', [
            'phone' => '+9647501112233',
            'name' => 'Saman Rekani',
            'email' => 'saman.rekani@bazmart.iq',
            'preferredLanguage' => 'ckb',
            'address' => [
                'city' => 'Sulaymaniyah',
                'neighborhood' => 'Bakhtiari',
                'street' => 'Street 14',
                'building' => 'Building 5',
            ],
        ]);
        $res3->assertStatus(200)
            ->assertJson([
                'success' => true,
                'customer' => [
                    'name' => 'Saman Rekani',
                    'email' => 'saman.rekani@bazmart.iq',
                    'preferredLanguage' => 'ckb',
                    'isOnboarded' => true,
                ],
            ]);

        // 4. Merge Guest Cart & Favorites
        $res4 = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/customer/sync-guest-state', [
                'favoriteProductIds' => ['p-cucumber', 'p-pen'],
            ]);
        $res4->assertStatus(200)
            ->assertJson(['success' => true, 'syncedFavoritesCount' => 2]);

        // 5. Verify favorites retrieval
        $resFav = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/customer/favorites');
        $resFav->assertStatus(200);
        $this->assertCount(2, $resFav->json('data'));

        // 6. Logout
        $res5 = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/auth/logout');
        $res5->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_wallet_checkout_and_rider_tip(): void
    {
        $customer = Customer::where('phone', '+9647701234567')->firstOrFail();
        $customer->update(['wallet_balance_iqd' => 5000]);

        $initialWallet = (int)$customer->fresh()->wallet_balance_iqd;
        $this->assertEquals(5000, $initialWallet);

        // Place Order using Wallet + Rider Tip (1000 IQD) + unavailable preference
        $payload = [
            'customerPhone' => $customer->phone,
            'warehouseId' => 'erbil-central-darkstore',
            'items' => [
                ['productId' => 'p-cucumber', 'quantity' => 5], // 1445 * 5 = 7225
                ['productId' => 'p-pen', 'quantity' => 2],      // 400 * 2 = 800 -> Subtotal = 8025
            ],
            'riderTipIqd' => 1000,
            'unavailableItemPreference' => 'REPLACE_WITH_BEST_MATCH',
            'deliveryDropoffOptions' => ['leaveAtDoor' => true, 'doNotRingBell' => true],
            'useWallet' => true,
            'address' => [
                'latitude' => 36.1911,
                'longitude' => 44.0092,
                'city' => 'Erbil',
                'neighborhood' => 'Dream City',
            ],
        ];

        $res = $this->postJson('/api/v1/orders', $payload);
        $res->assertStatus(201);
        $order = $res->json('data.order') ?? $res->json('order');

        // Total = 8025 + 1000 = 9025
        // Wallet applied = 5000, Net COD = 4025
        $this->assertEquals(9025, $order['totalIqd'] ?? $order['total_iqd']);
        $this->assertEquals(1000, $order['riderTipIqd'] ?? $order['rider_tip_iqd']);
        $this->assertEquals('REPLACE_WITH_BEST_MATCH', $order['unavailableItemPreference'] ?? $order['unavailable_item_preference']);
        $this->assertEquals(5000, $order['walletAmountUsedIqd'] ?? $order['wallet_amount_used_iqd']);
        $this->assertEquals(4025, $order['netCodPayableIqd'] ?? $order['net_cod_payable_iqd']);
        $this->assertEquals('COD', $order['paymentMethod'] ?? $order['payment_method']);

        // Verify customer wallet balance is now 0
        $this->assertEquals(0, (int)$customer->fresh()->wallet_balance_iqd);

        // Verify wallet transaction ledger row
        $tx = \App\Models\WalletTransaction::where('customer_id', $customer->id)
            ->where('type', 'CHECKOUT_PAYMENT_DEDUCTION')
            ->first();
        $this->assertNotNull($tx);
        $this->assertEquals(5000, $tx->amount_iqd);
        $this->assertEquals('DEBIT', $tx->direction);
    }

    public function test_stock_alert_and_automatic_restock_notification(): void
    {
        // Reset stock to 0 and clean alert subscriptions
        StockAlertSubscription::where('product_id', 'p-eggs')->delete();
        WarehouseStock::where('product_id', 'p-eggs')->update(['stock_quantity' => 0]);

        // 1. Subscribe to out-of-stock item
        $res1 = $this->postJson('/api/v1/catalog/products/p-eggs/notify-when-available', [
            'phone' => '+9647701234567',
            'warehouseId' => 'erbil-central-darkstore',
        ]);
        $res1->assertStatus(200)->assertJson(['success' => true]);

        $sub = StockAlertSubscription::where('product_id', 'p-eggs')
            ->where('customer_phone', '+9647701234567')
            ->first();
        $this->assertNotNull($sub);
        $this->assertEquals('WAITING', $sub->status);

        // 2. Replenish stock via Admin Catalog API
        $res2 = $this->putJson('/api/v1/admin/catalog/p-eggs', [
            'stockQuantity' => 45,
            'warehouseId' => 'erbil-central-darkstore',
        ]);
        $res2->assertStatus(200);

        // 3. Verify subscription flipped to NOTIFIED
        $this->assertEquals('NOTIFIED', $sub->fresh()->status);

        // 4. Verify Notification was fired
        $notif = Notification::where('customer_phone', '+9647701234567')
            ->where('type', 'BACK_IN_STOCK')
            ->latest()
            ->first();
        $this->assertNotNull($notif);
        $this->assertStringContainsString('Back in Stock', $notif->title_en);
    }

    public function test_support_ticket_reporting_and_admin_wallet_refund(): void
    {
        $customer = Customer::where('phone', '+9647701234567')->firstOrFail();
        $customer->update(['wallet_balance_iqd' => 5000]);
        $order = Order::where('customer_phone', $customer->phone)->firstOrFail();

        $initialWallet = (int)$customer->fresh()->wallet_balance_iqd;

        // 1. Customer reports issue
        $res1 = $this->withHeader('x-customer-phone', $customer->phone)
            ->postJson("/api/v1/customer/orders/{$order->id}/report-issue", [
                'issueCategory' => 'DAMAGED_OR_SPOILED_ITEM',
                'requestedRefundIqd' => 3500,
                'customerNote' => 'Two juice containers arrived damaged.',
            ]);
        $res1->assertStatus(201)->assertJson(['success' => true]);
        $ticketId = $res1->json('ticket.id');

        // 2. Admin approves and refunds to customer wallet
        $res2 = $this->postJson("/api/v1/admin/support-tickets/{$ticketId}/resolve", [
            'action' => 'approve',
            'adminResolutionNote' => 'Verified with driver. Refund approved to wallet.',
        ]);
        $res2->assertStatus(200)
            ->assertJson([
                'success' => true,
                'ticket' => [
                    'status' => 'APPROVED_REFUNDED_TO_WALLET',
                ],
            ]);

        // 3. Verify Customer wallet balance increased by 3500
        $this->assertEquals($initialWallet + 3500, (int)$customer->fresh()->wallet_balance_iqd);

        // 4. Verify Financial ledger entry
        $ledger = FinancialLedgerEntry::where('entry_type', 'CUSTOMER_REFUND')->latest()->first();
        $this->assertNotNull($ledger);
        $this->assertEquals(3500, $ledger->amount_iqd);
        $this->assertEquals('DEBIT', $ledger->direction);
    }

    public function test_account_deletion_anonymization(): void
    {
        Customer::where('phone', '+9647509876543')->delete();

        $customer = Customer::create([
            'id' => 'cust-test-delete',
            'phone' => '+9647509876543',
            'name' => 'To Be Deleted',
            'email' => 'delete.me@bazmart.iq',
            'api_token' => 'token-test-del',
            'status' => 'ACTIVE',
        ]);

        $res = $this->withHeader('x-customer-phone', $customer->phone)
            ->deleteJson('/api/v1/customer/account');

        $res->assertStatus(200)->assertJson(['success' => true]);

        $customer->refresh();
        $this->assertEquals('DEACTIVATED', $customer->status);
        $this->assertNull($customer->email);
        $this->assertNull($customer->api_token);
        $this->assertStringContainsString('Deactivated User', $customer->name);
    }
}
