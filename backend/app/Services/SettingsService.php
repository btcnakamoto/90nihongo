<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\SystemSetting;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

/**
 * 系统设置服务
 * 
 * 功能描述：处理系统设置的业务逻辑，包括验证、存储和获取
 * 输入参数：设置数据和验证规则
 * 返回值：处理结果和设置数据
 * 用途说明：为控制器提供系统设置相关的业务逻辑支持
 * 作者：AI Assistant
 * 创建时间：2024-01-21
 */
class SettingsService
{
    /**
     * 获取所有设置（按分组）
     */
    public function getAllSettings(): array
    {
        return SystemSetting::orderBy('group')
            ->orderBy('sort_order')
            ->get()
            ->groupBy('group')
            ->map(function ($settings) {
                return $settings->mapWithKeys(function ($setting) {
                    return [$setting->key => [
                        'value' => $setting->value,
                        'type' => $setting->type,
                        'label' => $setting->label,
                        'description' => $setting->description,
                        'options' => $setting->options,
                        'is_required' => $setting->is_required,
                    ]];
                });
            })
            ->toArray();
    }

    /**
     * 获取分组设置
     */
    public function getSettingsByGroup(string $group): array
    {
        return SystemSetting::where('group', $group)
            ->orderBy('sort_order')
            ->get()
            ->mapWithKeys(function ($setting) {
                return [$setting->key => [
                    'value' => $setting->value,
                    'type' => $setting->type,
                    'label' => $setting->label,
                    'description' => $setting->description,
                    'options' => $setting->options,
                    'is_required' => $setting->is_required,
                ]];
            })
            ->toArray();
    }

    /**
     * 更新设置
     */
    public function updateSettings(array $settings, string $group = null): array
    {
        $validatedSettings = $this->validateSettings($settings, $group);
        
        $updated = [];
        $failed = [];

        foreach ($validatedSettings as $key => $value) {
            try {
                if (SystemSetting::set($key, $value)) {
                    $updated[] = $key;
                } else {
                    $failed[] = $key;
                }
            } catch (\Exception $e) {
                $failed[] = $key;
            }
        }

        return [
            'updated' => $updated,
            'failed' => $failed,
            'total' => count($settings),
        ];
    }

    /**
     * 验证设置数据
     */
    private function validateSettings(array $settings, string $group = null): array
    {
        $rules = [];
        $messages = [];

        // 获取设置定义
        $query = SystemSetting::query();
        if ($group) {
            $query->where('group', $group);
        }
        
        $settingDefinitions = $query->whereIn('key', array_keys($settings))->get();

        foreach ($settingDefinitions as $definition) {
            $key = $definition->key;
            $rule = $this->buildValidationRule($definition);
            
            if ($rule) {
                $rules[$key] = $rule;
                $messages["{$key}.required"] = "{$definition->label}是必填项";
            }
        }

        $validator = Validator::make($settings, $rules, $messages);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return $validator->validated();
    }

    /**
     * 构建验证规则
     */
    private function buildValidationRule(SystemSetting $setting): array
    {
        $rules = [];

        if ($setting->is_required) {
            $rules[] = 'required';
        } else {
            $rules[] = 'nullable';
        }

        switch ($setting->type) {
            case 'boolean':
                $rules[] = 'boolean';
                break;
            case 'integer':
                $rules[] = 'integer';
                break;
            case 'float':
                $rules[] = 'numeric';
                break;
            case 'email':
                $rules[] = 'email';
                break;
            case 'url':
                $rules[] = 'url';
                break;
            case 'json':
                $rules[] = 'json';
                break;
            case 'array':
                $rules[] = 'array';
                break;
            default:
                $rules[] = 'string';
                if ($setting->options && isset($setting->options['max_length'])) {
                    $rules[] = 'max:' . $setting->options['max_length'];
                }
                break;
        }

        // 如果有选项限制
        if ($setting->options && isset($setting->options['allowed_values'])) {
            $rules[] = 'in:' . implode(',', $setting->options['allowed_values']);
        }

        return $rules;
    }

    /**
     * 初始化默认设置
     */
    public function initializeDefaultSettings(): void
    {
        $defaultSettings = [
            // 基本设置
            [
                'key' => 'site_name',
                'value' => '90天日语',
                'type' => 'string',
                'group' => 'general',
                'label' => '网站名称',
                'description' => '网站的显示名称',
                'is_public' => true,
                'is_required' => true,
                'sort_order' => 1,
            ],
            [
                'key' => 'site_description',
                'value' => '学习日语最高效的平台',
                'type' => 'string',
                'group' => 'general',
                'label' => '网站描述',
                'description' => '网站的简短描述',
                'is_public' => true,
                'is_required' => false,
                'sort_order' => 2,
            ],
            [
                'key' => 'site_language',
                'value' => 'zh-CN',
                'type' => 'string',
                'group' => 'general',
                'label' => '默认语言',
                'description' => '网站的默认显示语言',
                'options' => [
                    'allowed_values' => ['zh-CN', 'zh-TW', 'en-US', 'ja-JP']
                ],
                'is_public' => true,
                'is_required' => true,
                'sort_order' => 3,
            ],
            
            // 通知设置
            [
                'key' => 'email_notifications',
                'value' => '1',
                'type' => 'boolean',
                'group' => 'notification',
                'label' => '电子邮件通知',
                'description' => '是否启用电子邮件通知',
                'is_public' => false,
                'is_required' => false,
                'sort_order' => 1,
            ],
            [
                'key' => 'system_notifications',
                'value' => '1',
                'type' => 'boolean',
                'group' => 'notification',
                'label' => '系统通知',
                'description' => '是否启用系统内通知',
                'is_public' => false,
                'is_required' => false,
                'sort_order' => 2,
            ],
            
            // 安全设置
            [
                'key' => 'session_timeout',
                'value' => '30',
                'type' => 'integer',
                'group' => 'security',
                'label' => '会话超时时间',
                'description' => '用户会话超时时间（分钟）',
                'options' => [
                    'allowed_values' => ['15', '30', '60', '120']
                ],
                'is_public' => false,
                'is_required' => true,
                'sort_order' => 1,
            ],
            
            // 界面设置
            [
                'key' => 'items_per_page',
                'value' => '10',
                'type' => 'integer',
                'group' => 'appearance',
                'label' => '每页显示条目数',
                'description' => '列表页面每页显示的条目数量',
                'options' => [
                    'allowed_values' => ['10', '20', '50', '100']
                ],
                'is_public' => true,
                'is_required' => true,
                'sort_order' => 1,
            ],
        ];

        foreach ($defaultSettings as $setting) {
            SystemSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }

    /**
     * 重置设置到默认值
     */
    public function resetToDefaults(string $group = null): bool
    {
        try {
            if ($group) {
                SystemSetting::where('group', $group)->delete();
            } else {
                SystemSetting::truncate();
            }
            
            $this->initializeDefaultSettings();
            SystemSetting::clearCache();
            
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }
} 