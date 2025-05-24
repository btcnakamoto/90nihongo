<?php
/**
 * 更新示例数据的字段名
 */

require_once 'backend/vendor/autoload.php';

// 模拟Laravel环境
$app = require_once 'backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\ResourceItem;

echo "=== 更新示例数据字段名 ===\n\n";

try {
    // 更新所有ResourceItem的size字段为file_size
    $resources = ResourceItem::all();
    
    foreach ($resources as $resource) {
        if (isset($resource['size'])) {
            $resource->file_size = $resource['size'];
            $resource->save();
            echo "✓ 更新资源: {$resource->name} - 文件大小: {$resource->file_size}\n";
        }
    }
    
    echo "\n=== 更新完成 ===\n";

} catch (Exception $e) {
    echo "✗ 更新失败: " . $e->getMessage() . "\n";
} 