<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LearningProgress extends Model
{
    use HasFactory;

    /**
     * 数据表名
     */
    protected $table = 'learning_progress';

    /**
     * 可批量赋值的属性
     */
    protected $fillable = [
        'user_id',
        'current_day',
        'completed_modules',
        'total_study_minutes',
        'listening_score',
        'speaking_score',
        'vocabulary_score',
        'grammar_score',
        'last_study_date',
        'consecutive_days',
    ];

    /**
     * 属性类型转换
     */
    protected $casts = [
        'completed_modules' => 'array',
        'last_study_date' => 'date',
    ];

    /**
     * 获取关联的用户
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
} 