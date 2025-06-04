<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;

class CreateTestAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:create-test';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a test admin account';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // 检查是否已存在
        $existingAdmin = Admin::where('email', 'admin@example.com')->first();
        if ($existingAdmin) {
            $this->info('Test admin already exists: admin@example.com');
            return;
        }

        // 创建测试管理员
        $admin = Admin::create([
            'username' => 'admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'super_admin',
            'status' => true,
            'is_super_admin' => true,
        ]);

        $this->info('Test admin created successfully!');
        $this->info('Email: admin@example.com');
        $this->info('Password: password');
    }
}
