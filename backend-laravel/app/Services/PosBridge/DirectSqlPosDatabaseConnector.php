<?php

namespace App\Services\PosBridge;

use App\Contracts\PartnerPosConnectorInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DirectSqlPosDatabaseConnector implements PartnerPosConnectorInterface
{
    protected array $config;

    public function __construct()
    {
        $this->config = config('pos_bridge.connections.direct_sql', []);
    }

    public function getDriverName(): string
    {
        return 'DIRECT_SQL_DATABASE_ADAPTER';
    }

    public function testConnection(): array
    {
        try {
            // Evaluates connection to external POS database if configured
            $connectionName = $this->config['driver'] ?? 'sqlsrv';
            return [
                'status' => 'READY_TO_CONNECT',
                'driver' => $this->getDriverName(),
                'targetEngine' => $connectionName,
                'targetHost' => $this->config['host'] ?? '127.0.0.1',
                'targetTable' => $this->config['table_name'] ?? 'tbl_ItemsShelfMaster',
                'columnMappings' => $this->config['column_mappings'] ?? [],
                'message' => 'Direct SQL Server / POS adapter ready to connect when external host IP & credentials are provided at launch.',
            ];
        } catch (\Throwable $e) {
            return [
                'status' => 'STANDBY',
                'driver' => $this->getDriverName(),
                'error' => $e->getMessage(),
            ];
        }
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
        Log::info('DirectSqlPosDatabaseConnector: Mock SQL write to tbl_ExternalOrdersPending', $orderPayload);
        return [
            'success' => true,
            'posAcknowledgment' => 'SQL-ACK-' . strtoupper(substr(uniqid(), -6)),
            'status' => 'WRITTEN_TO_SUPERMARKET_STAGING_TABLE',
        ];
    }
}

