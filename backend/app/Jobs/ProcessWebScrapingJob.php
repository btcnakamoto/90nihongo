<?php

namespace App\Jobs;

use App\Models\ImportTask;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;

class ProcessWebScrapingJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected ImportTask $task;

    public function __construct(ImportTask $task)
    {
        $this->task = $task;
    }

    public function handle(): void
    {
        try {
            $this->task->update(['status' => 'running']);
            
            $config = $this->task->config;
            
            // 创建临时配置文件供Python脚本使用
            $tempDir = storage_path('app/temp');
            if (!is_dir($tempDir)) {
                mkdir($tempDir, 0755, true);
            }
            
            $configFile = $tempDir . '/scraping_config_' . $this->task->id . '.json';
            file_put_contents($configFile, json_encode([
                'task_id' => $this->task->id,
                'urls' => explode("\n", $config['urls']),
                'max_pages' => $config['max_pages'] ?? 10,
                'content_type' => $config['content_type'] ?? 'course',
                'delay_ms' => $config['delay_ms'] ?? 1000,
                'include_images' => $config['include_images'] ?? false,
                'include_audio' => $config['include_audio'] ?? false,
                'database_config' => [
                    'host' => env('DB_HOST'),
                    'database' => env('DB_DATABASE'),
                    'username' => env('DB_USERNAME'),
                    'password' => env('DB_PASSWORD'),
                ]
            ]));
            
            // 调用Python抓取脚本
            $pythonScript = base_path('python/web_scraper.py');
            $command = "python \"{$pythonScript}\" \"{$configFile}\"";
            
            Log::info("执行抓取命令: {$command}");
            
            $result = Process::run($command);
            
            if ($result->successful()) {
                $this->task->update([
                    'status' => 'completed',
                    'progress' => 100,
                    'logs' => array_merge($this->task->logs ?? [], ['Python脚本执行成功'])
                ]);
            } else {
                throw new \Exception('Python脚本执行失败: ' . $result->errorOutput());
            }
            
            // 清理临时文件
            if (file_exists($configFile)) {
                unlink($configFile);
            }
            
        } catch (\Exception $e) {
            Log::error('网页抓取任务失败: ' . $e->getMessage());
            $this->task->update([
                'status' => 'failed',
                'logs' => array_merge($this->task->logs ?? [], ['抓取失败: ' . $e->getMessage()])
            ]);
        }
    }

    public function failed(\Throwable $exception): void
    {
        $this->task->update([
            'status' => 'failed',
            'logs' => array_merge($this->task->logs ?? [], ['任务失败: ' . $exception->getMessage()])
        ]);
    }
} 