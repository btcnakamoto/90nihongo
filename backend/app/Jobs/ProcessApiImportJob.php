<?php

namespace App\Jobs;

use App\Models\ImportTask;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class ProcessApiImportJob implements ShouldQueue
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
            $endpoint = $config['endpoint'];
            $apiKey = $config['api_key'];
            $format = $config['format'] ?? 'json';
            $batchSize = $config['batch_size'] ?? 100;
            
            $this->task->addLog("开始从API导入数据: {$endpoint}");
            
            $processedItems = 0;
            $totalBatches = ceil($batchSize / 10); // 假设每批处理10个项目
            
            for ($batch = 0; $batch < $totalBatches; $batch++) {
                $this->task->addLog("处理批次 " . ($batch + 1) . "/{$totalBatches}");
                
                // 模拟API调用
                try {
                    $response = Http::timeout(30)
                        ->withHeaders(['Authorization' => 'Bearer ' . $apiKey])
                        ->get($endpoint, [
                            'offset' => $batch * 10,
                            'limit' => 10,
                            'format' => $format
                        ]);
                    
                    if ($response->successful()) {
                        // 模拟数据处理
                        sleep(1); // 模拟处理时间
                        
                        $batchItems = min(10, $batchSize - $processedItems);
                        $processedItems += $batchItems;
                        
                        $this->task->updateProgress($processedItems);
                        $this->task->addLog("批次处理完成，已导入 {$batchItems} 条记录");
                    } else {
                        throw new \Exception("API请求失败: " . $response->status());
                    }
                } catch (\Exception $e) {
                    $this->task->addLog("批次处理失败: " . $e->getMessage());
                    throw $e;
                }
                
                if ($processedItems >= $batchSize) {
                    break;
                }
            }
            
            $this->task->markAsCompleted();
            $this->task->addLog("API导入任务完成，共导入 {$processedItems} 条记录");
            
        } catch (\Exception $e) {
            Log::error('API导入任务失败: ' . $e->getMessage());
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