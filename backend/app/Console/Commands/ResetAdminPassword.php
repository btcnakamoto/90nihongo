<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;

class ResetAdminPassword extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:reset-password {username?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reset admin password';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $username = $this->argument('username');
        
        if ($username) {
            $admin = Admin::where('username', $username)->first();
        } else {
            $admin = Admin::first();
        }
        
        if (!$admin) {
            $this->error('Admin user not found');
            return 1;
        }
        
        $admin->password = Hash::make('password123');
        $admin->save();
        
        $this->info("Password reset successfully for user: {$admin->username}");
        $this->info("New password: password123");
        
        return 0;
    }
}
