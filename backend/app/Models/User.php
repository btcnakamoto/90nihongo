<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'japanese_level',
        'avatar',
        'learning_goals',
        'daily_study_minutes',
        'study_start_date',
        'is_active',
        'last_login_at',
        'subscription_type',
        'subscription_expires_at',
        'total_spent',
        'referral_code',
        'referred_by',
        'premium_features_used',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'learning_goals' => 'array',
        'study_start_date' => 'date',
        'is_active' => 'boolean',
        'last_login_at' => 'datetime',
        'subscription_expires_at' => 'datetime',
        'total_spent' => 'decimal:2',
        'premium_features_used' => 'array',
    ];

    /**
     * 订阅类型常量
     */
    const SUBSCRIPTION_TYPES = [
        'free' => '免费用户',
        'monthly' => '月会员',
        'quarterly' => '季度会员',
        'yearly' => '年会员',
        'lifetime' => '终身会员'
    ];

    /**
     * 检查用户是否为付费用户
     */
    public function isPremium(): bool
    {
        if ($this->subscription_type === 'lifetime') {
            return true;
        }
        
        if ($this->subscription_type === 'free') {
            return false;
        }
        
        return $this->subscription_expires_at && $this->subscription_expires_at->isFuture();
    }

    /**
     * 检查用户是否可以使用特定功能
     */
    public function canUseFeature(string $feature): bool
    {
        if (!$this->isPremium()) {
            return false;
        }
        
        // 记录功能使用情况
        $this->recordFeatureUsage($feature);
        
        return true;
    }

    /**
     * 记录功能使用情况
     */
    public function recordFeatureUsage(string $feature): void
    {
        $features = $this->premium_features_used ?? [];
        $today = now()->toDateString();
        
        if (!isset($features[$today])) {
            $features[$today] = [];
        }
        
        if (!isset($features[$today][$feature])) {
            $features[$today][$feature] = 0;
        }
        
        $features[$today][$feature]++;
        
        $this->update(['premium_features_used' => $features]);
    }

    /**
     * 获取推荐码
     */
    public function getReferralCode(): string
    {
        if (!$this->referral_code) {
            $this->referral_code = $this->generateUniqueReferralCode();
            $this->save();
        }
        
        return (string) $this->referral_code;
    }

    /**
     * 生成唯一推荐码
     */
    private function generateUniqueReferralCode(): int
    {
        do {
            $code = random_int(100000, 999999);
        } while (self::where('referral_code', $code)->exists());
        
        return $code;
    }

    /**
     * 获取用户的学习进度
     */
    public function learningProgress()
    {
        return $this->hasOne(LearningProgress::class);
    }

    /**
     * 获取用户的成就
     */
    public function achievements()
    {
        return $this->belongsToMany(Achievement::class, 'user_achievements')
            ->withTimestamps()
            ->withPivot('unlocked_at');
    }

    /**
     * 获取用户的词汇学习记录
     */
    public function vocabularies()
    {
        return $this->belongsToMany(Vocabulary::class, 'user_vocabulary')
            ->withTimestamps()
            ->withPivot(['status', 'review_count', 'next_review_at']);
    }

    /**
     * 获取用户的练习记录
     */
    public function exercises()
    {
        return $this->belongsToMany(Exercise::class, 'user_exercises')
            ->withTimestamps()
            ->withPivot(['user_answer', 'is_correct', 'points_earned', 'completed_at']);
    }

    /**
     * 获取用户创建的学习小组
     */
    public function createdGroups()
    {
        return $this->hasMany(StudyGroup::class, 'creator_id');
    }

    /**
     * 获取用户加入的学习小组
     */
    public function joinedGroups()
    {
        return $this->belongsToMany(StudyGroup::class, 'study_group_members')
            ->withTimestamps()
            ->withPivot(['role', 'joined_at']);
    }

    /**
     * 获取推荐的用户
     */
    public function referredUsers()
    {
        return $this->hasMany(self::class, 'referred_by');
    }

    /**
     * 获取推荐人
     */
    public function referrer()
    {
        return $this->belongsTo(self::class, 'referred_by');
    }

    /**
     * 获取推荐计划记录（作为推荐人）
     */
    public function referralPrograms()
    {
        return $this->hasMany(ReferralProgram::class, 'referrer_id');
    }

    /**
     * 获取用户行为分析记录
     */
    public function analytics()
    {
        return $this->hasMany(UserAnalytics::class);
    }
}
