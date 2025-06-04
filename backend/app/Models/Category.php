<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'parent_id',
        'level',
        'sort_order',
        'is_active',
        'status',
        'description'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'level' => 'integer',
        'sort_order' => 'integer'
    ];

    /**
     * 父分类关系
     */
    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    /**
     * 子分类关系
     */
    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id')
                    ->orderBy('sort_order');
    }

    /**
     * 关联的学习材料
     */
    public function learningMaterials()
    {
        return $this->belongsToMany(
            LearningMaterial::class,
            'learning_material_categories',
            'category_id',
            'learning_material_id'
        )->withTimestamps();
    }

    /**
     * 获取所有子孙分类ID
     */
    public function getDescendantIds()
    {
        $ids = [$this->id];
        $children = $this->children;
        
        foreach ($children as $child) {
            $ids = array_merge($ids, $child->getDescendantIds());
        }
        
        return $ids;
    }

    /**
     * 生成面包屑路径
     */
    public function getBreadcrumb()
    {
        $breadcrumb = [];
        $current = $this;
        
        while ($current) {
            array_unshift($breadcrumb, $current);
            $current = $current->parent;
        }
        
        return $breadcrumb;
    }

    /**
     * 作用域：仅获取启用的分类
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * 作用域：按级别筛选
     */
    public function scopeByLevel($query, $level)
    {
        return $query->where('level', $level);
    }

    /**
     * 作用域：顶级分类
     */
    public function scopeTopLevel($query)
    {
        return $query->whereNull('parent_id');
    }
} 