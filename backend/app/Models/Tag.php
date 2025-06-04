<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'usage_count',
        'is_active',
        'status',
        'description'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'usage_count' => 'integer'
    ];

    /**
     * 关联的学习材料
     */
    public function learningMaterials()
    {
        return $this->belongsToMany(
            LearningMaterial::class,
            'learning_material_tags',
            'tag_id',
            'learning_material_id'
        )->withTimestamps();
    }

    /**
     * 增加使用次数
     */
    public function incrementUsage()
    {
        $this->increment('usage_count');
        return $this;
    }

    /**
     * 减少使用次数
     */
    public function decrementUsage()
    {
        $this->decrement('usage_count');
        return $this;
    }

    /**
     * 自动生成slug
     */
    public function setNameAttribute($value)
    {
        $this->attributes['name'] = $value;
        
        if (empty($this->attributes['slug'])) {
            $this->attributes['slug'] = $this->generateSlug($value);
        }
    }

    /**
     * 生成唯一的slug
     */
    private function generateSlug($name)
    {
        $slug = str_replace([' ', '　'], '-', trim($name));
        $slug = preg_replace('/[^\p{L}\p{N}\-]/u', '', $slug);
        $slug = strtolower($slug);
        
        $originalSlug = $slug;
        $count = 1;
        
        while (static::where('slug', $slug)->where('id', '!=', $this->id ?? 0)->exists()) {
            $slug = $originalSlug . '-' . $count;
            $count++;
        }
        
        return $slug;
    }

    /**
     * 作用域：仅获取启用的标签
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * 作用域：按使用次数排序
     */
    public function scopePopular($query)
    {
        return $query->orderBy('usage_count', 'desc');
    }

    /**
     * 作用域：搜索标签
     */
    public function scopeSearch($query, $term)
    {
        return $query->where('name', 'like', '%' . $term . '%');
    }

    /**
     * 获取热门标签
     */
    public static function getPopularTags($limit = 10)
    {
        return static::active()
                    ->popular()
                    ->limit($limit)
                    ->get();
    }

    /**
     * 批量创建或获取标签
     */
    public static function createOrGetTags(array $tagNames)
    {
        $tags = [];
        
        foreach ($tagNames as $name) {
            $name = trim($name);
            if (empty($name)) continue;
            
            $tag = static::firstOrCreate(
                ['name' => $name],
                [
                    'slug' => '',
                    'is_active' => true,
                    'usage_count' => 0
                ]
            );
            
            $tags[] = $tag;
        }
        
        return collect($tags);
    }
} 