<?php

namespace App\Jobs;

use App\Models\ImportTask;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessFileUploadJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected ImportTask $task;

    /**
     * Create a new job instance.
     */
    public function __construct(ImportTask $task)
    {
        $this->task = $task;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $this->task->markAsStarted();
            
            $config = $this->task->config;
            $files = $config['files'] ?? [];
            
            $this->task->addLog('开始处理 ' . count($files) . ' 个文件');
            
            $processedItems = 0;
            
            foreach ($files as $file) {
                $this->task->addLog("正在处理文件: {$file['original_name']}");
                
                // 模拟文件处理过程
                // 在实际实现中，这里会根据文件类型进行相应的处理
                // 例如：解析CSV、处理音频文件、提取文本等
                sleep(2); // 模拟处理时间
                
                $processedItems++;
                $this->task->updateProgress($processedItems);
                
                $this->task->addLog("文件处理完成: {$file['original_name']}");
            }
            
            $this->task->markAsCompleted();
            $this->task->addLog("文件上传任务完成，共处理 {$processedItems} 个文件");
            
        } catch (\Exception $e) {
            Log::error('文件上传任务失败: ' . $e->getMessage());
            $this->task->markAsFailed($e->getMessage());
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        $this->task->markAsFailed($exception->getMessage());
    }
} 