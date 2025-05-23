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
    ];

    /**
     * 获取激活的计划，按排序顺序
     */
    public static function getActivePlans()
    {
        return self::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('price')
            ->get();
    }

    /**
     * 计算折扣百分比
     */
    public function getDiscountPercentageAttribute()
    {
        if (!$this->original_price || $this->original_price <= $this->price) {
            return 0;
        }
        
        return round((($this->original_price - $this->price) / $this->original_price) * 100);
    }

    /**
     * 获取每日价格
     */
    public function getDailyPriceAttribute()
    {
        if (!$this->duration_days) {
            return null; // 终身计划
        }
        
        return round($this->price / $this->duration_days, 2);
    }

    /**
     * 检查是否为终身计划
     */
    public function isLifetime()
    {
        return $this->duration_days === null;
    }
} 