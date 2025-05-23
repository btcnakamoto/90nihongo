<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\DatabaseBackupService;

class DatabaseBackupCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:backup {--description= : 备份描述}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = '创建数据库备份';

    /**
     * 备份服务
     *
     * @var DatabaseBackupService
     */
    protected $backupService;

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct(DatabaseBackupService $backupService)
    {
        parent::__construct();
        $this->backupService = $backupService;
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('开始创建数据库备份...');
        
        $description = $this->option('description');
        
        $result = $this->backupService->backup($description);
        
        if ($result['success']) {
            $this->info('✅ ' . $result['message']);
            
            $data = $result['data'];
            $this->table(['属性', '值'], [
                ['文件名', $data['filename']],
                ['文件大小', $this->formatBytes($data['size'])],
                ['数据库', $data['database']],
                ['表数量', $data['tables_count']],
                ['创建时间', $data['created_at']],
                ['描述', $data['description'] ?? '无'],
            ]);
            
            return Command::SUCCESS;
        } else {
            $this->error('❌ ' . $result['message']);
            return Command::FAILURE;
        }
    }

    /**
     * 格式化文件大小
     */
    private function formatBytes(int $size, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $size > 1024 && $i < count($units) - 1; $i++) {
            $size /= 1024;
        }
        
        return round($size, $precision) . ' ' . $units[$i];
    }
} 