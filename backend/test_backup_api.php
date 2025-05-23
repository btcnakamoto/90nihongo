<?php

/**
 * 数据库备份API测试脚本
 */

echo "=== 90日语数据库备份API测试 ===\n\n";

// 测试数据库状态接口
echo "1. 测试数据库状态接口...\n";
$statusUrl = "http://127.0.0.1:8000/admin/database/status";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $statusUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "   HTTP状态码: $httpCode\n";
if ($response) {
    $data = json_decode($response, true);
    echo "   响应: " . json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
} else {
    echo "   请求失败\n";
}

echo "\n2. 测试备份列表接口...\n";
$backupsUrl = "http://127.0.0.1:8000/admin/database/backups";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $backupsUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "   HTTP状态码: $httpCode\n";
if ($response) {
    $data = json_decode($response, true);
    echo "   响应: " . json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
} else {
    echo "   请求失败\n";
}

echo "\n=== 测试完成 ===\n";
echo "注意：这些接口需要认证，所以会返回401未授权错误，这是正常的。\n";
echo "在实际使用中，需要先通过 /admin/login 获取认证token。\n"; 