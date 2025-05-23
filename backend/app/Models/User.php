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
    ];

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
}
