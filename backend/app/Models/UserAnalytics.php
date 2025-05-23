<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserAnalytics extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'event_type',
        'event_data',
        'session_id',
        'ip_address',
        'user_agent',
        'created_at'
    ];

    protected $casts = [
        'event_data' => 'array'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // 事件类型常量
    const EVENTS = [
        'LOGIN' => 'login',
        'LOGOUT' => 'logout', 
        'LESSON_START' => 'lesson_start',
        'LESSON_COMPLETE' => 'lesson_complete',
        'QUIZ_ATTEMPT' => 'quiz_attempt',
        'SUBSCRIPTION_UPGRADE' => 'subscription_upgrade',
        'PAYMENT_SUCCESS' => 'payment_success',
        'REFERRAL_CLICK' => 'referral_click',
        'FEATURE_USE' => 'feature_use'
    ];

    // 获取用户转化漏斗数据
    public static function getConversionFunnel()
    {
        return [
            'registrations' => User::count(),
            'activated_users' => User::whereNotNull('email_verified_at')->count(),
            'lesson_started' => self::where('event_type', 'lesson_start')->distinct('user_id')->count(),
            'paid_users' => User::where('subscription_type', '!=', 'free')->count(),
        ];
    }
} 