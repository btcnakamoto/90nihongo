<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;
use App\Models\ImportTask;
use App\Models\ResourceItem;
use App\Jobs\ProcessWebScrapingJob;
use App\Jobs\ProcessFileUploadJob;
use App\Jobs\ProcessApiImportJob;

class ResourceController extends Controller
{
    /**
     * 获取资源列表
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $resources = ResourceItem::orderBy('created_at', 'desc')
                ->paginate($request->get('per_page', 15));

            return response()->json([
                'status' => 'success',
                'data' => $resources
            ]);
        } catch (\Exception $e) {
            Log::error('获取资源列表失败: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => '获取资源列表失败'
            ], 500);
        }
    }

    /**
     * 获取导入任务列表
     */
    public function getTasks(Request $request): JsonResponse
    {
        try {
            $tasks = ImportTask::orderBy('created_at', 'desc')
                ->paginate($request->get('per_page', 15));

            return response()->json([
                'status' => 'success',
                'data' => $tasks
            ]);
        } catch (\Exception $e) {
            Log::error('获取任务列表失败: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => '获取任务列表失败'
            ], 500);
        }
    }

    /**
     * 启动网页抓取任务
     */
    public function startWebScraping(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'urls' => 'required|string',
            'max_pages' => 'required|integer|min:1|max:1000',
            'content_type' => 'required|string|in:course,material,vocabulary,news',
            'delay_ms' => 'integer|min:100|max:10000',
            'include_images' => 'boolean',
            'include_audio' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => '参数验证失败',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $urls = array_filter(explode("\n", $request->urls));
            if (empty($urls)) {
                return response()->json([
                    'status' => 'error',
                    'message' => '请至少提供一个有效的URL'
                ], 422);
            }

            $task = ImportTask::create([
                'type' => 'web-scraping',
                'name' => '网页抓取 - ' . $request->content_type,
                'status' => 'pending',
                'progress' => 0,
                'total_items' => $request->max_pages,
                'items_processed' => 0,
                'config' => [
                    'urls' => $urls,
                    'max_pages' => $request->max_pages,
                    'content_type' => $request->content_type,
                    'delay_ms' => $request->delay_ms ?? 1000,
                    'include_images' => $request->include_images ?? false,
                    'include_audio' => $request->include_audio ?? false
                ],
                'logs' => ['任务已创建', '等待执行...']
            ]);

            // 队列任务
            ProcessWebScrapingJob::dispatch($task);

            return response()->json([
                'status' => 'success',
                'message' => '网页抓取任务已启动',
                'data' => $task
            ]);
        } catch (\Exception $e) {
            Log::error('启动网页抓取任务失败: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => '启动任务失败'
            ], 500);
        }
    }

    /**
     * 文件上传处理
     */
    public function uploadFiles(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'files' => 'required|array',
            'files.*' => 'file|max:102400' // 最大100MB
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => '文件验证失败',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $files = $request->file('files');
            $uploadedFiles = [];

            foreach ($files as $file) {
                if ($file->isValid()) {
                    $filename = time() . '_' . $file->getClientOriginalName();
                    $path = $file->storeAs('uploads/resources', $filename, 'public');
                    
                    $uploadedFiles[] = [
                        'original_name' => $file->getClientOriginalName(),
                        'filename' => $filename,
                        'path' => $path,
                        'size' => $file->getSize(),
                        'type' => $file->getClientMimeType()
                    ];
                }
            }

            if (empty($uploadedFiles)) {
                return response()->json([
                    'status' => 'error',
                    'message' => '没有有效的文件上传'
                ], 422);
            }

            $task = ImportTask::create([
                'type' => 'file-upload',
                'name' => '文件上传 - ' . count($uploadedFiles) . '个文件',
                'status' => 'pending',
                'progress' => 0,
                'total_items' => count($uploadedFiles),
                'items_processed' => 0,
                'config' => [
                    'files' => $uploadedFiles
                ],
                'logs' => ['文件上传完成', '开始处理...']
            ]);

            // 队列任务
            ProcessFileUploadJob::dispatch($task);

            return response()->json([
                'status' => 'success',
                'message' => '文件上传成功，开始处理',
                'data' => $task
            ]);
        } catch (\Exception $e) {
            Log::error('文件上传失败: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => '文件上传失败'
            ], 500);
        }
    }

    /**
     * API导入
     */
    public function startApiImport(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'endpoint' => 'required|url',
            'api_key' => 'required|string',
            'format' => 'required|string|in:json,xml,csv',
            'batch_size' => 'integer|min:1|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => '参数验证失败',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // 测试API连接
            $response = Http::timeout(10)
                ->withHeaders(['Authorization' => 'Bearer ' . $request->api_key])
                ->get($request->endpoint);

            if (!$response->successful()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'API连接测试失败'
                ], 422);
            }

            $task = ImportTask::create([
                'type' => 'api-import',
                'name' => 'API导入 - ' . parse_url($request->endpoint, PHP_URL_HOST),
                'status' => 'pending',
                'progress' => 0,
                'total_items' => $request->batch_size ?? 100,
                'items_processed' => 0,
                'config' => [
                    'endpoint' => $request->endpoint,
                    'api_key' => $request->api_key,
                    'format' => $request->format,
                    'batch_size' => $request->batch_size ?? 100
                ],
                'logs' => ['API连接测试成功', '开始导入数据...']
            ]);

            // 队列任务
            ProcessApiImportJob::dispatch($task);

            return response()->json([
                'status' => 'success',
                'message' => 'API导入任务已启动',
                'data' => $task
            ]);
        } catch (\Exception $e) {
            Log::error('API导入失败: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'API导入失败'
            ], 500);
        }
    }

    /**
     * 暂停/恢复任务
     */
    public function toggleTask(Request $request, $taskId): JsonResponse
    {
        try {
            $task = ImportTask::findOrFail($taskId);
            
            if ($task->status === 'running') {
                $task->update(['status' => 'paused']);
                $task->addLog('任务已暂停');
            } elseif ($task->status === 'paused') {
                $task->update(['status' => 'running']);
                $task->addLog('任务已恢复');
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => '任务状态不允许此操作'
                ], 422);
            }

            return response()->json([
                'status' => 'success',
                'message' => '任务状态已更新',
                'data' => $task
            ]);
        } catch (\Exception $e) {
            Log::error('切换任务状态失败: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => '操作失败'
            ], 500);
        }
    }

    /**
     * 取消任务
     */
    public function cancelTask(Request $request, $taskId): JsonResponse
    {
        try {
            $task = ImportTask::findOrFail($taskId);
            
            if (in_array($task->status, ['completed', 'failed'])) {
                return response()->json([
                    'status' => 'error',
                    'message' => '已完成的任务无法取消'
                ], 422);
            }

            $task->update(['status' => 'cancelled']);
            $task->addLog('任务已取消');

            return response()->json([
                'status' => 'success',
                'message' => '任务已取消',
                'data' => $task
            ]);
        } catch (\Exception $e) {
            Log::error('取消任务失败: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => '取消任务失败'
            ], 500);
        }
    }

    /**
     * 获取任务详情
     */
    public function getTaskDetail(Request $request, $taskId): JsonResponse
    {
        try {
            $task = ImportTask::with('resources')->findOrFail($taskId);

            return response()->json([
                'status' => 'success',
                'data' => $task
            ]);
        } catch (\Exception $e) {
            Log::error('获取任务详情失败: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => '获取任务详情失败'
            ], 500);
        }
    }

    /**
     * 删除资源
     */
    public function deleteResource(Request $request, $resourceId): JsonResponse
    {
        try {
            $resource = ResourceItem::findOrFail($resourceId);
            
            // 删除关联文件
            if ($resource->file_path) {
                Storage::disk('public')->delete($resource->file_path);
            }

            $resource->delete();

            return response()->json([
                'status' => 'success',
                'message' => '资源已删除'
            ]);
        } catch (\Exception $e) {
            Log::error('删除资源失败: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => '删除资源失败'
            ], 500);
        }
    }

    /**
     * 获取资源统计信息
     */
    public function getStats(): JsonResponse
    {
        try {
            $stats = [
                'total_resources' => ResourceItem::count(),
                'running_tasks' => ImportTask::where('status', 'running')->count(),
                'today_imported' => ResourceItem::whereDate('created_at', today())->count(),
                'success_rate' => $this->calculateSuccessRate()
            ];

            return response()->json([
                'status' => 'success',
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            Log::error('获取统计信息失败: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => '获取统计信息失败'
            ], 500);
        }
    }

    /**
     * 计算成功率
     */
    private function calculateSuccessRate(): float
    {
        $totalTasks = ImportTask::count();
        if ($totalTasks === 0) {
            return 100.0;
        }

        $successfulTasks = ImportTask::where('status', 'completed')->count();
        return round(($successfulTasks / $totalTasks) * 100, 1);
    }
} 