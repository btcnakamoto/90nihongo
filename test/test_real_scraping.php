<?php
require_once __DIR__ . '/backend/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/backend');
$dotenv->load();

use Illuminate\Database\Capsule\Manager as Capsule;

$capsule = new Capsule;
$capsule->addConnection([
    'driver' => 'mysql',
    'host' => $_ENV['DB_HOST'] ?? 'localhost',
    'database' => $_ENV['DB_DATABASE'] ?? '90nihongo',
    'username' => $_ENV['DB_USERNAME'] ?? 'root',
    'password' => $_ENV['DB_PASSWORD'] ?? '',
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
]);

$capsule->setAsGlobal();
$capsule->bootEloquent();

echo "🔍 诊断100%完成但无结果的问题\n\n";

// 1. 检查最近的任务
echo "1. 检查最近的已完成任务:\n";
$recentTasks = $capsule->getConnection()->select(
    "SELECT id, name, status, progress, items_processed, total_items, logs, created_at, updated_at 
     FROM import_tasks 
     ORDER BY updated_at DESC 
     LIMIT 3"
);

foreach ($recentTasks as $task) {
    echo "   📋 任务ID: {$task->id}\n";
    echo "      名称: {$task->name}\n";
    echo "      状态: {$task->status} | 进度: {$task->progress}%\n";
    echo "      处理: {$task->items_processed}/{$task->total_items}\n";
    echo "      更新时间: {$task->updated_at}\n";
    
    if ($task->logs) {
        $logs = json_decode($task->logs, true);
        echo "      日志: ";
        if (is_array($logs)) {
            echo implode(' | ', array_slice($logs, -3));
        } else {
            echo $task->logs;
        }
    }
    echo "\n\n";
}

// 2. 检查抓取的资源
echo "2. 检查抓取的资源内容:\n";
$resourceCount = $capsule->getConnection()->selectOne("SELECT COUNT(*) as count FROM resource_items");
echo "   总资源数量: {$resourceCount->count}\n\n";

if ($resourceCount->count > 0) {
    $resources = $capsule->getConnection()->select(
        "SELECT id, name, type, source, status, LENGTH(content) as content_length, created_at 
         FROM resource_items 
         ORDER BY created_at DESC 
         LIMIT 3"
    );
    
    foreach ($resources as $resource) {
        echo "   📚 资源ID: {$resource->id}\n";
        echo "      名称: {$resource->name}\n";
        echo "      类型: {$resource->type} | 来源: {$resource->source}\n";
        echo "      状态: {$resource->status} | 内容长度: {$resource->content_length} 字符\n";
        echo "      创建时间: {$resource->created_at}\n\n";
    }
    
    // 显示最新资源的内容预览
    $latestResource = $capsule->getConnection()->selectOne(
        "SELECT name, content, metadata FROM resource_items WHERE LENGTH(content) > 0 ORDER BY created_at DESC LIMIT 1"
    );
    
    if ($latestResource) {
        echo "   📄 最新资源内容预览:\n";
        echo "      标题: {$latestResource->name}\n";
        echo "      内容: " . mb_substr($latestResource->content, 0, 300) . "...\n";
        echo "      元数据: {$latestResource->metadata}\n\n";
    }
} else {
    echo "   ❌ 数据库中没有任何抓取的资源！\n\n";
}

// 3. 手动测试Python抓取脚本
echo "3. 手动测试Python抓取脚本:\n";
if (file_exists('python/web_scraper.py')) {
    echo "   ✅ Python脚本存在\n";
    
    // 创建测试任务
    $testTaskId = $capsule->getConnection()->table('import_tasks')->insertGetId([
        'type' => 'web-scraping',
        'name' => '手动测试抓取 - NHK Easy News',
        'status' => 'pending',
        'progress' => 0,
        'total_items' => 5,
        'items_processed' => 0,
        'config' => json_encode([
            'urls' => ['https://www3.nhk.or.jp/news/easy/'],
            'max_pages' => 5,
            'content_type' => 'course',
            'delay_ms' => 1000,
            'include_images' => false,
            'include_audio' => false
        ]),
        'logs' => json_encode(['手动测试任务已创建']),
        'created_at' => date('Y-m-d H:i:s'),
        'updated_at' => date('Y-m-d H:i:s')
    ]);
    
    echo "   📋 创建测试任务ID: {$testTaskId}\n";
    echo "   🔄 正在运行Python抓取脚本...\n";
    
    // 运行Python脚本
    $configJson = json_encode([
        'task_id' => $testTaskId,
        'urls' => ['https://www3.nhk.or.jp/news/easy/'],
        'max_pages' => 3,
        'content_type' => 'course',
        'delay_ms' => 1000,
        'include_images' => false,
        'include_audio' => false
    ]);
    
    // 将配置写入临时文件
    file_put_contents('temp_config.json', $configJson);
    
    // 运行Python脚本
    $command = "python python/web_scraper.py temp_config.json";
    $output = [];
    $returnCode = 0;
    exec($command . " 2>&1", $output, $returnCode);
    
    echo "   返回码: {$returnCode}\n";
    echo "   输出:\n";
    foreach ($output as $line) {
        echo "      {$line}\n";
    }
    
    // 清理临时文件
    if (file_exists('temp_config.json')) {
        unlink('temp_config.json');
    }
    
    // 检查任务结果
    echo "\n   🔍 检查任务结果:\n";
    $updatedTask = $capsule->getConnection()->selectOne(
        "SELECT status, progress, items_processed, logs FROM import_tasks WHERE id = ?",
        [$testTaskId]
    );
    
    if ($updatedTask) {
        echo "      状态: {$updatedTask->status}\n";
        echo "      进度: {$updatedTask->progress}%\n";
        echo "      处理项目: {$updatedTask->items_processed}\n";
        
        if ($updatedTask->logs) {
            $logs = json_decode($updatedTask->logs, true);
            echo "      最新日志: ";
            if (is_array($logs)) {
                echo implode(' | ', array_slice($logs, -2));
            }
            echo "\n";
        }
    }
    
    // 检查是否产生了新的资源
    $newResources = $capsule->getConnection()->select(
        "SELECT name, type, LENGTH(content) as content_length FROM resource_items WHERE created_at >= (SELECT created_at FROM import_tasks WHERE id = ?)",
        [$testTaskId]
    );
    
    echo "      新产生的资源: " . count($newResources) . " 个\n";
    foreach ($newResources as $resource) {
        echo "         - {$resource->name} ({$resource->content_length} 字符)\n";
    }
    
} else {
    echo "   ❌ Python脚本不存在\n";
}

echo "\n🎯 诊断结论:\n";
echo "   如果任务显示100%但没有资源内容，可能的原因：\n";
echo "   1. Python脚本执行但抓取失败（网站结构变化）\n";
echo "   2. 内容被抓取但保存到数据库失败\n";
echo "   3. 前端API没有正确读取数据库中的资源\n";
echo "   4. 队列工作进程没有正确处理任务\n"; 