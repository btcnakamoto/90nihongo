<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Exception;

class DatabaseBackupService
{
    /**
     * 备份存储磁盘
     */
    protected $disk = 'local';
    
    /**
     * 备份目录
     */
    protected $backupPath = 'database_backups';
    
    /**
     * 最大保留备份数量
     */
    protected $maxBackups = 30;

    public function __construct()
    {
        $this->disk = config('backup.disk', 'local');
        $this->backupPath = config('backup.path', 'database_backups');
        $this->maxBackups = config('backup.max_backups', 30);
    }

    /**
     * 执行数据库备份
     */
    public function backup(string $description = null): array
    {
        try {
            $timestamp = Carbon::now()->format('Y-m-d_H-i-s');
            $filename = "backup_{$timestamp}.sql";
            $filepath = "{$this->backupPath}/{$filename}";
            
            // 获取数据库配置
            $connection = DB::connection();
            $dbConfig = $connection->getConfig();
            
            // 生成备份SQL
            $backupContent = $this->generateBackupSQL($connection);
            
            // 保存备份文件
            Storage::disk($this->disk)->put($filepath, $backupContent);
            
            // 记录备份信息
            $backupInfo = [
                'filename' => $filename,
                'filepath' => $filepath,
                'size' => Storage::disk($this->disk)->size($filepath),
                'created_at' => Carbon::now(),
                'description' => $description,
                'database' => $dbConfig['database'],
                'tables_count' => $this->getTablesCount(),
            ];
            
            // 清理旧备份
            $this->cleanupOldBackups();
            
            Log::info('数据库备份成功', $backupInfo);
            
            return [
                'success' => true,
                'message' => '数据库备份成功',
                'data' => $backupInfo
            ];
            
        } catch (Exception $e) {
            Log::error('数据库备份失败: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => '数据库备份失败: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * 生成备份SQL内容
     */
    protected function generateBackupSQL($connection): string
    {
        $dbName = $connection->getDatabaseName();
        $driver = $connection->getDriverName();
        
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
        $port = $config['port'] ?? 5432;
        $username = $config['username'];
        $password = $config['password'];
        
        // 设置环境变量避免密码提示
        putenv("PGPASSWORD={$password}");
        
        // 生成pg_dump命令
        $command = sprintf(
            'pg_dump -h %s -p %s -U %s -d %s --no-owner --no-privileges --clean --if-exists',
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
        $port = $config['port'] ?? 3306;
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
     * 获取备份文件列表
     */
    public function getBackupList(): array
    {
        try {
            $files = Storage::disk($this->disk)->files($this->backupPath);
            $backups = [];
            
            foreach ($files as $file) {
                if (pathinfo($file, PATHINFO_EXTENSION) === 'sql') {
                    $backups[] = [
                        'filename' => basename($file),
                        'filepath' => $file,
                        'size' => Storage::disk($this->disk)->size($file),
                        'size_human' => $this->formatBytes(Storage::disk($this->disk)->size($file)),
                        'created_at' => Carbon::createFromTimestamp(Storage::disk($this->disk)->lastModified($file)),
                        'created_at_human' => Carbon::createFromTimestamp(Storage::disk($this->disk)->lastModified($file))->diffForHumans(),
                    ];
                }
            }
            
            // 按创建时间倒序排列
            usort($backups, function($a, $b) {
                return $b['created_at']->timestamp - $a['created_at']->timestamp;
            });
            
            return [
                'success' => true,
                'data' => $backups
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
            $filepath = "{$this->backupPath}/{$filename}";
            
            if (!Storage::disk($this->disk)->exists($filepath)) {
                return [
                    'success' => false,
                    'message' => '备份文件不存在'
                ];
            }
            
            return [
                'success' => true,
                'path' => Storage::disk($this->disk)->path($filepath),
                'content' => Storage::disk($this->disk)->get($filepath),
                'size' => Storage::disk($this->disk)->size($filepath)
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
            $filepath = "{$this->backupPath}/{$filename}";
            
            if (!Storage::disk($this->disk)->exists($filepath)) {
                return [
                    'success' => false,
                    'message' => '备份文件不存在'
                ];
            }
            
            Storage::disk($this->disk)->delete($filepath);
            
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
            $files = Storage::disk($this->disk)->files($this->backupPath);
            $backupFiles = [];
            
            foreach ($files as $file) {
                if (pathinfo($file, PATHINFO_EXTENSION) === 'sql') {
                    $backupFiles[] = [
                        'file' => $file,
                        'time' => Storage::disk($this->disk)->lastModified($file)
                    ];
                }
            }
            
            // 按时间排序，保留最新的文件
            usort($backupFiles, function($a, $b) {
                return $b['time'] - $a['time'];
            });
            
            // 删除超过限制的旧文件
            if (count($backupFiles) > $this->maxBackups) {
                $filesToDelete = array_slice($backupFiles, $this->maxBackups);
                
                foreach ($filesToDelete as $fileInfo) {
                    Storage::disk($this->disk)->delete($fileInfo['file']);
                    Log::info('清理旧备份文件: ' . $fileInfo['file']);
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
            $filepath = "{$this->backupPath}/{$filename}";
            
            if (!Storage::disk($this->disk)->exists($filepath)) {
                return [
                    'success' => false,
                    'message' => '备份文件不存在'
                ];
            }
            
            $sqlContent = Storage::disk($this->disk)->get($filepath);
            
            // 执行SQL恢复
            DB::unprepared($sqlContent);
            
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