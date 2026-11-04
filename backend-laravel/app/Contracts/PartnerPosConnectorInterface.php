<?php

namespace App\Contracts;

interface PartnerPosConnectorInterface
{
    /**
     * Get connector driver identifier.
     */
    public function getDriverName(): string;

    /**
     * Verify connection readiness to partner supermarket POS database.
     */
    public function testConnection(): array;

    /**
     * Audit 100% shelf price parity against partner supermarket POS master table.
     */
    public function auditShelfPriceParity(): array;

    /**
     * Pull live catalog & shelf prices delta from partner supermarket POS.
     */
    public function syncCatalogDelta(): array;

    /**
     * Push placed order notification to partner supermarket picking/cashier system.
     */
    public function pushOrderToSupermarketPos(array $orderPayload): array;
}

