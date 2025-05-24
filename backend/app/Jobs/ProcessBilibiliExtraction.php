<?php

namespace App\Jobs;

use App\Models\BilibiliExtractJob;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;

class ProcessBilibiliExtraction implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 1800; // 30分钟超时
    public $tries = 3; // 最多重试3次

    protected BilibiliExtractJob $job;

    /**
     * Create a new job instance.
     */
    public function __construct(BilibiliExtractJob $job)
    {
        $this->job = $job;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('开始处理B站视频提取任务', [
            'job_id' => $this->job->id,
            'video_url' => $this->job->video_url
        ]);

        try {
            // 更新任务状态为处理中
            $this->job->update(['status' => 'processing', 'progress' => 0]);

            // 调用Python脚本进行提取
            $result = $this->extractVideo();

            // 更新任务为完成状态
            $this->job->markAsCompleted([
                'video_title' => $result['video_info']['title'] ?? null,
                'audio_path' => $result['audio_path'] ?? null,
                'subtitle_path' => $result['subtitle_path'] ?? null,
                'subtitle_text' => $result['subtitle_text'] ?? null
            ]);

            Log::info('B站视频提取任务完成', [
                'job_id' => $this->job->id,
                'audio_path' => $result['audio_path'] ?? null
            ]);

        } catch (\Exception $e) {
            Log::error('B站视频提取任务失败', [
                'job_id' => $this->job->id,
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            $this->job->markAsFailed($e->getMessage());
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('B站视频提取任务最终失败', [
            'job_id' => $this->job->id,
            'exception' => $exception->getMessage()
        ]);

        $this->job->markAsFailed($exception->getMessage());
    }

    /**
     * 执行视频提取
     */
    protected function extractVideo(): array
    {
        $pythonPath = config('app.python_path', 'python');
        $scriptPath = base_path('python/bilibili_audio_extractor.py');
        $outputDir = storage_path('app/bilibili_extracts');

        // 确保输出目录存在
        if (!is_dir($outputDir)) {
            mkdir($outputDir, 0755, true);
        }

        // 构建命令
        $command = [
            $pythonPath,
            $scriptPath,
            $this->job->video_url,
            '--start', $this->job->start_time,
            '--end', $this->job->end_time,
            '--output-dir', $outputDir
        ];

        if ($this->job->use_ai_subtitle) {
            $command[] = '--ai-subtitle';
        }

        Log::info('执行Python提取命令', [
            'job_id' => $this->job->id,
            'command' => implode(' ', $command)
        ]);

        // 更新进度
        $this->job->updateProgress(10);

        // 执行Python脚本
        $process = Process::timeout(1500) // 25分钟超时
            ->run($command, function (string $type, string $buffer) {
                // 解析进度输出
                if (preg_match('/Progress: (\d+)%/', $buffer, $matches)) {
                    $progress = (int) $matches[1];
                    $this->job->updateProgress(min(90, max(10, $progress)));
                }
                
                Log::debug('Python脚本输出', [
                    'job_id' => $this->job->id,
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
        $this->job->updateProgress(90);

        // 验证生成的文件
        $this->validateOutputFiles($result);

        // 更新进度到100%
        $this->job->updateProgress(100);

        return $result;
    }

    /**
     * 解析Python脚本输出
     */
    protected function parseScriptOutput(string $output): array
    {
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
            throw new \Exception('无法从Python脚本输出中找到结果JSON');
        }

        $result = json_decode($jsonLine, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('解析Python脚本结果JSON失败: ' . json_last_error_msg());
        }

        return $result;
    }

    /**
     * 验证输出文件
     */
    protected function validateOutputFiles(array $result): void
    {
        if (isset($result['audio_path'])) {
            $relativePath = str_replace(storage_path('app/'), '', $result['audio_path']);
            if (!Storage::exists($relativePath)) {
                throw new \Exception('音频文件未找到: ' . $relativePath);
            }
            $result['audio_path'] = $relativePath;
        }

        if (isset($result['subtitle_path'])) {
            $relativePath = str_replace(storage_path('app/'), '', $result['subtitle_path']);
            if (!Storage::exists($relativePath)) {
                throw new \Exception('字幕文件未找到: ' . $relativePath);
            }
            $result['subtitle_path'] = $relativePath;
        }
    }

    /**
     * 获取队列连接名称
     */
    public function viaConnection(): string
    {
        return 'database';
    }

    /**
     * 获取队列名称
     */
    public function viaQueue(): string
    {
        return 'bilibili-extraction';
    }
} 