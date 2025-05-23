<?php

/**
 * 数据库备份功能测试脚本
 * 
 * 运行命令: php database_backup_test.php
 */

require_once __DIR__ . '/vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\DB;
use App\Services\DatabaseBackupService;

// 创建Laravel应用实例
$app = new Application(__DIR__);

// 在Laravel 12中，不需要手动绑定Kernel类
// 应用会自动处理这些配置

// 启动应用的核心服务
$app->singleton('app', function() use ($app) {
    return $app;
});

// 绑定必要的服务
$app->singleton(
    Illuminate\Contracts\Foundation\Application::class,
    function() use ($app) {
        return $app;
    }
);

// 加载配置和服务
$app->bootstrapWith([
    \Illuminate\Foundation\Bootstrap\LoadEnvironmentVariables::class,
    \Illuminate\Foundation\Bootstrap\LoadConfiguration::class,
    \Illuminate\Foundation\Bootstrap\HandleExceptions::class,
    \Illuminate\Foundation\Bootstrap\RegisterFacades::class,
    \Illuminate\Foundation\Bootstrap\RegisterProviders::class,
    \Illuminate\Foundation\Bootstrap\BootProviders::class,
]);

echo "=== 90日语数据库备份功能测试 ===\n\n";

try {
    // 创建备份服务实例
    $backupService = $app->make(DatabaseBackupService::class);
    
    echo "1. 获取数据库状态...\n";
    $connection = DB::connection();
    echo "   数据库类型: " . $connection->getDriverName() . "\n";
    echo "   数据库名称: " . $connection->getDatabaseName() . "\n";
    
    echo "\n2. 获取现有备份列表...\n";
    $backupList = $backupService->getBackupList();
    if ($backupList['success']) {
        echo "   现有备份数量: " . count($backupList['data']) . "\n";
        if (!empty($backupList['data'])) {
            echo "   最新备份: " . $backupList['data'][0]['filename'] . "\n";
        }
    } else {
        echo "   获取备份列表失败: " . $backupList['message'] . "\n";
    }
    
    echo "\n3. 创建新备份...\n";
    $result = $backupService->backup('测试备份 - ' . date('Y-m-d H:i:s'));
    
    if ($result['success']) {
        echo "   ✅ 备份创建成功!\n";
        echo "   文件名: " . $result['data']['filename'] . "\n";
        echo "   文件大小: " . formatBytes($result['data']['size']) . "\n";
        echo "   表数量: " . $result['data']['tables_count'] . "\n";
        echo "   创建时间: " . $result['data']['created_at']->format('Y-m-d H:i:s') . "\n";
    } else {
        echo "   ❌ 备份创建失败: " . $result['message'] . "\n";
    }
    
    echo "\n4. 再次获取备份列表...\n";
    $backupList = $backupService->getBackupList();
    if ($backupList['success']) {
        echo "   当前备份数量: " . count($backupList['data']) . "\n";
        echo "   备份文件列表:\n";
        foreach ($backupList['data'] as $backup) {
            echo "   - " . $backup['filename'] . " (" . $backup['size_human'] . ") - " . $backup['created_at_human'] . "\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ 测试过程中发生错误: " . $e->getMessage() . "\n";
    echo "错误文件: " . $e->getFile() . ":" . $e->getLine() . "\n";
}

echo "\n=== 测试完成 ===\n";

/**
 * 格式化字节大小
 */
function formatBytes($size, $precision = 2) {
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
    
    for ($i = 0; $size > 1024 && $i < count($units) - 1; $i++) {
        $size /= 1024;
    }
    
    return round($size, $precision) . ' ' . $units[$i];
} 