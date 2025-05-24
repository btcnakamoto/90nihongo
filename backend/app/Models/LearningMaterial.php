<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LearningMaterial extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'title',
        'type',
        'content',
        'media_url',
        'duration_minutes',
        'metadata'
    ];

    protected $casts = [
        'metadata' => 'array'
    ];

    /**
     * 获取所属课程
     */
    public function course()
    {
        return $this->belongsTo(Course::class);
    }
} 