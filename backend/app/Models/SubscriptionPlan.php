<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubscriptionPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'price',
        'original_price',
        'duration_days',
        'features',
        'is_popular',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'original_price' => 'decimal:2',
        'features' => 'array',
        'is_popular' => 'boolean',
        'is_active' => 'boolean',
        'duration_days' => 'integer',
        'sort_order' => 'integer',
    ];

    /**
     * 获取活跃的订阅计划
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * 获取推荐的订阅计划
     */
    public function scopePopular($query)
    {
        return $query->where('is_popular', true);
    }

    /**
     * 按排序顺序获取
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('price');
    }

    /**
     * 检查是否为终身计划
     */
    public function isLifetime(): bool
    {
        return $this->duration_days === null || $this->code === 'lifetime';
    }

    /**
     * 获取折扣百分比
     */
    public function getDiscountPercentageAttribute(): ?float
    {
        if (!$this->original_price || $this->original_price <= $this->price) {
            return null;
        }

        return round((($this->original_price - $this->price) / $this->original_price) * 100, 1);
    }

    /**
     * 获取每日价格
     */
    public function getDailyPriceAttribute(): ?float
    {
        if ($this->isLifetime()) {
            return null;
        }

        return round($this->price / $this->duration_days, 2);
    }
} 