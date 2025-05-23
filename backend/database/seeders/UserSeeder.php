<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\LearningProgress;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => '张三',
                'username' => 'zhangsan',
                'email' => 'zhangsan@example.com',
                'password' => Hash::make('password123'),
                'japanese_level' => 'N3',
                'daily_study_minutes' => 60,
                'study_start_date' => now()->subDays(45)->toDateString(),
                'is_active' => true,
                'last_login_at' => now()->subHours(2),
                'email_verified_at' => now()->subDays(40),
                'learning_progress' => [
                    'current_day' => 45,
                    'total_study_minutes' => 2700, // 45小时
                    'consecutive_days' => 12,
                    'listening_score' => 75,
                    'speaking_score' => 68,
                    'vocabulary_score' => 82,
                    'grammar_score' => 71,
                    'last_study_date' => now()->subHours(1)->toDateString(),
                ]
            ],
            [
                'name' => '李四',
                'username' => 'lisi',
                'email' => 'lisi@example.com',
                'password' => Hash::make('password123'),
                'japanese_level' => 'N4',
                'daily_study_minutes' => 90,
                'study_start_date' => now()->subDays(60)->toDateString(),
                'is_active' => true,
                'last_login_at' => now()->subMinutes(30),
                'email_verified_at' => now()->subDays(58),
                'learning_progress' => [
                    'current_day' => 60,
                    'total_study_minutes' => 5400, // 90小时
                    'consecutive_days' => 25,
                    'listening_score' => 65,
                    'speaking_score' => 72,
                    'vocabulary_score' => 69,
                    'grammar_score' => 78,
                    'last_study_date' => now()->toDateString(),
                ]
            ],
            [
                'name' => '王五',
                'username' => 'wangwu',
                'email' => 'wangwu@example.com',
                'password' => Hash::make('password123'),
                'japanese_level' => 'N2',
                'daily_study_minutes' => 120,
                'study_start_date' => now()->subDays(30)->toDateString(),
                'is_active' => true,
                'last_login_at' => now()->subDays(5),
                'email_verified_at' => now()->subDays(28),
                'learning_progress' => [
                    'current_day' => 30,
                    'total_study_minutes' => 3600, // 60小时
                    'consecutive_days' => 8,
                    'listening_score' => 88,
                    'speaking_score' => 85,
                    'vocabulary_score' => 92,
                    'grammar_score' => 86,
                    'last_study_date' => now()->subDays(5)->toDateString(),
                ]
            ],
            [
                'name' => '赵六',
                'username' => 'zhaoliu',
                'email' => 'zhaoliu@example.com',
                'password' => Hash::make('password123'),
                'japanese_level' => 'N5',
                'daily_study_minutes' => 45,
                'study_start_date' => now()->subDays(15)->toDateString(),
                'is_active' => true,
                'last_login_at' => now()->subHours(6),
                'email_verified_at' => null, // 未验证邮箱
                'learning_progress' => [
                    'current_day' => 15,
                    'total_study_minutes' => 675, // 11.25小时
                    'consecutive_days' => 15,
                    'listening_score' => 45,
                    'speaking_score' => 38,
                    'vocabulary_score' => 52,
                    'grammar_score' => 41,
                    'last_study_date' => now()->toDateString(),
                ]
            ],
            [
                'name' => '陈七',
                'username' => 'chenqi',
                'email' => 'chenqi@example.com',
                'password' => Hash::make('password123'),
                'japanese_level' => 'N1',
                'daily_study_minutes' => 150,
                'study_start_date' => now()->subDays(80)->toDateString(),
                'is_active' => true,
                'last_login_at' => now()->subMinutes(15),
                'email_verified_at' => now()->subDays(78),
                'learning_progress' => [
                    'current_day' => 80,
                    'total_study_minutes' => 12000, // 200小时
                    'consecutive_days' => 35,
                    'listening_score' => 95,
                    'speaking_score' => 92,
                    'vocabulary_score' => 98,
                    'grammar_score' => 94,
                    'last_study_date' => now()->toDateString(),
                ]
            ],
            [
                'name' => '黄八',
                'username' => 'huangba',
                'email' => 'huangba@example.com',
                'password' => Hash::make('password123'),
                'japanese_level' => 'N3',
                'daily_study_minutes' => 75,
                'study_start_date' => now()->subDays(20)->toDateString(),
                'is_active' => false, // 已停用
                'last_login_at' => now()->subDays(10),
                'email_verified_at' => now()->subDays(18),
                'learning_progress' => [
                    'current_day' => 20,
                    'total_study_minutes' => 900, // 15小时
                    'consecutive_days' => 5,
                    'listening_score' => 58,
                    'speaking_score' => 62,
                    'vocabulary_score' => 55,
                    'grammar_score' => 60,
                    'last_study_date' => now()->subDays(10)->toDateString(),
                ]
            ],
            [
                'name' => '刘九',
                'username' => 'liujiu',
                'email' => 'liujiu@example.com',
                'password' => Hash::make('password123'),
                'japanese_level' => 'N4',
                'daily_study_minutes' => 100,
                'study_start_date' => now()->subDays(3)->toDateString(),
                'is_active' => true,
                'last_login_at' => now()->subHours(1),
                'email_verified_at' => now()->subDays(2),
                'learning_progress' => [
                    'current_day' => 3,
                    'total_study_minutes' => 300, // 5小时
                    'consecutive_days' => 3,
                    'listening_score' => 35,
                    'speaking_score' => 28,
                    'vocabulary_score' => 42,
                    'grammar_score' => 38,
                    'last_study_date' => now()->toDateString(),
                ]
            ],
            [
                'name' => '吴十',
                'username' => 'wushi',
                'email' => 'wushi@example.com',
                'password' => Hash::make('password123'),
                'japanese_level' => 'N2',
                'daily_study_minutes' => 80,
                'study_start_date' => now()->subDays(50)->toDateString(),
                'is_active' => true,
                'last_login_at' => now()->subDays(15),
                'email_verified_at' => now()->subDays(45),
                'learning_progress' => [
                    'current_day' => 35,
                    'total_study_minutes' => 2800, // 46.67小时
                    'consecutive_days' => 0, // 未连续学习
                    'listening_score' => 72,
                    'speaking_score' => 69,
                    'vocabulary_score' => 76,
                    'grammar_score' => 73,
                    'last_study_date' => now()->subDays(15)->toDateString(),
                ]
            ],
            [
                'name' => '孙十一',
                'username' => 'sunshiyi',
                'email' => 'sunshiyi@example.com',
                'password' => Hash::make('password123'),
                'japanese_level' => 'N5',
                'daily_study_minutes' => 60,
                'study_start_date' => now()->toDateString(),
                'is_active' => true,
                'last_login_at' => now()->subMinutes(5),
                'email_verified_at' => null,
                'learning_progress' => [
                    'current_day' => 1,
                    'total_study_minutes' => 60,
                    'consecutive_days' => 1,
                    'listening_score' => 15,
                    'speaking_score' => 10,
                    'vocabulary_score' => 20,
                    'grammar_score' => 12,
                    'last_study_date' => now()->toDateString(),
                ]
            ],
            [
                'name' => '周十二',
                'username' => 'zhoushier',
                'email' => 'zhoushier@example.com',
                'password' => Hash::make('password123'),
                'japanese_level' => 'N3',
                'daily_study_minutes' => 90,
                'study_start_date' => now()->subDays(70)->toDateString(),
                'is_active' => true,
                'last_login_at' => now()->subDays(30),
                'email_verified_at' => now()->subDays(65),
                'learning_progress' => [
                    'current_day' => 40,
                    'total_study_minutes' => 3600, // 60小时
                    'consecutive_days' => 0, // 休眠用户
                    'listening_score' => 68,
                    'speaking_score' => 65,
                    'vocabulary_score' => 72,
                    'grammar_score' => 69,
                    'last_study_date' => now()->subDays(30)->toDateString(),
                ]
            ]
        ];

        foreach ($users as $userData) {
            $progressData = $userData['learning_progress'];
            unset($userData['learning_progress']);

            $user = User::create($userData);
            
            // 创建学习进度记录
            $user->learningProgress()->create($progressData);
        }

        $this->command->info('Test users created:');
        $this->command->line('- 10 users with different learning levels and progress');
        $this->command->line('- Password for all users: password123');
        $this->command->line('- Mix of active/inactive users and verified/unverified emails');
    }
} 