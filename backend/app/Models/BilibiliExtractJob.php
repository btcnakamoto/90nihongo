<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BilibiliExtractJob extends Model
{
    use HasUuids;

    protected $table = 'bilibili_extract_jobs';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'admin_id',
        'video_url',
        'video_title',
        'start_time',
        'end_time',
        'description',
        'use_ai_subtitle',
        'extraction_mode',
        'status',
        'progress',
        'audio_path',
        'subtitle_path',
        'subtitle_text',
        'error_message',
        'completed_at'
    ];

    protected $casts = [
        'use_ai_subtitle' => 'boolean',
        'progress' => 'integer',
        'completed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $attributes = [
        'status' => 'pending',
        'progress' => 0,
        'use_ai_subtitle' => true
    ];

        /**     * 关联管理员     */    public function admin(): BelongsTo    {        return $this->belongsTo(Admin::class, 'admin_id');    }

    /**
     * 获取状态标签
     */
    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'pending' => '等待中',
            'processing' => '处理中',
            'completed' => '已完成',
            'failed' => '失败',
            default => '未知状态'
        };
    }

    /**
     * 检查是否可以重试
     */
    public function canRetry(): bool
    {
        return $this->status === 'failed';
    }

    /**
     * 检查是否已完成
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * 检查是否正在处理
     */
    public function isProcessing(): bool
    {
        return $this->status === 'processing';
    }

    /**
     * 更新进度
     */
    public function updateProgress(int $progress): void
    {
        $this->update([
            'progress' => max(0, min(100, $progress)),
            'status' => 'processing'
        ]);
    }

    /**
     * 标记为完成
     */
    public function markAsCompleted(array $data = []): void
    {
        $this->update(array_merge([
            'status' => 'completed',
            'progress' => 100,
            'completed_at' => now()
        ], $data));
    }

    /**
     * 标记为失败
     */
    public function markAsFailed(string $errorMessage): void
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $errorMessage,
            'completed_at' => now()
        ]);
    }

    /**
     * 重置任务状态
     */
    public function reset(): void
    {
        $this->update([
            'status' => 'pending',
            'progress' => 0,
            'error_message' => null,
            'audio_path' => null,
            'subtitle_path' => null,
            'subtitle_text' => null,
            'completed_at' => null
        ]);
    }
} 