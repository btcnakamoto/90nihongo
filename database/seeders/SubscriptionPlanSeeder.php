<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\SubscriptionPlan;

class SubscriptionPlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => '月会员',
                'code' => 'monthly',
                'description' => '适合初学者，灵活体验完整功能',
                'price' => 39.00,
                'original_price' => 49.00,
                'duration_days' => 30,
                'features' => [
                    '完整90天学习计划',
                    '无限学习时间',
                    '所有练习题库',
                    '学习进度报告',
                    '个性化学习建议',
                    '社群学习讨论',
                    '在线客服支持'
                ],
                'is_popular' => false,
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => '季度会员',
                'code' => 'quarterly',
                'description' => '3个月集中学习，性价比之选',
                'price' => 99.00,
                'original_price' => 147.00,
                'duration_days' => 90,
                'features' => [
                    '完整90天学习计划',
                    '无限学习时间',
                    '所有练习题库',
                    '学习进度报告',
                    '个性化学习建议',
                    '社群学习讨论',
                    '在线客服支持',
                    '专属学习顾问',
                    '学习计划定制'
                ],
                'is_popular' => true,
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => '年会员',
                'code' => 'yearly',
                'description' => '系统性学习，最大优惠',
                'price' => 299.00,
                'original_price' => 468.00,
                'duration_days' => 365,
                'features' => [
                    '完整90天学习计划',
                    '无限学习时间',
                    '所有练习题库',
                    '学习进度报告',
                    '个性化学习建议',
                    '社群学习讨论',
                    '在线客服支持',
                    '专属学习顾问',
                    '学习计划定制',
                    '一对一口语纠错',
                    '考试模拟测试',
                    '证书颁发'
                ],
                'is_popular' => false,
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'name' => '终身会员',
                'code' => 'lifetime',
                'description' => '一次购买，终身学习',
                'price' => 899.00,
                'original_price' => 1299.00,
                'duration_days' => null,
                'features' => [
                    '完整90天学习计划',
                    '无限学习时间',
                    '所有练习题库',
                    '学习进度报告',
                    '个性化学习建议',
                    '社群学习讨论',
                    '在线客服支持',
                    '专属学习顾问',
                    '学习计划定制',
                    '一对一口语纠错',
                    '考试模拟测试',
                    '证书颁发',
                    '终身内容更新',
                    '优先新功能体验',
                    '专属VIP社群'
                ],
                'is_popular' => false,
                'is_active' => true,
                'sort_order' => 4,
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::create($plan);
        }

        $this->command->info('Subscription plans created successfully!');
        $this->command->line('');
        $this->command->line('=== Available Plans ===');
        $this->command->line('Monthly: ¥39 (was ¥49)');
        $this->command->line('Quarterly: ¥99 (was ¥147) - POPULAR');
        $this->command->line('Yearly: ¥299 (was ¥468)');
        $this->command->line('Lifetime: ¥899 (was ¥1299)');
    }
} 