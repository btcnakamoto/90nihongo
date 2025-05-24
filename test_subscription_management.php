<?php

// 测试订阅管理功能
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

// 测试获取即将到期的订阅
function getExpiringSubscriptions($token) {
    global $baseUrl;
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $baseUrl . '/subscriptions/expiring?days=30');
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token,
        'Accept: application/json'
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "获取即将到期订阅 (HTTP $httpCode):\n";
    echo $response . "\n\n";
}

// 测试获取推荐统计
function getReferralStats($token) {
    global $baseUrl;
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $baseUrl . '/subscriptions/referrals/stats');
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token,
        'Accept: application/json'
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "获取推荐统计 (HTTP $httpCode):\n";
    echo $response . "\n\n";
}

// 运行测试
echo "=== 订阅管理功能测试 ===\n\n";

$token = login();
if (!$token) {
    echo "无法获取认证令牌，测试终止\n";
    exit(1);
}

echo "登录成功，开始测试订阅管理功能...\n\n";

// 测试各个API端点
getSubscriptionPlans($token);
getSubscriptionStats($token);
getExpiringSubscriptions($token);
getReferralStats($token);

echo "=== 测试完成 ===\n"; 