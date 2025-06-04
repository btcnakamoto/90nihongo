<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\SettingsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

/**
 * 系统设置控制器
 * 
 * 功能描述：处理系统设置相关的HTTP请求
 * 输入参数：HTTP请求数据
 * 返回值：JSON格式的响应数据
 * 用途说明：提供系统设置的RESTful API接口
 * 作者：AI Assistant
 * 创建时间：2024-01-21
 */
class SettingsController extends Controller
{
    public function __construct(
        private readonly SettingsService $settingsService
    ) {}

    /**
     * 获取所有设置
     */
    public function index(): JsonResponse
    {
        try {
            $settings = $this->settingsService->getAllSettings();

            return response()->json([
                'code' => 200,
                'message' => '获取设置成功',
                'data' => $settings
            ]);
        } catch (\Exception $e) {
            Log::error('获取系统设置失败: ' . $e->getMessage());
            
            return response()->json([
                'code' => 500,
                'message' => '获取设置失败',
                'data' => null
            ], 500);
        }
    }

    /**
     * 获取指定分组的设置
     */
    public function getByGroup(string $group): JsonResponse
    {
        try {
            $settings = $this->settingsService->getSettingsByGroup($group);

            return response()->json([
                'code' => 200,
                'message' => '获取设置成功',
                'data' => $settings
            ]);
        } catch (\Exception $e) {
            Log::error("获取{$group}分组设置失败: " . $e->getMessage());
            
            return response()->json([
                'code' => 500,
                'message' => '获取设置失败',
                'data' => null
            ], 500);
        }
    }

    /**
     * 更新设置
     */
    public function update(Request $request): JsonResponse
    {
        try {
            $settings = $request->input('settings', []);
            $group = $request->input('group');

            if (empty($settings)) {
                return response()->json([
                    'code' => 400,
                    'message' => '设置数据不能为空',
                    'data' => null
                ], 400);
            }

            $result = $this->settingsService->updateSettings($settings, $group);

            $message = "成功更新 {$result['updated']} 个设置";
            if (!empty($result['failed'])) {
                $message .= "，{$result['failed']} 个设置更新失败";
            }

            return response()->json([
                'code' => 200,
                'message' => $message,
                'data' => $result
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'code' => 422,
                'message' => '数据验证失败',
                'data' => [
                    'errors' => $e->errors()
                ]
            ], 422);

        } catch (\Exception $e) {
            Log::error('更新系统设置失败: ' . $e->getMessage());
            
            return response()->json([
                'code' => 500,
                'message' => '更新设置失败',
                'data' => null
            ], 500);
        }
    }

    /**
     * 更新指定分组的设置
     */
    public function updateGroup(Request $request, string $group): JsonResponse
    {
        try {
            $settings = $request->all();

            if (empty($settings)) {
                return response()->json([
                    'code' => 400,
                    'message' => '设置数据不能为空',
                    'data' => null
                ], 400);
            }

            $result = $this->settingsService->updateSettings($settings, $group);

            $message = "成功更新 {$group} 分组的 " . count($result['updated']) . " 个设置";
            if (!empty($result['failed'])) {
                $message .= "，" . count($result['failed']) . " 个设置更新失败";
            }

            return response()->json([
                'code' => 200,
                'message' => $message,
                'data' => $result
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'code' => 422,
                'message' => '数据验证失败',
                'data' => [
                    'errors' => $e->errors()
                ]
            ], 422);

        } catch (\Exception $e) {
            Log::error("更新{$group}分组设置失败: " . $e->getMessage());
            
            return response()->json([
                'code' => 500,
                'message' => '更新设置失败',
                'data' => null
            ], 500);
        }
    }

    /**
     * 初始化默认设置
     */
    public function initialize(): JsonResponse
    {
        try {
            $this->settingsService->initializeDefaultSettings();

            return response()->json([
                'code' => 200,
                'message' => '初始化设置成功',
                'data' => null
            ]);
        } catch (\Exception $e) {
            Log::error('初始化系统设置失败: ' . $e->getMessage());
            
            return response()->json([
                'code' => 500,
                'message' => '初始化设置失败',
                'data' => null
            ], 500);
        }
    }

    /**
     * 重置设置到默认值
     */
    public function reset(Request $request): JsonResponse
    {
        try {
            $group = $request->input('group');
            
            $success = $this->settingsService->resetToDefaults($group);

            if ($success) {
                $message = $group ? "重置 {$group} 分组设置成功" : "重置所有设置成功";
                return response()->json([
                    'code' => 200,
                    'message' => $message,
                    'data' => null
                ]);
            } else {
                return response()->json([
                    'code' => 500,
                    'message' => '重置设置失败',
                    'data' => null
                ], 500);
            }
        } catch (\Exception $e) {
            Log::error('重置系统设置失败: ' . $e->getMessage());
            
            return response()->json([
                'code' => 500,
                'message' => '重置设置失败',
                'data' => null
            ], 500);
        }
    }
} 