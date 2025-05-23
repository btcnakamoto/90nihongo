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
        'paid_at'
    ];

    protected $casts = [
        'commission_amount' => 'decimal:2',
        'commission_rate' => 'decimal:4',
        'paid_at' => 'datetime'
    ];

    public function referrer()
    {
        return $this->belongsTo(User::class, 'referrer_id');
    }

    public function referred()
    {
        return $this->belongsTo(User::class, 'referred_id');
    }

    // 推荐奖励配置
    const COMMISSION_RATES = [
        'monthly' => 0.30,    // 月费30%分佣
        'quarterly' => 0.25,  // 季费25%分佣  
        'yearly' => 0.20,     // 年费20%分佣
        'lifetime' => 0.15,   // 终身15%分佣
    ];
} 