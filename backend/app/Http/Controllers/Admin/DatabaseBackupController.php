<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\DatabaseBackupService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class DatabaseBackupController extends Controller
{
    /**
     * 备份服务
     *
     * @var DatabaseBackupService
     */
    protected $backupService;

    public function __construct(DatabaseBackupService $backupService)
    {
        $this->backupService = $backupService;
    }

    /**
     * 获取备份列表
     */
    public function index(): JsonResponse
    {
        try {
            $result = $this->backupService->getBackupList();
            
            return response()->json([
                'code' => $result['success'] ? 200 : 500,
                'message' => $result['success'] ? '获取成功' : $result['message'],
                'data' => $result['data'] ?? []
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'code' => 500,
                'message' => '获取备份列表失败: ' . $e->getMessage(),
                'data' => []
            ]);
        }
    }

    /**
     * 创建新备份
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'description' => 'nullable|string|max:255'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'code' => 400,
                    'message' => '参数验证失败',
                    'data' => $validator->errors()
                ]);
            }

            $description = $request->input('description');
            $result = $this->backupService->backup($description);
            
            return response()->json([
                'code' => $result['success'] ? 200 : 500,
                'message' => $result['message'],
                'data' => $result['data'] ?? null
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'code' => 500,
                'message' => '创建备份失败: ' . $e->getMessage(),
                'data' => null
            ]);
        }
    }

    /**
     * 下载备份文件
     */
    public function download(string $filename)
    {
        try {
            // 验证文件名格式
            if (!$this->isValidBackupFilename($filename)) {
                return response()->json([
                    'code' => 400,
                    'message' => '无效的文件名格式'
                ]);
            }

            $result = $this->backupService->downloadBackup($filename);
            
            if (!$result['success']) {
                return response()->json([
                    'code' => 404,
                    'message' => $result['message']
                ]);
            }

            return response($result['content'])
                ->header('Content-Type', 'application/sql')
                ->header('Content-Disposition', 'attachment; filename="' . $filename . '"')
                ->header('Content-Length', $result['size']);
                
        } catch (\Exception $e) {
            return response()->json([
                'code' => 500,
                'message' => '下载失败: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * 删除备份文件
     */
    public function destroy(string $filename): JsonResponse
    {
        try {
            // 验证文件名格式
            if (!$this->isValidBackupFilename($filename)) {
                return response()->json([
                    'code' => 400,
                    'message' => '无效的文件名格式'
                ]);
            }

            $result = $this->backupService->deleteBackup($filename);
            
            return response()->json([
                'code' => $result['success'] ? 200 : 500,
                'message' => $result['message']
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'code' => 500,
                'message' => '删除失败: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * 恢复数据库
     */
    public function restore(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'filename' => 'required|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'code' => 400,
                    'message' => '参数验证失败',
                    'data' => $validator->errors()
                ]);
            }

            $filename = $request->input('filename');
            
            // 验证文件名格式
            if (!$this->isValidBackupFilename($filename)) {
                return response()->json([
                    'code' => 400,
                    'message' => '无效的文件名格式'
                ]);
            }

            $result = $this->backupService->restore($filename);
            
            return response()->json([
                'code' => $result['success'] ? 200 : 500,
                'message' => $result['message']
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'code' => 500,
                'message' => '恢复失败: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * 获取数据库状态信息
     */
    public function status(): JsonResponse
    {
        try {
            $connection = DB::connection();
            $dbConfig = $connection->getConfig();
            
            // 获取数据库基本信息
            $driver = $connection->getDriverName();
            $dbName = $connection->getDatabaseName();
            
            // 获取表数量
            if ($driver === 'pgsql') {
                $tablesResult = DB::select("
                    SELECT COUNT(*) as count 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_type = 'BASE TABLE'
                ");
            } elseif ($driver === 'mysql') {
                $tablesResult = DB::select("
                    SELECT COUNT(*) as count 
                    FROM information_schema.tables 
                    WHERE table_schema = DATABASE()
                ");
            } else {
                $tablesResult = [['count' => 0]];
            }
            
            $tablesCount = $tablesResult[0]->count ?? 0;
            
            // 获取数据库大小 (PostgreSQL)
            $dbSize = 0;
            if ($driver === 'pgsql') {
                try {
                    $sizeResult = DB::select("SELECT pg_database_size(?) as size", [$dbName]);
                    $dbSize = $sizeResult[0]->size ?? 0;
                } catch (\Exception $e) {
                    // 忽略大小获取错误
                }
            }
            
            // 获取备份统计
            $backupResult = $this->backupService->getBackupList();
            $backupCount = $backupResult['success'] ? count($backupResult['data']) : 0;
            
            return response()->json([
                'code' => 200,
                'message' => '获取成功',
                'data' => [
                    'database' => [
                        'name' => $dbName,
                        'driver' => $driver,
                        'host' => $dbConfig['host'] ?? '未知',
                        'port' => $dbConfig['port'] ?? '未知',
                        'tables_count' => $tablesCount,
                        'size' => $dbSize,
                        'size_human' => $this->formatBytes($dbSize),
                    ],
                    'backups' => [
                        'count' => $backupCount,
                        'latest' => $backupResult['success'] && !empty($backupResult['data']) 
                            ? $backupResult['data'][0]['created_at_human'] 
                            : '无'
                    ]
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'code' => 500,
                'message' => '获取状态失败: ' . $e->getMessage(),
                'data' => null
            ]);
        }
    }

    /**
     * 备份指定的表
     */
    public function backupTables(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'tables' => 'required|array|min:1',
                'tables.*' => 'required|string|max:64',
                'description' => 'nullable|string|max:255'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'code' => 400,
                    'message' => '参数验证失败',
                    'data' => $validator->errors()
                ]);
            }

            $tables = $request->input('tables');
            $description = $request->input('description');
            
            // 验证表名是否存在
            $connection = DB::connection();
            $driver = $connection->getDriverName();
            $dbName = $connection->getDatabaseName();
            
            $existingTables = [];
            if ($driver === 'mysql') {
                $tablesResult = DB::select("
                    SELECT TABLE_NAME as table_name
                    FROM information_schema.TABLES 
                    WHERE TABLE_SCHEMA = ?
                ", [$dbName]);
                $existingTables = array_column($tablesResult, 'table_name');
            } elseif ($driver === 'pgsql') {
                $tablesResult = DB::select("
                    SELECT tablename as table_name
                    FROM pg_tables 
                    WHERE schemaname = 'public'
                ");
                $existingTables = array_column($tablesResult, 'table_name');
            }
            
            // 检查表是否存在
            $invalidTables = array_diff($tables, $existingTables);
            if (!empty($invalidTables)) {
                return response()->json([
                    'code' => 400,
                    'message' => '以下表不存在: ' . implode(', ', $invalidTables)
                ]);
            }

            $result = $this->backupService->backupTables($tables, $description);
            
            return response()->json([
                'code' => $result['success'] ? 200 : 500,
                'message' => $result['message'],
                'data' => $result['data'] ?? null
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'code' => 500,
                'message' => '备份指定表失败: ' . $e->getMessage(),
                'data' => null
            ]);
        }
    }

    /**
     * 获取数据库表信息
     */
    public function tables(): JsonResponse
    {
        try {
            $connection = DB::connection();
            $driver = $connection->getDriverName();
            $dbName = $connection->getDatabaseName();
            
            $tables = [];
            
            if ($driver === 'mysql') {
                // MySQL数据库
                $tablesResult = DB::select("
                    SELECT 
                        TABLE_NAME as table_name,
                        ENGINE as engine,
                        TABLE_ROWS as rows,
                        AVG_ROW_LENGTH as avg_row_length,
                        DATA_LENGTH as data_length,
                        INDEX_LENGTH as index_length,
                        DATA_FREE as data_free,
                        AUTO_INCREMENT as auto_increment,
                        CREATE_TIME as create_time,
                        UPDATE_TIME as update_time,
                        TABLE_COLLATION as table_collation,
                        TABLE_COMMENT as table_comment,
                        (DATA_LENGTH + INDEX_LENGTH) as total_size
                    FROM information_schema.TABLES 
                    WHERE TABLE_SCHEMA = ?
                    ORDER BY table_name
                ", [$dbName]);
                
                foreach ($tablesResult as $table) {
                    $totalSize = ($table->data_length ?? 0) + ($table->index_length ?? 0);
                    $tables[] = [
                        'table_name' => $table->table_name,
                        'engine' => $table->engine ?? 'Unknown',
                        'rows' => (int)($table->rows ?? 0),
                        'avg_row_length' => (int)($table->avg_row_length ?? 0),
                        'data_length' => (int)($table->data_length ?? 0),
                        'index_length' => (int)($table->index_length ?? 0),
                        'data_free' => (int)($table->data_free ?? 0),
                        'auto_increment' => $table->auto_increment ? (int)$table->auto_increment : null,
                        'create_time' => $table->create_time ? $table->create_time->format('Y-m-d H:i:s') : '未知',
                        'update_time' => $table->update_time ? $table->update_time->format('Y-m-d H:i:s') : null,
                        'table_collation' => $table->table_collation ?? 'utf8mb4_unicode_ci',
                        'table_comment' => $table->table_comment ?? '',
                        'size_human' => $this->formatBytes($totalSize),
                        'total_size' => $totalSize
                    ];
                }
            } elseif ($driver === 'pgsql') {
                // PostgreSQL数据库
                $tablesResult = DB::select("
                    SELECT 
                        schemaname,
                        tablename as table_name,
                        pg_total_relation_size(schemaname||'.'||tablename) as total_size,
                        pg_relation_size(schemaname||'.'||tablename) as data_length,
                        pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename) as index_length
                    FROM pg_tables 
                    WHERE schemaname = 'public'
                    ORDER BY tablename
                ");
                
                foreach ($tablesResult as $table) {
                    $totalSize = $table->total_size ?? 0;
                    
                    // 获取行数
                    try {
                        $rowCountResult = DB::select("SELECT COUNT(*) as count FROM {$table->table_name}");
                        $rowCount = $rowCountResult[0]->count ?? 0;
                    } catch (\Exception $e) {
                        $rowCount = 0;
                    }
                    
                    $tables[] = [
                        'table_name' => $table->table_name,
                        'engine' => 'PostgreSQL',
                        'rows' => (int)$rowCount,
                        'avg_row_length' => $rowCount > 0 ? round(($table->data_length ?? 0) / $rowCount) : 0,
                        'data_length' => (int)($table->data_length ?? 0),
                        'index_length' => (int)($table->index_length ?? 0),
                        'data_free' => 0,
                        'auto_increment' => null,
                        'create_time' => '未知',
                        'update_time' => null,
                        'table_collation' => 'utf8',
                        'table_comment' => '',
                        'size_human' => $this->formatBytes($totalSize),
                        'total_size' => $totalSize
                    ];
                }
            } else {
                // 其他数据库类型
                return response()->json([
                    'code' => 500,
                    'message' => '不支持的数据库类型: ' . $driver,
                    'data' => []
                ]);
            }
            
            return response()->json([
                'code' => 200,
                'message' => '获取成功',
                'data' => $tables
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'code' => 500,
                'message' => '获取表信息失败: ' . $e->getMessage(),
                'data' => []
            ]);
        }
    }

    /**
     * 格式化文件大小
     */
    private function formatBytes(int $size, int $precision = 2): string
    {
        if ($size == 0) return '0 B';
        
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $size > 1024 && $i < count($units) - 1; $i++) {
            $size /= 1024;
        }
        
        return round($size, $precision) . ' ' . $units[$i];
    }

    /**
     * 验证备份文件名格式
     * 支持两种格式：
     * 1. 完整备份：backup_YYYY-mm-dd_HH-ii-ss.sql
     * 2. 指定表备份：backup_tables_{tablesStr}_YYYY-mm-dd_HH-ii-ss.sql
     */
    private function isValidBackupFilename(string $filename): bool
    {
        return preg_match('/^backup_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.sql$/', $filename) ||
               preg_match('/^backup_tables_.+_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.sql$/', $filename);
    }
} 