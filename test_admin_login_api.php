<?php
/**
 * 测试管理员登录和资源管理API访问
 */

echo "=== 测试管理员登录和API访问 ===\n\n";

// 测试登录API
echo "1. 测试管理员登录API...\n";

$loginData = [    'account' => 'superadmin',  // AuthController期望'account'字段    'password' => 'admin123456'];$loginUrl = 'http://localhost:8000/admin/login';  // 正确的路由URL

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $loginUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($loginData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$loginResponse = curl_exec($ch);
$loginHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_error($ch)) {
    echo "✗ cURL错误: " . curl_error($ch) . "\n";
    curl_close($ch);
    exit(1);
}

curl_close($ch);

echo "登录HTTP状态码: $loginHttpCode\n";

if ($loginHttpCode === 200) {
    echo "✓ 登录成功\n";
    $loginData = json_decode($loginResponse, true);
    
    if (isset($loginData['token'])) {
        $token = $loginData['token'];
        echo "✓ 获取到访问令牌\n\n";
        
        // 测试资源管理API
        echo "2. 测试资源统计API（带认证）...\n";
        
        $statsUrl = 'http://localhost:8000/api/admin/resources/stats';
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $statsUrl);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $token,
            'Accept: application/json'
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        
        $statsResponse = curl_exec($ch);
        $statsHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        echo "统计API HTTP状态码: $statsHttpCode\n";
        
        if ($statsHttpCode === 200) {
            echo "✓ 资源统计API访问成功\n";
            $statsData = json_decode($statsResponse, true);
            
            if (isset($statsData['data'])) {
                $stats = $statsData['data'];
                echo "  - 总资源数: " . ($stats['total_resources'] ?? 'N/A') . "\n";
                echo "  - 完成资源: " . ($stats['completed_resources'] ?? 'N/A') . "\n";
                echo "  - 活跃任务: " . ($stats['active_tasks'] ?? 'N/A') . "\n";
                echo "  - 成功率: " . ($stats['success_rate'] ?? 'N/A') . "%\n";
            }
        } else {
            echo "✗ 资源统计API访问失败\n";
            echo "响应: " . substr($statsResponse, 0, 200) . "...\n";
        }
        
        echo "\n3. 测试资源列表API（带认证）...\n";
        
        $resourcesUrl = 'http://localhost:8000/api/admin/resources';
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $resourcesUrl);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $token,
            'Accept: application/json'
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        
        $resourcesResponse = curl_exec($ch);
        $resourcesHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        echo "资源列表API HTTP状态码: $resourcesHttpCode\n";
        
        if ($resourcesHttpCode === 200) {
            echo "✓ 资源列表API访问成功\n";
            $resourcesData = json_decode($resourcesResponse, true);
            
            if (isset($resourcesData['data']['data'])) {
                $resources = $resourcesData['data']['data'];
                echo "  - 返回资源数量: " . count($resources) . "\n";
                
                if (count($resources) > 0) {
                    echo "  - 第一个资源: " . ($resources[0]['name'] ?? 'N/A') . "\n";
                }
            }
        } else {
            echo "✗ 资源列表API访问失败\n";
            echo "响应: " . substr($resourcesResponse, 0, 200) . "...\n";
        }
        
    } else {
        echo "✗ 登录响应中没有token\n";
        echo "响应: " . substr($loginResponse, 0, 200) . "...\n";
    }
} else {
    echo "✗ 登录失败\n";
    echo "响应: " . substr($loginResponse, 0, 200) . "...\n";
}

echo "\n=== 测试完成 ===\n";
echo "\n如果登录API不存在，请使用以下账户通过前端登录:\n";
echo "用户名: superadmin\n";
echo "密码: admin123456\n"; 