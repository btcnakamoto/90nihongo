<?php
/**
 * 创建管理员账户
 */

require_once 'backend/vendor/autoload.php';

// 模拟Laravel环境
$app = require_once 'backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Admin;
use Illuminate\Support\Facades\Hash;

echo "=== 创建管理员账户 ===\n\n";

try {
    // 创建超级管理员
    $superAdmin = Admin::create([
        'username' => 'superadmin',
        'email' => 'superadmin@90nihongo.com',
        'password' => Hash::make('admin123456'),
        'role' => Admin::ROLE_SUPER_ADMIN,
        'status' => Admin::STATUS_ACTIVE,
    ]);

    echo "✓ 创建超级管理员成功:\n";
    echo "  用户名: superadmin\n";
    echo "  邮箱: superadmin@90nihongo.com\n";
    echo "  密码: admin123456\n";
    echo "  角色: 超级管理员\n\n";

    // 创建普通管理员
    $admin = Admin::create([
        'username' => 'admin',
        'email' => 'admin@90nihongo.com',
        'password' => Hash::make('admin123'),
        'role' => Admin::ROLE_ADMIN,
        'status' => Admin::STATUS_ACTIVE,
    ]);

    echo "✓ 创建普通管理员成功:\n";
    echo "  用户名: admin\n";
    echo "  邮箱: admin@90nihongo.com\n";
    echo "  密码: admin123\n";
    echo "  角色: 管理员\n\n";

    // 创建版主
    $moderator = Admin::create([
        'username' => 'moderator',
        'email' => 'moderator@90nihongo.com',
        'password' => Hash::make('mod123'),
        'role' => Admin::ROLE_MODERATOR,
        'status' => Admin::STATUS_ACTIVE,
    ]);

    echo "✓ 创建版主成功:\n";
    echo "  用户名: moderator\n";
    echo "  邮箱: moderator@90nihongo.com\n";
    echo "  密码: mod123\n";
    echo "  角色: 版主\n\n";

    echo "=== 管理员账户创建完成 ===\n";
    echo "总计创建管理员数量: " . Admin::count() . "\n\n";

    echo "=== 登录信息 ===\n";
    echo "推荐使用超级管理员账户登录:\n";
    echo "用户名: superadmin\n";
    echo "密码: admin123456\n";

} catch (Exception $e) {
    echo "✗ 创建管理员失败: " . $e->getMessage() . "\n";
    echo "错误位置: " . $e->getFile() . ":" . $e->getLine() . "\n";
} 