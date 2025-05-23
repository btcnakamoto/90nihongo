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
            if (!preg_match('/^backup_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.sql$/', $filename)) {
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
            if (!preg_match('/^backup_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.sql$/', $filename)) {
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
            if (!preg_match('/^backup_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.sql$/', $filename)) {
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
} 