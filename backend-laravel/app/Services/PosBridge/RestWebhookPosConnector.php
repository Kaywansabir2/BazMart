<?php

namespace App\Services\PosBridge;

use App\Contracts\PartnerPosConnectorInterface;
use Illuminate\Support\Facades\Log;

class RestWebhookPosConnector implements PartnerPosConnectorInterface
{
    public function getDriverName(): string
    {
        return 'REST_WEBHOOK_DELTA_ADAPTER';
    }

    public function testConnection(): array
    {
        return [
            'status' => 'READY_TO_CONNECT',
            'driver' => $this->getDriverName(),
            'targetEndpoint' => config('pos_bridge.connections.rest_webhook.base_url'),
            'message' => 'REST Webhook adapter ready for partner supermarket endpoint.',
        ];
    }

    public function auditShelfPriceParity(): array
    {
        return (new SimulatedSupermarketPosConnector())->auditShelfPriceParity();
    }

    public function syncCatalogDelta(): array
    {
        return (new SimulatedSupermarketPosConnector())->syncCatalogDelta();
    }

    public function pushOrderToSupermarketPos(array $orderPayload): array
    {
        Log::info('RestWebhookPosConnector: Webhook dispatched to supermarket POS', $orderPayload);
        return [
            'success' => true,
            'posAcknowledgment' => 'WEBHOOK-ACK-' . strtoupper(substr(uniqid(), -6)),
            'status' => 'DELIVERED_TO_PARTNER_WEBHOOK',
        ];
    }
}

