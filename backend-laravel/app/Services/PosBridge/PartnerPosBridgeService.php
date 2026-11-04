<?php

namespace App\Services\PosBridge;

use App\Contracts\PartnerPosConnectorInterface;

class PartnerPosBridgeService
{
    protected PartnerPosConnectorInterface $connector;

    public function __construct()
    {
        $driver = config('pos_bridge.default_driver', 'simulated');

        $this->connector = match ($driver) {
            'direct_sql' => new DirectSqlPosDatabaseConnector(),
            'rest_webhook' => new RestWebhookPosConnector(),
            default => new SimulatedSupermarketPosConnector(),
        };
    }

    public function getConnector(): PartnerPosConnectorInterface
    {
        return $this->connector;
    }

    public function auditParity(): array
    {
        return $this->connector->auditShelfPriceParity();
    }

    public function testConnection(): array
    {
        return $this->connector->testConnection();
    }

    public function syncDelta(): array
    {
        return $this->connector->syncCatalogDelta();
    }

    public function dispatchOrder(array $orderPayload): array
    {
        return $this->connector->pushOrderToSupermarketPos($orderPayload);
    }

    public function pushCompletedOrderToSupermarketPos(\App\Models\Order $order): \App\Models\PosOutboundInvoice
    {
        $existing = \App\Models\PosOutboundInvoice::where('order_id', $order->id)->first();
        if ($existing) {
            return $existing;
        }

        $order->loadMissing(['items.product', 'warehouse']);

        $itemsPayload = [];
        foreach ($order->items as $item) {
            $prod = $item->product;
            $itemsPayload[] = [
                'pos_item_code' => $prod ? ($prod->pos_item_code ?: $prod->external_erp_id) : $item->product_id,
                'barcode' => $prod ? $prod->barcode : '628000000000',
                'title' => $prod ? ($prod->title_en ?: $prod->name) : 'Product Item',
                'quantity' => (int)$item->quantity,
                'pos_shelf_price_iqd' => (int)($item->pos_shelf_unit_price_iqd ?: $item->unit_price_iqd),
                'total_shelf_iqd' => (int)$item->total_iqd,
            ];
        }

        $grossShelfTotal = (int)($order->pos_shelf_subtotal_iqd ?: $order->subtotal_iqd);
        $commission3pct = (int)($order->bazmart_commission_iqd ?: round($grossShelfTotal * 0.03));
        $supermarketNet97pct = (int)($order->supermarket_payable_iqd ?: ($grossShelfTotal - $commission3pct));

        $invoiceNumber = '#POS-INV-' . rand(10000, 99999);
        $terminalRef = 'POS-TERM-SULY-01';

        return \App\Models\PosOutboundInvoice::create([
            'id' => 'pos-inv-' . bin2hex(random_bytes(10)),
            'pos_invoice_number' => $invoiceNumber,
            'order_id' => $order->id,
            'warehouse_id' => $order->warehouse_id ?: 'suly-main-darkstore',
            'items_payload' => $itemsPayload,
            'gross_shelf_total_iqd' => $grossShelfTotal,
            'bazmart_commission_3pct_iqd' => $commission3pct,
            'supermarket_net_97pct_iqd' => $supermarketNet97pct,
            'sync_status' => 'SYNCED_TO_PARTNER_POS',
            'pos_terminal_ref' => $terminalRef,
            'synced_at' => now(),
        ]);
    }
}

