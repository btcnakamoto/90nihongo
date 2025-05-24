<?php

namespace App\Jobs;

use App\Models\ImportTask;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessWebScrapingJob implements ShouldQueue
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
            $urls = $config['urls'] ?? [];
            $maxPages = $config['max_pages'] ?? 10;
            $contentType = $config['content_type'] ?? 'course';
            $delayMs = $config['delay_ms'] ?? 1000;
            
            $this->task->addLog('开始处理 ' . count($urls) . ' 个URL');
            
            $processedItems = 0;
            
            foreach ($urls as $url) {
                if ($processedItems >= $maxPages) {
                    break;
                }
                
                $this->task->addLog("正在处理: {$url}");
                
                // 模拟网页抓取过程
                // 在实际实现中，这里会调用您的content_importer.py或其他抓取工具
                sleep($delayMs / 1000); // 模拟延迟
                
                $processedItems++;
                $this->task->updateProgress($processedItems);
                
                $this->task->addLog("已完成: {$url}");
            }
            
            $this->task->markAsCompleted();
            $this->task->addLog("网页抓取任务完成，共处理 {$processedItems} 个页面");
            
        } catch (\Exception $e) {
            Log::error('网页抓取任务失败: ' . $e->getMessage());
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