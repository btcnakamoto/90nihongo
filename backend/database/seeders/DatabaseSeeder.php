<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 创建管理员账户
        $this->call([
            AdminSeeder::class,
            UserSeeder::class,
        ]);

        $this->command->info('Database seeding completed!');
        $this->command->line('You can now use the following accounts:');
        $this->command->line('');
        $this->command->line('=== Admin Accounts ===');
        $this->command->line('Super Admin: admin@90nihongo.com / admin123');
        $this->command->line('Admin: manager@90nihongo.com / manager123');
        $this->command->line('Moderator: moderator@90nihongo.com / moderator123');
        $this->command->line('');
        $this->command->line('=== Test Users ===');
        $this->command->line('10 test users created with password: password123');
        $this->command->line('Examples: zhangsan@example.com, lisi@example.com');
    }
}
