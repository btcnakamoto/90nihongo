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
                'name' => '月度会员',
                'code' => 'monthly',
                'description' => '月度付费计划，享受所有高级功能',
                'price' => 29.00,
                'duration_days' => 30,
                'features' => json_encode([
                    '无限制学习内容',
                    '个性化学习计划',
                    '发音评测功能',
                    '离线学习支持',
                    '24/7客服支持'
                ]),
                'is_active' => true,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => '季度会员',
                'code' => 'quarterly',
                'description' => '季度付费计划，更优惠的价格享受高级功能',
                'price' => 79.00,
                'duration_days' => 90,
                'features' => json_encode([
                    '无限制学习内容',
                    '个性化学习计划',
                    '发音评测功能',
                    '离线学习支持',
                    '24/7客服支持',
                    '专属学习社群',
                    '定期学习报告'
                ]),
                'is_active' => true,
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => '年度会员',
                'code' => 'yearly',
                'description' => '年度付费计划，最优惠的价格享受全部功能',
                'price' => 299.00,
                'duration_days' => 365,
                'features' => json_encode([
                    '无限制学习内容',
                    '个性化学习计划',
                    '发音评测功能',
                    '离线学习支持',
                    '24/7客服支持',
                    '专属学习社群',
                    '定期学习报告',
                    '一对一辅导机会',
                    '考试冲刺课程'
                ]),
                'is_active' => true,
                'sort_order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => '终身会员',
                'code' => 'lifetime',
                'description' => '一次付费，终身享受所有功能和更新',
                'price' => 999.00,
                'duration_days' => 0, // 0 表示永久
                'features' => json_encode([
                    '无限制学习内容',
                    '个性化学习计划',
                    '发音评测功能',
                    '离线学习支持',
                    '24/7客服支持',
                    '专属学习社群',
                    '定期学习报告',
                    '一对一辅导机会',
                    '考试冲刺课程',
                    '所有未来功能更新',
                    '优先功能体验'
                ]),
                'is_active' => true,
                'sort_order' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(
                ['code' => $plan['code']],
                $plan
            );
        }
    }
}
