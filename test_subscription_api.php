<?php

// 测试订阅API功能
$baseUrl = 'http://127.0.0.1:8000/admin';

// 测试登录获取token
function login() {
    global $baseUrl;
    
    $loginData = [
        'account' => 'admin@90nihongo.com',
        'password' => 'admin123'
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $baseUrl . '/login');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($loginData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json'
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        $data = json_decode($response, true);
        return $data['token'] ?? null;
    }
    
    echo "登录失败 (HTTP $httpCode): " . $response . "\n";
    return null;
}

// 测试获取订阅计划
function getSubscriptionPlans($token) {
    global $baseUrl;
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $baseUrl . '/subscriptions/plans');
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token,
        'Accept: application/json'
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "获取订阅计划 (HTTP $httpCode):\n";
    echo $response . "\n\n";
}

// 测试获取订阅统计
function getSubscriptionStats($token) {
    global $baseUrl;
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $baseUrl . '/subscriptions/stats');
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token,
        'Accept: application/json'
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "获取订阅统计 (HTTP $httpCode):\n";
    echo $response . "\n\n";
}

// 测试获取用户列表（包含订阅信息）
function getUsers($token) {
    global $baseUrl;
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $baseUrl . '/users?per_page=5');
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token,
        'Accept: application/json'
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "获取用户列表 (HTTP $httpCode):\n";
    echo $response . "\n\n";
}

// 主测试流程
echo "=== 90nihongo 订阅系统API测试 ===\n\n";

// 1. 登录
echo "1. 正在登录...\n";
$token = login();

if (!$token) {
    echo "登录失败，无法继续测试\n";
    exit(1);
}

echo "登录成功，获取到token: " . substr($token, 0, 20) . "...\n\n";

// 2. 测试订阅计划API
echo "2. 测试订阅计划API\n";
getSubscriptionPlans($token);

// 3. 测试订阅统计API
echo "3. 测试订阅统计API\n";
getSubscriptionStats($token);

// 4. 测试用户列表API（包含订阅信息）
echo "4. 测试用户列表API\n";
getUsers($token);

echo "=== 测试完成 ===\n";
?> 