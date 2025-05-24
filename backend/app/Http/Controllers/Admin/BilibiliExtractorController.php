<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Str;
use App\Models\BilibiliExtractJob;
use App\Jobs\ProcessBilibiliExtraction;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class BilibiliExtractorController extends Controller
{
    /**
     * 获取视频信息
     */
    public function getVideoInfo(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'url' => 'required|string|url'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => '无效的URL格式',
                'errors' => $validator->errors()
            ], 400);
        }

        $url = $request->input('url');

        try {
            // 调用Python脚本获取视频信息
            $pythonPath = config('app.python_path', 'python');
            $scriptPath = base_path('python/get_video_info.py');
            
            $command = [
                $pythonPath,
                $scriptPath,
                $url
            ];

            $process = Process::run($command);

            if ($process->failed()) {
                Log::error('获取B站视频信息失败', [
                    'url' => $url,
                    'error' => $process->errorOutput()
                ]);

                return response()->json([
                    'success' => false,
                    'message' => '获取视频信息失败: ' . $process->errorOutput()
                ], 500);
            }

            $output = $process->output();
            $videoInfo = json_decode($output, true);

            if (!$videoInfo) {
                return response()->json([
                    'success' => false,
                    'message' => '无法解析视频信息'
                ], 500);
            }

            return response()->json([
                'success' => true,
                'video_info' => $videoInfo
            ]);

        } catch (\Exception $e) {
            Log::error('获取视频信息时发生异常', [
                'url' => $url,
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => '服务器内部错误'
            ], 500);
        }
    }

    /**
     * 提交提取任务
     */
    public function submitExtraction(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'video_url' => 'required|string|url',
            'start_time' => 'required|string',
            'end_time' => 'required|string',
            'description' => 'nullable|string|max:500',
            'use_ai_subtitle' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => '请求参数验证失败',
                'errors' => $validator->errors()
            ], 400);
        }

        try {
            // 创建提取任务记录
            $job = BilibiliExtractJob::create([
                'id' => Str::uuid(),
                'admin_id' => auth('admin')->id(),
                'video_url' => $request->input('video_url'),
                'start_time' => $request->input('start_time'),
                'end_time' => $request->input('end_time'),
                'description' => $request->input('description'),
                'use_ai_subtitle' => $request->input('use_ai_subtitle', true),
                'status' => 'pending',
                'created_at' => now()
            ]);

            // 分发到队列处理
            ProcessBilibiliExtraction::dispatch($job);

            Log::info('B站提取任务已创建', [
                'job_id' => $job->id,
                'admin_id' => auth('admin')->id(),
                'video_url' => $request->input('video_url')
            ]);

            return response()->json([
                'success' => true,
                'message' => '提取任务已提交',
                'job_id' => $job->id
            ]);

        } catch (\Exception $e) {
            Log::error('提交B站提取任务失败', [
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => '提交任务失败'
            ], 500);
        }
    }

    /**
     * 获取任务列表
     */
    public function getJobs(Request $request): JsonResponse
    {
        try {
            $perPage = $request->input('per_page', 20);
            $page = $request->input('page', 1);

            $jobs = BilibiliExtractJob::with('admin:id,username')
                ->orderBy('created_at', 'desc')
                ->paginate($perPage, ['*'], 'page', $page);

            $formattedJobs = $jobs->getCollection()->map(function ($job) {
                return [
                    'id' => $job->id,
                    'videoUrl' => $job->video_url,
                    'videoTitle' => $job->video_title,
                    'startTime' => $job->start_time,
                    'endTime' => $job->end_time,
                    'description' => $job->description,
                    'status' => $job->status,
                    'progress' => $job->progress,
                    'audioPath' => $job->audio_path,
                    'subtitlePath' => $job->subtitle_path,
                    'subtitleText' => $job->subtitle_text,
                    'error' => $job->error_message,
                    'createdAt' => $job->created_at->toISOString(),
                    'completedAt' => $job->completed_at?->toISOString(),
                    'admin' => $job->admin ? $job->admin->username : null
                ];
            });

            return response()->json([
                'success' => true,
                'jobs' => $formattedJobs,
                'pagination' => [
                    'current_page' => $jobs->currentPage(),
                    'last_page' => $jobs->lastPage(),
                    'per_page' => $jobs->perPage(),
                    'total' => $jobs->total()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('获取B站提取任务列表失败', [
                'exception' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => '获取任务列表失败'
            ], 500);
        }
    }

    /**
     * 获取单个任务详情
     */
    public function getJob(string $jobId): JsonResponse
    {
        try {
            $job = BilibiliExtractJob::with('admin:id,username')->findOrFail($jobId);

            return response()->json([
                'success' => true,
                'job' => [
                    'id' => $job->id,
                    'videoUrl' => $job->video_url,
                    'videoTitle' => $job->video_title,
                    'startTime' => $job->start_time,
                    'endTime' => $job->end_time,
                    'description' => $job->description,
                    'status' => $job->status,
                    'progress' => $job->progress,
                    'audioPath' => $job->audio_path,
                    'subtitlePath' => $job->subtitle_path,
                    'subtitleText' => $job->subtitle_text,
                    'error' => $job->error_message,
                    'createdAt' => $job->created_at->toISOString(),
                    'completedAt' => $job->completed_at?->toISOString(),
                    'admin' => $job->admin ? $job->admin->username : null
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '任务不存在'
            ], 404);
        }
    }

    /**
     * 删除任务
     */
    public function deleteJob(string $jobId): JsonResponse
    {
        try {
            $job = BilibiliExtractJob::findOrFail($jobId);

            // 删除相关文件
            if ($job->audio_path && Storage::exists($job->audio_path)) {
                Storage::delete($job->audio_path);
            }

            if ($job->subtitle_path && Storage::exists($job->subtitle_path)) {
                Storage::delete($job->subtitle_path);
            }

            // 删除任务记录
            $job->delete();

            Log::info('B站提取任务已删除', [
                'job_id' => $jobId,
                'admin_id' => auth('admin')->id()
            ]);

            return response()->json([
                'success' => true,
                'message' => '任务已删除'
            ]);

        } catch (\Exception $e) {
            Log::error('删除B站提取任务失败', [
                'job_id' => $jobId,
                'exception' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => '删除任务失败'
            ], 500);
        }
    }

        /**     * 下载提取的文件     */    public function downloadFile(string $jobId, string $fileType)
    {
        try {
            $job = BilibiliExtractJob::findOrFail($jobId);

            if ($job->status !== 'completed') {
                return response()->json([
                    'success' => false,
                    'message' => '任务尚未完成'
                ], 400);
            }

            $filePath = null;
            $fileName = null;

            switch ($fileType) {
                case 'audio':
                    $filePath = $job->audio_path;
                    $fileName = "audio_" . $job->id . ".wav";
                    break;
                case 'subtitle':
                    $filePath = $job->subtitle_path;
                    $fileName = "subtitle_" . $job->id . ".srt";
                    break;
                default:
                    return response()->json([
                        'success' => false,
                        'message' => '无效的文件类型'
                    ], 400);
            }

            if (!$filePath || !Storage::exists($filePath)) {
                return response()->json([
                    'success' => false,
                    'message' => '文件不存在'
                ], 404);
            }

            return Storage::download($filePath, $fileName);

        } catch (\Exception $e) {
            Log::error('下载B站提取文件失败', [
                'job_id' => $jobId,
                'file_type' => $fileType,
                'exception' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => '下载失败'
            ], 500);
        }
    }

    /**
     * 重新提交失败的任务
     */
    public function retryJob(string $jobId): JsonResponse
    {
        try {
            $job = BilibiliExtractJob::findOrFail($jobId);

            if ($job->status !== 'failed') {
                return response()->json([
                    'success' => false,
                    'message' => '只能重试失败的任务'
                ], 400);
            }

            // 重置任务状态
            $job->update([
                'status' => 'pending',
                'progress' => 0,
                'error_message' => null,
                'audio_path' => null,
                'subtitle_path' => null,
                'subtitle_text' => null,
                'completed_at' => null
            ]);

            // 重新分发到队列
            ProcessBilibiliExtraction::dispatch($job);

            Log::info('B站提取任务重新提交', [
                'job_id' => $jobId,
                'admin_id' => auth('admin')->id()
            ]);

            return response()->json([
                'success' => true,
                'message' => '任务已重新提交'
            ]);

        } catch (\Exception $e) {
            Log::error('重试B站提取任务失败', [
                'job_id' => $jobId,
                'exception' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => '重试失败'
            ], 500);
        }
    }

    /**
     * 获取系统状态
     */
    public function getSystemStatus(): JsonResponse
    {
        try {
            $status = [
                'python' => $this->checkPython(),
                'ffmpeg' => $this->checkFFmpeg(),
                'whisper' => $this->checkWhisper(),
                'storage' => $this->checkStorage(),
                'queue' => $this->checkQueue()
            ];

            return response()->json([
                'success' => true,
                'status' => $status
            ]);

        } catch (\Exception $e) {
            Log::error('获取系统状态失败', [
                'exception' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => '获取系统状态失败'
            ], 500);
        }
    }

    /**
     * 检查Python环境
     */
    private function checkPython(): array
    {
        try {
            $pythonPath = config('app.python_path', 'python');
            $process = Process::run([$pythonPath, '--version']);
            
            return [
                'available' => $process->successful(),
                'version' => trim($process->output()),
                'message' => $process->successful() ? '正常' : '未找到Python'
            ];
        } catch (\Exception $e) {
            return [
                'available' => false,
                'version' => null,
                'message' => 'Python检查失败'
            ];
        }
    }

    /**
     * 检查FFmpeg
     */
    private function checkFFmpeg(): array
    {
        try {
            $process = Process::run(['ffmpeg', '-version']);
            $output = $process->output();
            
            preg_match('/ffmpeg version ([^\s]+)/', $output, $matches);
            $version = $matches[1] ?? '未知版本';
            
            return [
                'available' => $process->successful(),
                'version' => $version,
                'message' => $process->successful() ? '正常' : '未找到FFmpeg'
            ];
        } catch (\Exception $e) {
            return [
                'available' => false,
                'version' => null,
                'message' => 'FFmpeg检查失败'
            ];
        }
    }

    /**
     * 检查Whisper
     */
    private function checkWhisper(): array
    {
        try {
            $pythonPath = config('app.python_path', 'python');
            $process = Process::run([$pythonPath, '-c', 'import whisper; print("OK")']);
            
            return [
                'available' => $process->successful(),
                'version' => null,
                'message' => $process->successful() ? '已安装' : '未安装Whisper'
            ];
        } catch (\Exception $e) {
            return [
                'available' => false,
                'version' => null,
                'message' => 'Whisper检查失败'
            ];
        }
    }

    /**
     * 检查存储空间
     */
    private function checkStorage(): array
    {
        try {
            $storagePath = storage_path('app/bilibili_extracts');
            
            if (!is_dir($storagePath)) {
                mkdir($storagePath, 0755, true);
            }
            
            $freeSpace = disk_free_space($storagePath);
            $totalSpace = disk_total_space($storagePath);
            
            return [
                'available' => true,
                'free_space' => $this->formatBytes($freeSpace),
                'total_space' => $this->formatBytes($totalSpace),
                'message' => '存储正常'
            ];
        } catch (\Exception $e) {
            return [
                'available' => false,
                'message' => '存储检查失败'
            ];
        }
    }

    /**
     * 检查队列状态
     */
    private function checkQueue(): array
    {
        try {
            $pendingJobs = BilibiliExtractJob::where('status', 'pending')->count();
            $processingJobs = BilibiliExtractJob::where('status', 'processing')->count();
            
            return [
                'available' => true,
                'pending_jobs' => $pendingJobs,
                'processing_jobs' => $processingJobs,
                'message' => '队列正常'
            ];
        } catch (\Exception $e) {
            return [
                'available' => false,
                'message' => '队列检查失败'
            ];
        }
    }

    /**
     * 格式化字节数
     */
    private function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $factor = floor(log($bytes, 1024));
        
        return sprintf('%.2f %s', $bytes / pow(1024, $factor), $units[$factor]);
    }
} 