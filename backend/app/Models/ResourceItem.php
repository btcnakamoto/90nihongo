<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResourceItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'task_id',
        'name',
        'type',
        'source',
        'status',
        'progress',
        'file_path',
        'file_size',
        'content',
        'metadata',
        'count',
        'error_message'
    ];

    protected $casts = [
        'metadata' => 'array',
        'progress' => 'float',
        'file_size' => 'integer',
        'count' => 'integer'
    ];

    /**
     * 与导入任务的关联关系
     */
    public function task(): BelongsTo
    {
        return $this->belongsTo(ImportTask::class);
    }

    /**
     * 获取文件大小的可读格式
     */
    public function getReadableFileSizeAttribute(): string
    {
        if (!$this->file_size) {
            return 'N/A';
        }

        $units = ['B', 'KB', 'MB', 'GB'];
        $size = $this->file_size;
        $unitIndex = 0;

        while ($size >= 1024 && $unitIndex < count($units) - 1) {
            $size /= 1024;
            $unitIndex++;
        }

        return round($size, 2) . ' ' . $units[$unitIndex];
    }

    /**
     * 获取状态显示文本
     */
    public function getStatusTextAttribute(): string
    {
        $statusMap = [
            'pending' => '等待处理',
            'downloading' => '下载中',
            'processing' => '处理中',
            'completed' => '已完成',
            'error' => '出错'
        ];

        return $statusMap[$this->status] ?? $this->status;
    }

    /**
     * 获取类型显示文本
     */
    public function getTypeTextAttribute(): string
    {
        $typeMap = [
            'course' => '课程',
            'material' => '学习材料',
            'vocabulary' => '词汇',
            'audio' => '音频',
            'video' => '视频'
        ];

        return $typeMap[$this->type] ?? $this->type;
    }

    /**
     * 标记为完成
     */
    public function markAsCompleted(): void
    {
        $this->update([
            'status' => 'completed',
            'progress' => 100
        ]);
    }

    /**
     * 标记为错误
     */
    public function markAsError(string $errorMessage): void
    {
        $this->update([
            'status' => 'error',
            'error_message' => $errorMessage
        ]);
    }

    /**
     * 更新进度
     */
    public function updateProgress(float $progress): void
    {
        $this->update(['progress' => min(100, max(0, $progress))]);
    }
} 