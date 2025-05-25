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

echo "📊 检查最近完成的任务和抓取的内容:\n\n";

// 检查最近完成的任务
$completedTasks = $capsule->getConnection()->select(
    "SELECT id, name, status, progress, items_processed, total_items, created_at, updated_at 
     FROM import_tasks 
     WHERE status = 'completed' 
     ORDER BY updated_at DESC 
     LIMIT 3"
);

echo "✅ 最近完成的任务:\n";
foreach ($completedTasks as $task) {
    echo "   ID: {$task->id} | 名称: {$task->name}\n";
    echo "   进度: {$task->progress}% ({$task->items_processed}/{$task->total_items})\n";
    echo "   完成时间: {$task->updated_at}\n\n";
}

// 检查抓取的资源内容
$resources = $capsule->getConnection()->select(
    "SELECT id, name, type, source, status, LENGTH(content) as content_length, created_at 
     FROM resource_items 
     ORDER BY created_at DESC 
     LIMIT 5"
);

echo "📚 最近抓取的资源:\n";
if (count($resources) > 0) {
    foreach ($resources as $resource) {
        echo "   ID: {$resource->id} | 名称: {$resource->name}\n";
        echo "   类型: {$resource->type} | 来源: {$resource->source}\n";
        echo "   内容长度: {$resource->content_length} 字符\n";
        echo "   创建时间: {$resource->created_at}\n\n";
    }
} else {
    echo "   ❌ 没有找到任何抓取的资源！\n\n";
}

// 检查具体内容
if (count($resources) > 0) {
    echo "🔍 最新资源的内容预览:\n";
    $latestResource = $capsule->getConnection()->selectOne(
        "SELECT name, content, metadata FROM resource_items ORDER BY created_at DESC LIMIT 1"
    );
    
    if ($latestResource && $latestResource->content) {
        echo "   标题: {$latestResource->name}\n";
        echo "   内容预览: " . mb_substr($latestResource->content, 0, 200) . "...\n";
        echo "   元数据: {$latestResource->metadata}\n";
    } else {
        echo "   ❌ 最新资源没有内容！\n";
    }
} 