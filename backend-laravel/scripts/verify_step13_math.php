<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$fs = app(App\Services\FinancialAccountingService::class);
$sum = $fs->getFinancialSummary(null, '7days');
echo "=== FINANCIAL SUMMARY AUDIT ===\n";
echo "Net Basket Revenue: IQD " . number_format($sum['netBasketRevenueIqd']) . "\n";
echo "Total COGS: IQD " . number_format($sum['totalCogsIqd']) . "\n";
echo "COGS Ratio: " . round(($sum['totalCogsIqd'] / max(1, $sum['netBasketRevenueIqd'])) * 100, 2) . "%\n";
echo "Gross Profit: IQD " . number_format($sum['grossProfitIqd']) . "\n";
echo "Gross Margin: " . $sum['grossMarginPercent'] . "%\n";
echo "Total Deductions: IQD " . number_format($sum['totalDeductionsIqd']) . "\n";
echo "Net Operating Profit: IQD " . number_format($sum['netOperatingProfitIqd']) . "\n";
echo "Net Margin: " . $sum['netMarginPercent'] . "%\n";

echo "\n=== SUPPLY CHAIN OVERVIEW AUDIT ===\n";
$sc = app(App\Services\SupplyChainAndBatchService::class);
$scOv = $sc->getOverview();
echo "Active Suppliers: " . $scOv['activeSuppliersCount'] . "\n";
echo "Open POs: " . $scOv['openPurchaseOrdersCount'] . "\n";
echo "Total Batch Inventory Value: IQD " . number_format($scOv['totalInventoryValueCostIqd']) . "\n";
echo "Near Expiry Batches (< 7 Days): " . $scOv['nearExpiryBatchesCount'] . "\n";
echo "Quarantined Value: IQD " . number_format($scOv['quarantinedValueIqd']) . "\n";

echo "\n=== CANONICAL SKU MARGINS AUDIT ===\n";
$skus = ['ERP-SKU-1005', 'ERP-SKU-1006', 'ERP-SKU-1007', 'ERP-SKU-1008', 'ERP-SKU-1012', 'ERP-SKU-1013', 'ERP-SKU-1014', 'ERP-SKU-1016'];
$allSkuMargins = $fs->getSkuMargins();
foreach ($allSkuMargins as $item) {
    if (in_array($item['externalErpId'], $skus)) {
        echo sprintf(
            "[%s] %-30s | Active: IQD %-6d | Cost: IQD %-6d | Profit: IQD %-5d | Margin: %5.2f%%\n",
            $item['externalErpId'],
            substr($item['titleEn'], 0, 30),
            $item['activePriceIqd'],
            $item['costPriceIqd'],
            $item['unitProfitIqd'],
            $item['marginPercent']
        );
    }
}

