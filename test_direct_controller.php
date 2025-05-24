<?php
/**
 * 直接测试ResourceController（绕过认证）
 */

require_once 'backend/vendor/autoload.php';

// 模拟Laravel环境
$app = require_once 'backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Http\Controllers\Admin\ResourceController;
use Illuminate\Http\Request;

echo "=== 直接测试ResourceController ===\n\n";

try {
    $controller = new ResourceController();

    // 测试获取统计信息
    echo "1. 测试获取统计信息...\n";
    $response = $controller->getStats();
    $data = json_decode($response->getContent(), true);
    
    echo "HTTP状态码: " . $response->getStatusCode() . "\n";
    echo "响应状态: " . ($data['status'] ?? 'N/A') . "\n";
    
    if ($data['status'] === 'success' && isset($data['data'])) {
        $stats = $data['data'];
        echo "✓ 统计信息获取成功:\n";
        echo "  - 总资源数: " . $stats['total_resources'] . "\n";
        echo "  - 完成资源: " . $stats['completed_resources'] . "\n";
        echo "  - 失败资源: " . $stats['failed_resources'] . "\n";
        echo "  - 活跃任务: " . $stats['active_tasks'] . "\n";
        echo "  - 总存储: " . $stats['total_size'] . "\n";
        echo "  - 成功率: " . $stats['success_rate'] . "%\n";
        echo "  - 最近活动数量: " . count($stats['recent_activities']) . "\n";
    } else {
        echo "✗ 获取失败: " . ($data['message'] ?? '未知错误') . "\n";
    }
    
    echo "\n";

    // 测试获取资源列表
    echo "2. 测试获取资源列表...\n";
    $request = new Request(['per_page' => 5]);
    $response = $controller->index($request);
    $data = json_decode($response->getContent(), true);
    
    echo "HTTP状态码: " . $response->getStatusCode() . "\n";
    echo "响应状态: " . ($data['status'] ?? 'N/A') . "\n";
    
    if ($data['status'] === 'success' && isset($data['data'])) {
        $resources = $data['data']['data'] ?? [];
        echo "✓ 资源列表获取成功:\n";
        echo "  - 返回资源数量: " . count($resources) . "\n";
        
        if (!empty($resources)) {
            echo "  - 示例资源:\n";
            foreach (array_slice($resources, 0, 3) as $resource) {
                echo "    * " . ($resource['name'] ?? 'N/A') . " (" . ($resource['type'] ?? 'N/A') . ") - " . ($resource['status'] ?? 'N/A') . "\n";
            }
        }
    } else {
        echo "✗ 获取失败: " . ($data['message'] ?? '未知错误') . "\n";
    }
    
    echo "\n";

    // 测试获取任务列表
    echo "3. 测试获取任务列表...\n";
    $request = new Request(['per_page' => 5]);
    $response = $controller->getTasks($request);
    $data = json_decode($response->getContent(), true);
    
    echo "HTTP状态码: " . $response->getStatusCode() . "\n";
    echo "响应状态: " . ($data['status'] ?? 'N/A') . "\n";
    
    if ($data['status'] === 'success' && isset($data['data'])) {
        $tasks = $data['data']['data'] ?? [];
        echo "✓ 任务列表获取成功:\n";
        echo "  - 返回任务数量: " . count($tasks) . "\n";
        
        if (!empty($tasks)) {
            echo "  - 示例任务:\n";
            foreach (array_slice($tasks, 0, 3) as $task) {
                echo "    * " . ($task['name'] ?? 'N/A') . " (" . ($task['status'] ?? 'N/A') . ") - " . ($task['progress'] ?? 0) . "%\n";
            }
        }
    } else {
        echo "✗ 获取失败: " . ($data['message'] ?? '未知错误') . "\n";
    }

    echo "\n=== 测试完成 ===\n";

} catch (Exception $e) {
    echo "✗ 测试过程中发生错误: " . $e->getMessage() . "\n";
    echo "错误位置: " . $e->getFile() . ":" . $e->getLine() . "\n";
} 