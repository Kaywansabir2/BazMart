<?php

$file = __DIR__ . '/../database/seeders/data/coupons.json';
$coupons = json_decode(file_get_contents($file), true);
foreach ($coupons as &$c) {
    if (is_numeric($c['expires_at'])) {
        $sec = $c['expires_at'] > 20000000000 ? (int)($c['expires_at'] / 1000) : (int)$c['expires_at'];
        $c['expires_at'] = date('Y-m-d H:i:s', $sec);
    }
    if (is_numeric($c['starts_at'])) {
        $sec = $c['starts_at'] > 20000000000 ? (int)($c['starts_at'] / 1000) : (int)$c['starts_at'];
        $c['starts_at'] = date('Y-m-d H:i:s', $sec);
    }
}
file_put_contents($file, json_encode($coupons, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
echo "Coupons JSON dates normalized\n";

