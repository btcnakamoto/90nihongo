<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LearningProgress extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
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
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'completed_modules' => 'array',
        'last_study_date' => 'date',
    ];

    /**
     * 获取该学习进度所属的用户
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
} 