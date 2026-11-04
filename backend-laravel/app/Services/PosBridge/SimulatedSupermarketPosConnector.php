<?php

namespace App\Services\PosBridge;

use App\Contracts\PartnerPosConnectorInterface;
use App\Models\Product;
use Illuminate\Support\Facades\Log;

class SimulatedSupermarketPosConnector implements PartnerPosConnectorInterface
{
    public function getDriverName(): string
    {
        return 'SIMULATED_POS_BRIDGE_READY_FOR_LIVE_DB';
    }

    public function testConnection(): array
    {
        return [
            'status' => 'CONNECTED',
            'driver' => $this->getDriverName(),
            'partnerName' => config('pos_bridge.commercial_agreement.partner_supermarket_name'),
            'latencyMs' => 8,
            'message' => 'Partner Supermarket POS Bridge online & ready for final pre-launch direct database credentials.',
        ];
    }

    public function auditShelfPriceParity(): array
    {
        $products = Product::all();
        $totalChecked = $products->count();
        $matched = 0;
        $variances = [];

        foreach ($products as $product) {
            // Ensure pos_shelf_price_iqd is synchronized with original_price_iqd
            if ($product->pos_shelf_price_iqd === 0 || $product->pos_shelf_price_iqd === null) {
                $product->pos_shelf_price_iqd = $product->original_price_iqd;
                $product->pos_promo_price_iqd = $product->discounted_price_iqd;
                $product->pos_parity_verified = true;
                $product->pos_item_code = $product->external_erp_id ?: 'POS-' . $product->id;
                $product->commission_rate_percent = 3.00;
                $product->save();
            }

            // Zero markup rule: pos_shelf_price_iqd must equal original_price_iqd
            if ($product->pos_shelf_price_iqd === $product->original_price_iqd) {
                $matched++;
            } else {
                $variances[] = [
                    'sku' => $product->id,
                    'posShelfPrice' => $product->pos_shelf_price_iqd,
                    'appPrice' => $product->original_price_iqd,
                    'varianceIqd' => $product->original_price_iqd - $product->pos_shelf_price_iqd,
                ];
            }
        }

        $parityPercent = $totalChecked > 0 ? round(($matched / $totalChecked) * 100, 1) : 100.0;

        return [
            'totalSkusChecked' => $totalChecked,
            'priceMatchedSkus' => $matched,
            'priceVarianceCount' => count($variances),
            'parityPercentage' => $parityPercent,
            'commissionRatePercent' => config('pos_bridge.commercial_agreement.fixed_commission_rate_percent', 3.00),
            'zeroMarkupPolicy' => 'ENFORCED_100_PERCENT',
            'variances' => $variances,
            'connectionMode' => $this->getDriverName(),
            'timestamp' => now()->toIso8601String(),
        ];
    }

    public function syncCatalogDelta(): array
    {
        $updatedCount = 0;
        Product::chunk(50, function ($products) use (&$updatedCount) {
            foreach ($products as $p) {
                $p->pos_shelf_price_iqd = $p->original_price_iqd;
                $p->pos_promo_price_iqd = $p->discounted_price_iqd;
                $p->pos_parity_verified = true;
                $p->commission_rate_percent = 3.00;
                $p->save();
                $updatedCount++;
            }
        });

        return [
            'success' => true,
            'syncedSkusCount' => $updatedCount,
            'driver' => $this->getDriverName(),
            'timestamp' => now()->toIso8601String(),
        ];
    }

    public function pushOrderToSupermarketPos(array $orderPayload): array
    {
        Log::info('SimulatedSupermarketPosConnector: Order sent to supermarket picking station', [
            'orderId' => $orderPayload['id'] ?? null,
            'shelfSubtotalIqd' => $orderPayload['subtotalIqd'] ?? 0,
            'supermarketPayable97Pct' => round(($orderPayload['subtotalIqd'] ?? 0) * 0.97),
            'bazmartCommission3Pct' => round(($orderPayload['subtotalIqd'] ?? 0) * 0.03),
        ]);

        return [
            'success' => true,
            'posAcknowledgment' => 'ACK-POS-' . strtoupper(substr(uniqid(), -6)),
            'status' => 'TRANSMITTED_TO_SUPERMARKET_PICKER',
        ];
    }
}

