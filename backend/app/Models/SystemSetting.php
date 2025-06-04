<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Cache;

/**
 * 系统设置模型
 * 
 * 功能描述：管理系统配置项，支持类型化存储和缓存
 * 输入参数：设置键值对
 * 返回值：格式化的设置值
 * 用途说明：存储和管理系统的各种配置选项
 * 作者：AI Assistant
 * 创建时间：2024-01-21
 */
class SystemSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'label',
        'description',
        'options',
        'is_public',
        'is_required',
        'sort_order',
    ];

    protected $casts = [
        'options' => 'array',
        'is_public' => 'boolean',
        'is_required' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * 获取格式化的值
     */
    protected function value(): Attribute
    {
        return Attribute::make(
            get: fn (string $value) => $this->castValue($value),
            set: fn ($value) => $this->prepareValue($value),
        );
    }

    /**
     * 根据类型转换值
     */
    private function castValue(string $value): mixed
    {
        return match ($this->type) {
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'integer' => (int) $value,
            'float' => (float) $value,
            'json', 'array' => json_decode($value, true),
            default => $value,
        };
    }

    /**
     * 准备存储的值
     */
    private function prepareValue(mixed $value): string
    {
        return match ($this->type) {
            'boolean' => $value ? '1' : '0',
            'json', 'array' => json_encode($value),
            default => (string) $value,
        };
    }

    /**
     * 获取设置值（带缓存）
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $cacheKey = "system_setting_{$key}";
        
        return Cache::remember($cacheKey, 3600, function () use ($key, $default) {
            $setting = static::where('key', $key)->first();
            return $setting ? $setting->value : $default;
        });
    }

    /**
     * 设置值
     */
    public static function set(string $key, mixed $value): bool
    {
        $setting = static::updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );

        // 清除缓存
        Cache::forget("system_setting_{$key}");
        
        return $setting->wasRecentlyCreated || $setting->wasChanged();
    }

    /**
     * 批量设置
     */
    public static function setMany(array $settings): bool
    {
        $success = true;
        
        foreach ($settings as $key => $value) {
            if (!static::set($key, $value)) {
                $success = false;
            }
        }
        
        return $success;
    }

    /**
     * 获取分组设置
     */
    public static function getByGroup(string $group): array
    {
        return static::where('group', $group)
            ->orderBy('sort_order')
            ->get()
            ->mapWithKeys(fn ($setting) => [$setting->key => $setting->value])
            ->toArray();
    }

    /**
     * 获取公开设置（前端可访问）
     */
    public static function getPublicSettings(): array
    {
        return static::where('is_public', true)
            ->orderBy('group')
            ->orderBy('sort_order')
            ->get()
            ->groupBy('group')
            ->map(fn ($settings) => $settings->mapWithKeys(fn ($setting) => [$setting->key => $setting->value]))
            ->toArray();
    }

    /**
     * 清除所有设置缓存
     */
    public static function clearCache(): void
    {
        $keys = static::pluck('key');
        foreach ($keys as $key) {
            Cache::forget("system_setting_{$key}");
        }
    }
} 