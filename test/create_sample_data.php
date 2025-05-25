<?php
/**
 * 创建示例数据来测试资源管理API
 */

require_once 'backend/vendor/autoload.php';

// 模拟Laravel环境
$app = require_once 'backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\ResourceItem;
use App\Models\ImportTask;

echo "=== 创建示例数据 ===\n\n";

try {
    // 创建示例资源
    $resources = [
        [
            'name' => 'NHK简单新闻课程',
            'type' => 'course',
            'source' => 'web-scraping',
            'status' => 'completed',
            'progress' => 100,
            'content' => '这是一个基于NHK简单新闻的日语学习课程',
            'metadata' => json_encode(['lessons' => 15, 'difficulty' => 'beginner']),
            'file_size' => 2048000, // 2MB
        ],
        [
            'name' => '基础日语词汇集',
            'type' => 'vocabulary',
            'source' => 'api-import',
            'status' => 'completed',
            'progress' => 100,
            'content' => '包含1000个基础日语单词',
            'metadata' => json_encode(['word_count' => 1000, 'level' => 'N5']),
            'file_size' => 512000, // 512KB
        ],
        [
            'name' => '听力练习音频',
            'type' => 'audio',
            'source' => 'file-upload',
            'status' => 'processing',
            'progress' => 75,
            'content' => '日语听力练习音频文件',
            'metadata' => json_encode(['duration' => '30min', 'quality' => 'high']),
            'file_size' => 15728640, // 15MB
        ],
        [
            'name' => '学习材料PDF',
            'type' => 'material',
            'source' => 'file-upload',
            'status' => 'completed',
            'progress' => 100,
            'content' => '日语学习资料PDF文档',
            'metadata' => json_encode(['pages' => 50, 'format' => 'pdf']),
            'file_size' => 5242880, // 5MB
        ],
        [
            'name' => '语法视频教程',
            'type' => 'video',
            'source' => 'web-scraping',
            'status' => 'error',
            'progress' => 0,
            'content' => '日语语法视频教程',
            'metadata' => json_encode(['duration' => '60min', 'resolution' => '1080p']),
            'file_size' => 0,
            'error_message' => '下载失败：网络超时'
        ]
    ];

    foreach ($resources as $resourceData) {
        ResourceItem::create($resourceData);
        echo "✓ 创建资源: {$resourceData['name']}\n";
    }

    // 创建示例任务
    $tasks = [
        [
            'type' => 'web-scraping',
            'name' => '抓取朝日新闻简单日语',
            'status' => 'running',
            'progress' => 60.5,
            'total_items' => 200,
            'items_processed' => 121,
            'config' => json_encode([
                'urls' => ['https://www.asahi.com/shumon/', 'https://www.yomiuri.co.jp/'],
                'max_pages' => 200,
                'content_type' => 'news'
            ]),
            'logs' => json_encode([
                '任务已创建',
                '开始抓取...',
                '已处理121页',
                '正在处理音频文件...'
            ])
        ],
        [
            'type' => 'file-upload',
            'name' => '文件上传 - 5个文件',
            'status' => 'completed',
            'progress' => 100,
            'total_items' => 5,
            'items_processed' => 5,
            'config' => json_encode([
                'files' => [
                    ['name' => 'vocab1.txt', 'size' => 1024],
                    ['name' => 'audio1.mp3', 'size' => 5120],
                    ['name' => 'lesson1.pdf', 'size' => 2048]
                ]
            ]),
            'logs' => json_encode([
                '文件上传完成',
                '开始处理...',
                '处理完成'
            ])
        ],
        [
            'type' => 'api-import',
            'name' => 'API导入 - 词汇数据',
            'status' => 'pending',
            'progress' => 0,
            'total_items' => 1000,
            'items_processed' => 0,
            'config' => json_encode([
                'endpoint' => 'https://api.example.com/vocabulary',
                'format' => 'json',
                'batch_size' => 100
            ]),
            'logs' => json_encode([
                'API连接测试成功',
                '等待开始导入...'
            ])
        ]
    ];

    foreach ($tasks as $taskData) {
        ImportTask::create($taskData);
        echo "✓ 创建任务: {$taskData['name']}\n";
    }

    echo "\n=== 示例数据创建完成 ===\n";
    echo "资源数量: " . ResourceItem::count() . "\n";
    echo "任务数量: " . ImportTask::count() . "\n";

} catch (Exception $e) {
    echo "✗ 创建数据失败: " . $e->getMessage() . "\n";
    echo "错误位置: " . $e->getFile() . ":" . $e->getLine() . "\n";
} 