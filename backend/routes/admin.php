<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\ContentController;
use App\Http\Controllers\Admin\DatabaseBackupController;

// 登录接口（无需认证）
Route::post('/login', [AuthController::class, 'login']);

// 需要认证的管理端接口
Route::middleware('auth:sanctum')->group(function () {
    // 认证相关
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/logout-all', [AuthController::class, 'logoutAll']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    
    // 用户管理
    Route::apiResource('/users', UserController::class);
    Route::post('/users/batch-action', [UserController::class, 'batchAction']);
    Route::get('/users-stats', [UserController::class, 'stats']);
    
    // 内容管理
    Route::apiResource('/content', ContentController::class);
    
    // 数据库备份管理
    Route::prefix('database')->group(function () {
        Route::get('/status', [DatabaseBackupController::class, 'status']);
        Route::get('/backups', [DatabaseBackupController::class, 'index']);
        Route::post('/backups', [DatabaseBackupController::class, 'store']);
        Route::get('/backups/{filename}/download', [DatabaseBackupController::class, 'download']);
        Route::delete('/backups/{filename}', [DatabaseBackupController::class, 'destroy']);
        Route::post('/restore', [DatabaseBackupController::class, 'restore']);
    });
    
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
