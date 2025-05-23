<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\ContentController;

// 登录接口（无需认证）
Route::post('/login', [AuthController::class, 'login']);

// 需要认证的管理端接口
Route::middleware('auth:sanctum')->group(function () {
    // 认证相关
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/logout-all', [AuthController::class, 'logoutAll']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    
    // 资源管理
    Route::apiResource('/users', UserController::class);
    Route::apiResource('/content', ContentController::class);
    
    // 统计信息
    Route::get('/stats', function () {
        return response()->json([
            'success' => true,
            'message' => '系统统计数据',
            'stats' => [
                'total_users' => 0,
                'total_content' => 0,
                'today_visits' => 0,
            ]
        ]);
    });
});
