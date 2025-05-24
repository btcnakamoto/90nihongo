<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Admin;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Admin::updateOrCreate(
            ['email' => 'admin@90nihongo.com'],
            [
                'username' => 'admin',
                'email' => 'admin@90nihongo.com',
                'password' => Hash::make('admin123'),
                'role' => Admin::ROLE_SUPER_ADMIN,
                'status' => Admin::STATUS_ACTIVE,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        // 创建普通管理员
        Admin::updateOrCreate(
            ['email' => 'manager@90nihongo.com'],
            [
                'username' => 'manager',
                'email' => 'manager@90nihongo.com',
                'password' => Hash::make('manager123'),
                'role' => Admin::ROLE_ADMIN,
                'status' => Admin::STATUS_ACTIVE,
            ]
        );

        // 创建内容管理员
        Admin::updateOrCreate(
            ['email' => 'moderator@90nihongo.com'],
            [
                'username' => 'moderator',
                'email' => 'moderator@90nihongo.com',
                'password' => Hash::make('moderator123'),
                'role' => Admin::ROLE_MODERATOR,
                'status' => Admin::STATUS_ACTIVE,
            ]
        );

        $this->command->info('Admin accounts created:');
        $this->command->line('Super Admin: admin@90nihongo.com / admin123');
        $this->command->line('Admin: manager@90nihongo.com / manager123');
        $this->command->line('Moderator: moderator@90nihongo.com / moderator123');
    }
}
