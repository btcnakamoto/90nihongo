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
        'metadata',
        'content_length',
        'content_style',
        'source_id',
        'source_type'
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

    /**
     * 关联的分类
     */
    public function categories()
    {
        return $this->belongsToMany(
            Category::class,
            'learning_material_categories',
            'learning_material_id',
            'category_id'
        )->withTimestamps();
    }

    /**
     * 关联的标签
     */
    public function tags()
    {
        return $this->belongsToMany(
            Tag::class,
            'learning_material_tags',
            'learning_material_id',
            'tag_id'
        )->withTimestamps();
    }

    /**
     * 关联的对话（一对一）
     */
    public function dialogue()
    {
        return $this->hasOne(Dialogue::class);
    }

    /**
     * 检查是否是对话类型
     */
    public function isDialogue()
    {
        return $this->dialogue()->exists();
    }

    /**
     * 获取主要分类（一级分类）
     */
    public function getMainCategory()
    {
        return $this->categories()
                   ->where('level', 1)
                   ->first();
    }

    /**
     * 获取子分类（二级分类）
     */
    public function getSubCategories()
    {
        return $this->categories()
                   ->where('level', 2)
                   ->get();
    }

    /**
     * 作用域：按内容类型筛选
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * 作用域：按内容长度筛选
     */
    public function scopeByLength($query, $length)
    {
        return $query->where('content_length', $length);
    }

    /**
     * 作用域：按来源筛选
     */
    public function scopeBySource($query, $sourceType)
    {
        return $query->where('source_type', $sourceType);
    }

    /**
     * 作用域：按分类筛选
     */
    public function scopeByCategory($query, $categoryId)
    {
        return $query->whereHas('categories', function ($q) use ($categoryId) {
            $q->where('categories.id', $categoryId);
        });
    }

    /**
     * 作用域：按标签筛选
     */
    public function scopeByTag($query, $tagId)
    {
        return $query->whereHas('tags', function ($q) use ($tagId) {
            $q->where('tags.id', $tagId);
        });
    }

    /**
     * 同步分类
     */
    public function syncCategories(array $categoryIds)
    {
        $this->categories()->sync($categoryIds);
        
        // 更新分类使用统计
        foreach ($categoryIds as $categoryId) {
            $category = Category::find($categoryId);
            if ($category) {
                $category->increment('usage_count');
            }
        }
    }

    /**
     * 同步标签
     */
    public function syncTags(array $tagIds)
    {
        $this->tags()->sync($tagIds);
        
        // 更新标签使用统计
        foreach ($tagIds as $tagId) {
            $tag = Tag::find($tagId);
            if ($tag) {
                $tag->incrementUsage();
            }
        }
    }
} 