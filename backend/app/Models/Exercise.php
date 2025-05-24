<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Exercise extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'title',
        'type',
        'question',
        'options',
        'correct_answer',
        'explanation',
        'points'
    ];

    protected $casts = [
        'options' => 'array'
    ];

    /**
     * 获取所属课程
     */
    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * 获取用户练习记录
     */
    public function userExercises()
    {
        return $this->hasMany(UserExercise::class);
    }
} 