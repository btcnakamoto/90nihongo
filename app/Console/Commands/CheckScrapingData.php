<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CheckScrapingData extends Command
{
    protected $signature = 'check:scraping-data';
    protected $description = '检查抓取任务和资源数据';

    public function handle()
    {
        $this->info('🔍 检查抓取任务和资源数据');
        $this->info('');

        // 检查最近的任务
        $this->info('📋 最近的任务:');
        $tasks = DB::table('import_tasks')
            ->orderBy('updated_at', 'desc')
            ->limit(5)
            ->get();

        if ($tasks->count() > 0) {
            foreach ($tasks as $task) {
                $status = match($task->status) {
                    'completed' => '✅',
                    'running' => '🔄',
                    'failed' => '❌',
                    'pending' => '⏳',
                    default => '❓'
                };
                
                $this->line("   {$status} ID:{$task->id} [{$task->type}] {$task->name}");
                $this->line("      状态: {$task->status} | 进度: {$task->progress}%");
                $this->line("      处理: {$task->items_processed}/{$task->total_items}");
                $this->line("      时间: {$task->updated_at}");
                $this->line('');
            }
        } else {
            $this->warn('   没有找到任务记录');
        }

        // 检查资源
        $this->info('📚 抓取的资源:');
        $resourceCount = DB::table('resource_items')->count();
        $this->info("   总计: {$resourceCount} 个资源");

        if ($resourceCount > 0) {
            $resources = DB::table('resource_items')
                ->selectRaw('id, name, type, source, status, LENGTH(content) as content_length, created_at')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();

            foreach ($resources as $resource) {
                $status = match($resource->status) {
                    'completed' => '✅',
                    'processing' => '🔄',
                    'error' => '❌',
                    'pending' => '⏳',
                    default => '❓'
                };
                
                $this->line("   {$status} ID:{$resource->id} [{$resource->type}] {$resource->name}");
                $this->line("      来源: {$resource->source}");
                $this->line("      内容: {$resource->content_length} 字符");
                $this->line("      时间: {$resource->created_at}");
                $this->line('');
            }

            // 显示内容示例
            $latestResource = DB::table('resource_items')
                ->where('content', '!=', '')
                ->whereNotNull('content')
                ->orderBy('created_at', 'desc')
                ->first();

            if ($latestResource) {
                $this->info('📄 最新资源内容预览:');
                $this->line("   标题: {$latestResource->name}");
                $content = mb_substr($latestResource->content, 0, 200);
                $this->line("   内容: {$content}...");
                $this->line('');
            }
        } else {
            $this->error('   ❌ 没有找到任何资源！这解释了为什么100%完成但无内容显示');
        }

        // 检查队列状态
        $this->info('🔄 队列状态:');
        $queueJobs = DB::table('jobs')->count();
        $failedJobs = DB::table('failed_jobs')->count();
        $this->line("   待处理: {$queueJobs} 个任务");
        $this->line("   失败: {$failedJobs} 个任务");

        // 诊断结论
        $this->info('');
        $this->info('🎯 诊断结论:');
        if ($resourceCount == 0) {
            $this->error('   问题确认: 任务显示100%但数据库中无资源内容！');
            $this->warn('   可能原因:');
            $this->warn('   1. Python抓取脚本执行失败');
            $this->warn('   2. 网站结构变化，抓取逻辑过时');
            $this->warn('   3. 数据库保存过程出错');
            $this->warn('   4. 网络连接问题导致抓取失败');
        } else {
            $this->info('   数据库中有资源内容，问题可能在前端显示');
        }

        return 0;
    }
} 