<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Exception;
use App\Models\DatabaseBackup;

class DatabaseBackupService
{
    /**
     * 备份存储磁盘
     */
    protected string $disk;
    
    /**
     * 备份目录
     */
    protected string $backupPath;
    
    /**
     * 最大保留备份数量
     */
    protected int $maxBackups;

    public function __construct()
    {
        $this->disk = config('backup.disk', 'local');
        $this->backupPath = config('backup.path', 'database_backups');
        $this->maxBackups = config('backup.max_files', 30);
    }

    /**
     * 创建数据库备份
     */
    public function backup(string $description = null): array
    {
        $connection = DB::connection();
        $dbName = $connection->getDatabaseName();
        $driver = $connection->getDriverName();
        $tablesCount = $this->getTablesCount();
        
        // 生成备份文件名
        $timestamp = now()->format('Y-m-d_H-i-s');
        $filename = "backup_{$timestamp}.sql";
        $filepath = "{$this->backupPath}/{$filename}";
        
        // 创建数据库记录
        $backupRecord = DatabaseBackup::create([
            'filename' => $filename,
            'filepath' => $filepath,
            'description' => $description,
            'file_size' => 0,
            'file_size_human' => '0 B',
            'tables_count' => $tablesCount,
            'database_name' => $dbName,
            'database_driver' => $driver,
            'status' => 'creating',
            'backup_started_at' => now(),
        ]);

        try {
            Log::info('开始创建数据库备份', [
                'filename' => $filename,
                'database' => $dbName,
                'description' => $description
            ]);

            // 生成备份SQL
            $sql = $this->generateBackupSQL($connection);
            
            // 保存到文件
            Storage::disk($this->disk)->put($filepath, $sql);
            
            // 获取文件大小
            $fileSize = Storage::disk($this->disk)->size($filepath);
            $fileSizeHuman = $this->formatBytes($fileSize);
            
            // 更新备份记录
            $backupRecord->update([
                'file_size' => $fileSize,
                'file_size_human' => $fileSizeHuman,
                'status' => 'completed',
                'backup_completed_at' => now(),
            ]);
            
            Log::info('数据库备份创建成功', [
                'filename' => $filename,
                'size' => $fileSizeHuman,
                'tables' => $tablesCount
            ]);
            
            // 清理旧备份
            $this->cleanupOldBackups();
            
            return [
                'success' => true,
                'message' => '数据库备份创建成功',
                'data' => [
                    'id' => $backupRecord->id,
                    'filename' => $filename,
                    'filepath' => $filepath,
                    'description' => $description,
                    'size' => $fileSize,
                    'size_human' => $fileSizeHuman,
                    'tables_count' => $tablesCount,
                    'database' => $dbName,
                    'created_at' => $backupRecord->created_at->format('Y-m-d H:i:s'),
                    'created_at_human' => $backupRecord->created_at_human,
                ]
            ];
            
        } catch (Exception $e) {
            // 更新备份记录为失败状态
            $backupRecord->update([
                'status' => 'failed',
            ]);
            
            Log::error('数据库备份创建失败: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => '数据库备份创建失败: ' . $e->getMessage()
            ];
        }
    }

    /**
     * 生成备份SQL内容
     */
    protected function generateBackupSQL($connection): string
    {
        $driver = $connection->getDriverName();
        $dbName = $connection->getDatabaseName();
        
        if ($driver === 'pgsql') {
            return $this->generatePostgreSQLBackup($connection, $dbName);
        } elseif ($driver === 'mysql') {
            return $this->generateMySQLBackup($connection, $dbName);
        } else {
            throw new Exception("不支持的数据库类型: {$driver}");
        }
    }

    /**
     * 生成PostgreSQL备份
     */
    protected function generatePostgreSQLBackup($connection, $dbName): string
    {
        $config = $connection->getConfig();
        $host = $config['host'];
        $port = $config['port'];
        $username = $config['username'];
        $password = $config['password'];
        
        // 设置PostgreSQL密码环境变量
        putenv("PGPASSWORD={$password}");
        
        // 生成pg_dump命令
        $command = sprintf(
            'pg_dump -h %s -p %s -U %s -d %s --no-password --verbose --clean --if-exists --create',
            escapeshellarg($host),
            escapeshellarg($port),
            escapeshellarg($username),
            escapeshellarg($dbName)
        );
        
        // 执行命令并获取输出
        $output = shell_exec($command);
        
        if ($output === null) {
            throw new Exception('pg_dump命令执行失败');
        }
        
        return $output;
    }

    /**
     * 生成MySQL备份
     */
    protected function generateMySQLBackup($connection, $dbName): string
    {
        $config = $connection->getConfig();
        $host = $config['host'];
        $port = $config['port'];
        $username = $config['username'];
        $password = $config['password'];
        
        // 生成mysqldump命令
        $command = sprintf(
            'mysqldump -h %s -P %s -u %s -p%s --single-transaction --routines --triggers %s',
            escapeshellarg($host),
            escapeshellarg($port),
            escapeshellarg($username),
            escapeshellarg($password),
            escapeshellarg($dbName)
        );
        
        // 执行命令并获取输出
        $output = shell_exec($command);
        
        if ($output === null) {
            throw new Exception('mysqldump命令执行失败');
        }
        
        return $output;
    }

    /**
     * 获取表数量
     */
    protected function getTablesCount(): int
    {
        $driver = DB::connection()->getDriverName();
        
        if ($driver === 'pgsql') {
            $result = DB::select("
                SELECT COUNT(*) as count 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_type = 'BASE TABLE'
            ");
        } elseif ($driver === 'mysql') {
            $result = DB::select("
                SELECT COUNT(*) as count 
                FROM information_schema.tables 
                WHERE table_schema = DATABASE()
            ");
        } else {
            return 0;
        }
        
        return $result[0]->count ?? 0;
    }

    /**
     * 获取备份文件列表（从数据库）
     */
    public function getBackupList(): array
    {
        try {
            $backups = DatabaseBackup::completed()
                ->latest()
                ->get()
                ->map(function ($backup) {
                    return [
                        'id' => $backup->id,
                        'filename' => $backup->filename,
                        'filepath' => $backup->filepath,
                        'description' => $backup->description,
                        'size' => $backup->file_size,
                        'size_human' => $backup->file_size_human,
                        'tables_count' => $backup->tables_count,
                        'database_name' => $backup->database_name,
                        'database_driver' => $backup->database_driver,
                        'status' => $backup->status,
                        'created_at' => $backup->created_at->format('Y-m-d H:i:s'),
                        'created_at_human' => $backup->created_at_human,
                        'backup_duration' => $backup->backup_duration,
                    ];
                });
            
            return [
                'success' => true,
                'data' => $backups->toArray()
            ];
            
        } catch (Exception $e) {
            Log::error('获取备份列表失败: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => '获取备份列表失败: ' . $e->getMessage(),
                'data' => []
            ];
        }
    }

    /**
     * 下载备份文件
     */
    public function downloadBackup(string $filename): array
    {
        try {
            // 从数据库查找备份记录
            $backup = DatabaseBackup::where('filename', $filename)->first();
            
            if (!$backup) {
                return [
                    'success' => false,
                    'message' => '备份记录不存在'
                ];
            }
            
            if (!Storage::disk($this->disk)->exists($backup->filepath)) {
                return [
                    'success' => false,
                    'message' => '备份文件不存在'
                ];
            }
            
            return [
                'success' => true,
                'path' => Storage::disk($this->disk)->path($backup->filepath),
                'content' => Storage::disk($this->disk)->get($backup->filepath),
                'size' => $backup->file_size
            ];
            
        } catch (Exception $e) {
            Log::error('下载备份文件失败: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => '下载备份文件失败: ' . $e->getMessage()
            ];
        }
    }

    /**
     * 删除备份文件
     */
    public function deleteBackup(string $filename): array
    {
        try {
            // 从数据库查找备份记录
            $backup = DatabaseBackup::where('filename', $filename)->first();
            
            if (!$backup) {
                return [
                    'success' => false,
                    'message' => '备份记录不存在'
                ];
            }
            
            // 删除物理文件
            if (Storage::disk($this->disk)->exists($backup->filepath)) {
                Storage::disk($this->disk)->delete($backup->filepath);
            }
            
            // 删除数据库记录
            $backup->delete();
            
            Log::info('删除备份文件: ' . $filename);
            
            return [
                'success' => true,
                'message' => '备份文件删除成功'
            ];
            
        } catch (Exception $e) {
            Log::error('删除备份文件失败: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => '删除备份文件失败: ' . $e->getMessage()
            ];
        }
    }

    /**
     * 清理旧备份文件
     */
    protected function cleanupOldBackups(): void
    {
        try {
            $backups = DatabaseBackup::completed()
                ->orderBy('created_at', 'desc')
                ->get();
            
            if ($backups->count() > $this->maxBackups) {
                $backupsToDelete = $backups->slice($this->maxBackups);
                
                foreach ($backupsToDelete as $backup) {
                    // 删除物理文件
                    if (Storage::disk($this->disk)->exists($backup->filepath)) {
                        Storage::disk($this->disk)->delete($backup->filepath);
                    }
                    
                    // 删除数据库记录
                    $backup->delete();
                    
                    Log::info('清理旧备份文件: ' . $backup->filename);
                }
            }
            
        } catch (Exception $e) {
            Log::error('清理旧备份文件失败: ' . $e->getMessage());
        }
    }

    /**
     * 格式化文件大小
     */
    protected function formatBytes(int $size, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $size > 1024 && $i < count($units) - 1; $i++) {
            $size /= 1024;
        }
        
        return round($size, $precision) . ' ' . $units[$i];
    }

    /**
     * 恢复数据库
     */
    public function restore(string $filename): array
    {
        try {
            // 从数据库查找备份记录
            $backup = DatabaseBackup::where('filename', $filename)->first();
            
            if (!$backup) {
                return [
                    'success' => false,
                    'message' => '备份记录不存在'
                ];
            }
            
            if (!Storage::disk($this->disk)->exists($backup->filepath)) {
                return [
                    'success' => false,
                    'message' => '备份文件不存在'
                ];
            }
            
            $sql = Storage::disk($this->disk)->get($backup->filepath);
            
            DB::unprepared($sql);
            
            Log::info('数据库恢复成功: ' . $filename);
            
            return [
                'success' => true,
                'message' => '数据库恢复成功'
            ];
            
        } catch (Exception $e) {
            Log::error('数据库恢复失败: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => '数据库恢复失败: ' . $e->getMessage()
            ];
        }
    }
} 