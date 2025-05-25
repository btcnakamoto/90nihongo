<?php
/**
 * 简单的资源管理API测试
 */

echo "=== 资源管理API测试 ===\n\n";

// 测试API端点
$baseUrl = 'http://127.0.0.1:8000/api/admin';
$endpoints = [
    'stats' => '/resources/stats',
    'resources' => '/resources?page=1&per_page=5',
    'tasks' => '/resources/tasks?page=1&per_page=5'
];

// 模拟认证token（实际使用中需要真实token）
$token = 'test-token';

foreach ($endpoints as $name => $endpoint) {
    echo "测试 $name API...\n";
    
    $url = $baseUrl . $endpoint;
    $ch = curl_init();
    
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json',
        'Authorization: Bearer ' . $token
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        echo "✗ cURL错误: $error\n";
    } else {
        echo "HTTP状态码: $httpCode\n";
        
        if ($httpCode === 200) {
            $data = json_decode($response, true);
            if ($data) {
                echo "✓ 响应解析成功\n";
                echo "状态: " . ($data['status'] ?? 'N/A') . "\n";
                if (isset($data['data'])) {
                    echo "数据类型: " . gettype($data['data']) . "\n";
                }
            } else {
                echo "✗ JSON解析失败\n";
                echo "原始响应: " . substr($response, 0, 200) . "...\n";
            }
        } else {
            echo "✗ HTTP错误\n";
            echo "响应: " . substr($response, 0, 200) . "...\n";
        }
    }
    
    echo "\n";
}

// 测试Laravel服务器是否运行
echo "测试Laravel服务器状态...\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://127.0.0.1:8000');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
curl_setopt($ch, CURLOPT_NOBODY, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    echo "✗ Laravel服务器无法访问: $error\n";
    echo "请确保运行: php artisan serve\n";
} else {
    echo "✓ Laravel服务器运行正常 (HTTP $httpCode)\n";
}

echo "\n=== 测试完成 ===\n"; 