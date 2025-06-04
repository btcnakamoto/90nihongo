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
     * 提交提取任务（直接执行）
     */
    public function submitExtraction(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'video_url' => 'required|string|url',
            'start_time' => 'required|string',
            'end_time' => 'required|string',
            'description' => 'nullable|string|max:500',
            'use_ai_subtitle' => 'boolean',
            'extraction_mode' => 'nullable|string|in:online,offline'
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
                'extraction_mode' => $request->input('extraction_mode', 'offline'),
                'status' => 'processing',
                'progress' => 0,
                'created_at' => now()
            ]);

            Log::info('开始直接执行B站提取任务', [
                'job_id' => $job->id,
                'admin_id' => auth('admin')->id(),
                'video_url' => $request->input('video_url')
            ]);

            // 直接执行提取
            $result = $this->executeExtraction($job);

            // 更新任务状态
            $job->update([
                'status' => 'completed',
                'progress' => 100,
                'video_title' => $result['video_info']['title'] ?? null,
                'audio_path' => $result['audio_path'] ?? null,
                'subtitle_path' => $result['subtitle_path'] ?? null,
                'subtitle_text' => $result['subtitle_text'] ?? null,
                'completed_at' => now()
            ]);

            Log::info('B站提取任务完成', [
                'job_id' => $job->id,
                'audio_path' => $result['audio_path'] ?? null
            ]);

            return response()->json([
                'success' => true,
                'message' => '提取完成',
                'job_id' => $job->id,
                'result' => [
                    'video_title' => $result['video_info']['title'] ?? null,
                    'audio_path' => $result['audio_path'] ?? null,
                    'subtitle_path' => $result['subtitle_path'] ?? null,
                    'subtitle_text' => $result['subtitle_text'] ?? null
                ]
            ]);

        } catch (\Exception $e) {
            // 更新任务状态为失败
            if (isset($job)) {
                $job->update([
                    'status' => 'failed',
                    'error_message' => $e->getMessage(),
                    'completed_at' => now()
                ]);
            }

            Log::error('B站提取任务失败', [
                'job_id' => $job->id ?? 'unknown',
                'extraction_mode' => $job->extraction_mode ?? 'unknown',
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // 为在线模式提供更友好的错误信息
            $errorMessage = $e->getMessage();
            if (isset($job) && $job->extraction_mode === 'online') {
                if (strpos($errorMessage, 'DNS解析') !== false || strpos($errorMessage, 'getaddrinfo failed') !== false) {
                    $errorMessage = '网络连接失败，请检查网络设置或尝试使用离线模式';
                } elseif (strpos($errorMessage, 'yt-dlp') !== false || strpos($errorMessage, 'WinError 10106') !== false) {
                    $errorMessage = 'yt-dlp模块加载失败，建议使用离线模式进行提取';
                } elseif (strpos($errorMessage, '无法获取视频流URL') !== false) {
                    $errorMessage = '无法获取视频流，建议使用离线模式或检查视频是否可访问';
                }
            }

            return response()->json([
                'success' => false,
                'message' => '提取失败: ' . $errorMessage,
                'job_id' => $job->id ?? null,
                'suggestion' => isset($job) && $job->extraction_mode === 'online' ? '建议尝试使用离线模式进行提取' : null
            ], 500);
        }
    }

    /**
     * 直接执行提取任务
     */
    private function executeExtraction(BilibiliExtractJob $job): array
    {
        $pythonPath = 'C:\\Python313\\python.exe';  // 使用双反斜杠
        
        // 根据提取模式选择不同的脚本
        if ($job->extraction_mode === 'online') {
            $scriptPath = dirname(base_path()) . '/python/online_bilibili_extractor.py';
        } else {
            $scriptPath = dirname(base_path()) . '/python/auto_bilibili_extractor.py';
        }
            
        $outputDir = storage_path('app/' . config('bilibili.output_directory', 'bilibili_extracts'));

        // 确保输出目录存在
        if (!is_dir($outputDir)) {
            mkdir($outputDir, 0755, true);
        }

        // 根据提取模式构建不同的命令参数
        $command = [
            $pythonPath,
            $scriptPath,
            $job->video_url,
            '--start', $job->start_time,
            '--end', $job->end_time,
            '--output-dir', $outputDir
        ];

        // 只有离线模式才添加下载超时参数
        if ($job->extraction_mode !== 'online') {
            $command[] = '--download-timeout';
            $command[] = '90';  // 90秒下载超时
        }

        if ($job->use_ai_subtitle) {
            $command[] = '--ai-subtitle';
        }

        Log::info('执行Python提取命令', [
            'job_id' => $job->id,
            'command' => implode(' ', $command),
            'python_path' => $pythonPath,
            'script_path' => $scriptPath,
            'script_exists' => file_exists($scriptPath),
            'python_exists' => file_exists($pythonPath)
        ]);

        // 更新进度
        $job->update(['progress' => 10]);

        // 执行Python脚本
        $timeout = config('bilibili.extraction_timeout', 1500);
        
        // 添加调试信息
        Log::info('Python环境调试', [
            'job_id' => $job->id,
            'python_path' => $pythonPath,
            'python_exists' => file_exists($pythonPath),
            'working_directory' => getcwd(),
            'environment_path' => getenv('PATH')
        ]);
        
        // 先测试Python是否可用
        $testProcess = Process::env([
            'PYTHONPATH' => 'C:\\Users\\wunai\\AppData\\Roaming\\Python\\Python313\\site-packages;C:\\Python313\\Lib\\site-packages',
            'PATH' => 'C:\\Python313;C:\\Python313\\Scripts;' . getenv('PATH')
        ])->run([$pythonPath, '-c', 'import requests; print("requests OK")']);
        Log::info('Python requests测试', [
            'job_id' => $job->id,
            'success' => $testProcess->successful(),
            'output' => $testProcess->output(),
            'error' => $testProcess->errorOutput()
        ]);
        
        if (!$testProcess->successful()) {
            throw new \Exception('Python环境测试失败: ' . $testProcess->errorOutput());
        }
        
        $process = Process::timeout($timeout)
            ->env([
                'PYTHONIOENCODING' => 'utf-8',
                'PYTHONPATH' => 'C:\\Users\\wunai\\AppData\\Roaming\\Python\\Python313\\site-packages;C:\\Python313\\Lib\\site-packages',
                'PATH' => 'C:\\Python313;C:\\Python313\\Scripts;' . getenv('PATH')
            ]) // 设置Python输出编码和路径
            ->run($command, function (string $type, string $buffer) use ($job) {
                // 解析进度输出
                if (preg_match('/Progress: (\d+)%/', $buffer, $matches)) {
                    $progress = (int) $matches[1];
                    $job->update(['progress' => min(90, max(10, $progress))]);
                }
                
                Log::debug('Python脚本输出', [
                    'job_id' => $job->id,
                    'type' => $type,
                    'output' => trim($buffer)
                ]);
            });

        if ($process->failed()) {
            throw new \Exception('Python脚本执行失败: ' . $process->errorOutput());
        }

        // 解析输出结果
        $output = $process->output();
        $result = $this->parseScriptOutput($output);

        // 更新进度到90%
        $job->update(['progress' => 90]);

        // 验证生成的文件
        $this->validateOutputFiles($result);

        // 更新进度到100%
        $job->update(['progress' => 100]);

        return $result;
    }

    /**
     * 解析Python脚本输出
     */
    private function parseScriptOutput(string $output): array
    {
        Log::debug('Python脚本原始输出', ['output' => $output]);
        
        // 确保输出是UTF-8编码
        $output = mb_convert_encoding($output, 'UTF-8', 'UTF-8');
        
        // 查找JSON结果行
        $lines = explode("\n", $output);
        $jsonLine = null;

        foreach ($lines as $line) {
            $line = trim($line);
            if (str_starts_with($line, '{') && str_ends_with($line, '}')) {
                $jsonLine = $line;
                break;
            }
        }

        if (!$jsonLine) {
            Log::error('未找到JSON输出', [
                'output' => $output,
                'lines' => $lines
            ]);
            throw new \Exception('无法从Python脚本输出中找到结果JSON');
        }

        Log::debug('找到JSON行', ['json_line' => $jsonLine]);

        $result = json_decode($jsonLine, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::error('JSON解析失败', [
                'json_line' => $jsonLine,
                'error' => json_last_error_msg(),
                'error_code' => json_last_error()
            ]);
            throw new \Exception('解析Python脚本结果JSON失败: ' . json_last_error_msg());
        }

        // 修复Windows路径中的双重转义问题
        if (isset($result['audio_path'])) {
            $result['audio_path'] = str_replace('\\\\', '\\', $result['audio_path']);
        }
        if (isset($result['subtitle_path'])) {
            $result['subtitle_path'] = str_replace('\\\\', '\\', $result['subtitle_path']);
        }

        Log::debug('修复路径后的结果', $result);

        return $result;
    }

    /**
     * 验证输出文件
     */
    private function validateOutputFiles(array &$result): void
    {
        if (isset($result['audio_path'])) {
            $fullPath = $result['audio_path'];
            
            Log::debug('开始验证音频文件', [
                'original_path' => $fullPath,
                'file_exists' => file_exists($fullPath)
            ]);
            
            // 检查文件是否实际存在
            if (!file_exists($fullPath)) {
                throw new \Exception('音频文件未找到: ' . $fullPath);
            }
            
            // 转换为相对路径（适配Windows路径）
            $storageAppPath = str_replace('\\', '/', storage_path('app/'));
            $normalizedPath = str_replace('\\', '/', $fullPath);
            $relativePath = str_replace($storageAppPath, '', $normalizedPath);
            
            // 确保相对路径以正确的格式开始
            $relativePath = ltrim($relativePath, '/');
            
            Log::debug('音频文件路径转换', [
                'full_path' => $fullPath,
                'storage_app_path' => $storageAppPath,
                'normalized_path' => $normalizedPath,
                'relative_path' => $relativePath,
                'storage_exists' => Storage::exists($relativePath)
            ]);
            
            $result['audio_path'] = $relativePath;
        }

        if (isset($result['subtitle_path'])) {
            $fullPath = $result['subtitle_path'];
            
            Log::debug('开始验证字幕文件', [
                'original_path' => $fullPath,
                'file_exists' => file_exists($fullPath)
            ]);
            
            // 检查文件是否实际存在
            if (!file_exists($fullPath)) {
                throw new \Exception('字幕文件未找到: ' . $fullPath);
            }
            
            // 转换为相对路径（适配Windows路径）
            $storageAppPath = str_replace('\\', '/', storage_path('app/'));
            $normalizedPath = str_replace('\\', '/', $fullPath);
            $relativePath = str_replace($storageAppPath, '', $normalizedPath);
            
            // 确保相对路径以正确的格式开始
            $relativePath = ltrim($relativePath, '/');
            
            Log::debug('字幕文件路径转换', [
                'full_path' => $fullPath,
                'storage_app_path' => $storageAppPath,
                'normalized_path' => $normalizedPath,
                'relative_path' => $relativePath,
                'storage_exists' => Storage::exists($relativePath)
            ]);
            
            $result['subtitle_path'] = $relativePath;
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