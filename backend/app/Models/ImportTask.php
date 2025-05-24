<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ImportTask extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'name',
        'status',
        'progress',
        'total_items',
        'items_processed',
        'config',
        'logs',
        'started_at',
        'completed_at',
        'error_message'
    ];

    protected $casts = [
        'config' => 'array',
        'logs' => 'array',
        'progress' => 'float',
        'started_at' => 'datetime',
        'completed_at' => 'datetime'
    ];

    /**
     * 与资源的关联关系
     */
    public function resources(): HasMany
    {
        return $this->hasMany(ResourceItem::class, 'task_id');
    }

    /**
     * 添加日志
     */
    public function addLog(string $message): void
    {
        $logs = $this->logs ?? [];
        $logs[] = now()->format('H:i:s') . ' - ' . $message;
        $this->update(['logs' => $logs]);
    }

    /**
     * 更新进度
     */
    public function updateProgress(int $itemsProcessed = null): void
    {
        if ($itemsProcessed !== null) {
            $this->items_processed = $itemsProcessed;
        }

        $this->progress = $this->total_items > 0 
            ? ($this->items_processed / $this->total_items) * 100 
            : 0;

        $this->save();
    }

    /**
     * 标记任务开始
     */
    public function markAsStarted(): void
    {
        $this->update([
            'status' => 'running',
            'started_at' => now()
        ]);
        $this->addLog('任务开始执行');
    }

    /**
     * 标记任务完成
     */
    public function markAsCompleted(): void
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
            'progress' => 100
        ]);
        $this->addLog('任务执行完成');
    }

    /**
     * 标记任务失败
     */
    public function markAsFailed(string $errorMessage = null): void
    {
        $this->update([
            'status' => 'failed',
            'completed_at' => now(),
            'error_message' => $errorMessage
        ]);
        $this->addLog('任务执行失败: ' . ($errorMessage ?? '未知错误'));
    }
} 