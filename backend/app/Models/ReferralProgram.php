<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReferralProgram extends Model
{
    use HasFactory;

    protected $fillable = [
        'referrer_id',
        'referred_id',
        'commission_rate',
        'commission_amount',
        'status',
        'paid_at',
    ];

    protected $casts = [
        'commission_rate' => 'decimal:4',
        'commission_amount' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    /**
     * 状态常量
     */
    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_PAID = 'paid';
    const STATUS_CANCELLED = 'cancelled';

    /**
     * 获取推荐人
     */
    public function referrer()
    {
        return $this->belongsTo(User::class, 'referrer_id');
    }

    /**
     * 获取被推荐人
     */
    public function referred()
    {
        return $this->belongsTo(User::class, 'referred_id');
    }

    /**
     * 查询待处理的推荐
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * 查询已批准的推荐
     */
    public function scopeApproved($query)
    {
        return $query->where('status', self::STATUS_APPROVED);
    }

    /**
     * 查询已支付的推荐
     */
    public function scopePaid($query)
    {
        return $query->where('status', self::STATUS_PAID);
    }

    /**
     * 查询已取消的推荐
     */
    public function scopeCancelled($query)
    {
        return $query->where('status', self::STATUS_CANCELLED);
    }

    /**
     * 查询未支付的已批准推荐
     */
    public function scopeUnpaid($query)
    {
        return $query->where('status', self::STATUS_APPROVED)
                    ->whereNull('paid_at');
    }

    /**
     * 批准推荐
     */
    public function approve()
    {
        $this->update([
            'status' => self::STATUS_APPROVED,
        ]);
    }

    /**
     * 标记为已支付
     */
    public function markAsPaid()
    {
        $this->update([
            'status' => self::STATUS_PAID,
            'paid_at' => now(),
        ]);
    }

    /**
     * 取消推荐
     */
    public function cancel()
    {
        $this->update([
            'status' => self::STATUS_CANCELLED,
        ]);
    }

    /**
     * 检查是否已支付
     */
    public function isPaid(): bool
    {
        return $this->status === self::STATUS_PAID && $this->paid_at !== null;
    }

    /**
     * 检查是否已批准
     */
    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    /**
     * 检查是否待处理
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    // 推荐奖励配置
    const COMMISSION_RATES = [
        'monthly' => 0.30,    // 月费30%分佣
        'quarterly' => 0.25,  // 季费25%分佣  
        'yearly' => 0.20,     // 年费20%分佣
        'lifetime' => 0.15,   // 终身15%分佣
    ];
} 