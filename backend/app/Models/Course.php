<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'day_number',
        'difficulty',
        'tags',
        'is_active'
    ];

    protected $casts = [
        'tags' => 'array',
        'is_active' => 'boolean'
    ];

    /**
     * 获取课程的学习材料
     */
    public function learningMaterials()
    {
        return $this->hasMany(LearningMaterial::class);
    }

    /**
     * 获取课程的练习题
     */
    public function exercises()
    {
        return $this->hasMany(Exercise::class);
    }
} 