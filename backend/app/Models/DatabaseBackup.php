<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class DatabaseBackup extends Model
{
    use HasFactory;

    protected $table = 'database_backups';

    protected $fillable = [
        'filename',
        'filepath',
        'description',
        'file_size',
        'file_size_human',
        'tables_count',
        'database_name',
        'database_driver',
        'status',
        'backup_started_at',
        'backup_completed_at',
    ];

    protected $casts = [
        'backup_started_at' => 'datetime',
        'backup_completed_at' => 'datetime',
        'file_size' => 'integer',
        'tables_count' => 'integer',
    ];

    /**
     * 获取备份创建时间的可读格式
     */
    public function getCreatedAtHumanAttribute(): string
    {
        return $this->created_at->diffForHumans();
    }

    /**
     * 获取备份完成时间的可读格式
     */
    public function getBackupCompletedAtHumanAttribute(): string
    {
        return $this->backup_completed_at ? $this->backup_completed_at->diffForHumans() : '';
    }

    /**
     * 获取备份耗时
     */
    public function getBackupDurationAttribute(): string
    {
        if (!$this->backup_started_at || !$this->backup_completed_at) {
            return '';
        }
        
        $duration = $this->backup_completed_at->diffInSeconds($this->backup_started_at);
        
        if ($duration < 60) {
            return $duration . '秒';
        } elseif ($duration < 3600) {
            return intval($duration / 60) . '分' . ($duration % 60) . '秒';
        } else {
            $hours = intval($duration / 3600);
            $minutes = intval(($duration % 3600) / 60);
            return $hours . '小时' . $minutes . '分钟';
        }
    }

    /**
     * 查询已完成的备份
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * 查询失败的备份
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * 按创建时间倒序排列
     */
    public function scopeLatest($query)
    {
        return $query->orderBy('created_at', 'desc');
    }
}
