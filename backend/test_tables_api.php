<?php

/**
 * 测试数据库表API
 * 测试新添加的 /admin/database/tables 接口
 */

// API配置
$baseUrl = 'http://127.0.0.1:8000/admin';
$username = 'admin';  // 替换为实际的管理员用户名
$password = 'password';  // 替换为实际的管理员密码

echo "=== 数据库表API测试 ===\n\n";

// 1. 登录获取token
echo "1. 正在登录...\n";
$loginData = [
    'username' => $username,
    'password' => $password
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
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$loginResponse = curl_exec($ch);
$loginHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_error($ch)) {
    echo "登录请求失败: " . curl_error($ch) . "\n";
    curl_close($ch);
    exit(1);
}

curl_close($ch);

echo "登录响应状态码: $loginHttpCode\n";
echo "登录响应: $loginResponse\n\n";

$loginData = json_decode($loginResponse, true);

if ($loginHttpCode !== 200 || !isset($loginData['token'])) {
    echo "登录失败，请检查用户名和密码\n";
    exit(1);
}

$token = $loginData['token'];
echo "登录成功，获取到token\n\n";

// 2. 测试获取数据库表信息
echo "2. 正在获取数据库表信息...\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl . '/database/tables');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token,
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$tablesResponse = curl_exec($ch);
$tablesHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_error($ch)) {
    echo "获取表信息失败: " . curl_error($ch) . "\n";
    curl_close($ch);
    exit(1);
}

curl_close($ch);

echo "获取表信息响应状态码: $tablesHttpCode\n";
echo "获取表信息响应: $tablesResponse\n\n";

$tablesData = json_decode($tablesResponse, true);

if ($tablesHttpCode === 200 && isset($tablesData['code']) && $tablesData['code'] === 200) {
    echo "✅ API测试成功！\n";
    echo "表数量: " . count($tablesData['data']) . "\n\n";
    
    // 显示前5个表的信息
    echo "前5个表的详细信息:\n";
    echo str_repeat('-', 80) . "\n";
    printf("%-20s %-10s %-10s %-15s %-15s\n", "表名", "引擎", "记录数", "数据大小", "索引大小");
    echo str_repeat('-', 80) . "\n";
    
    $count = 0;
    foreach ($tablesData['data'] as $table) {
        if ($count >= 5) break;
        
        printf("%-20s %-10s %-10s %-15s %-15s\n",
            substr($table['table_name'], 0, 19),
            substr($table['engine'], 0, 9),
            number_format($table['rows']),
            $table['size_human'],
            round($table['index_length'] / 1024, 1) . ' KB'
        );
        $count++;
    }
    
    echo str_repeat('-', 80) . "\n";
    echo "总计: " . count($tablesData['data']) . " 个表\n";
    
    // 计算总大小
    $totalSize = array_sum(array_column($tablesData['data'], 'total_size'));
    echo "总大小: " . round($totalSize / 1024 / 1024, 2) . " MB\n";
    
} else {
    echo "❌ API测试失败！\n";
    echo "错误信息: " . ($tablesData['message'] ?? '未知错误') . "\n";
}

echo "\n=== 测试完成 ===\n"; 