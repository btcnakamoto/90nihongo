<?php

/**
 * 快速测试脚本 - 验证数据库表API
 */

echo "=== 快速API测试 ===\n";

// 测试API端点是否可访问
$apiUrl = 'http://127.0.0.1:8000/admin/database/tables';
echo "测试API端点: $apiUrl\n";

// 简单的HTTP请求测试
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);

curl_close($ch);

echo "HTTP状态码: $httpCode\n";

if ($error) {
    echo "❌ 网络错误: $error\n";
    echo "请确保Laravel服务器正在运行: php artisan serve\n";
} elseif ($httpCode === 401) {
    echo "✅ API端点存在 (需要认证，这是正常的)\n";
    echo "前端应用会自动处理认证\n";
} elseif ($httpCode === 200) {
    echo "✅ API端点工作正常\n";
    $data = json_decode($response, true);
    if (isset($data['data'])) {
        echo "返回了 " . count($data['data']) . " 个表的信息\n";
    }
} else {
    echo "⚠️  HTTP状态码: $httpCode\n";
    echo "响应: $response\n";
}

echo "\n=== 测试完成 ===\n";
echo "\n下一步:\n";
echo "1. 确保Laravel服务器运行: php artisan serve\n";
echo "2. 打开前端管理页面\n";
echo "3. 查看'所有表列表'选项卡\n";
echo "4. 确认显示'实时数据'徽章\n"; 