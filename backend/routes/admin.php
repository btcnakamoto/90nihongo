<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin API Routes
|--------------------------------------------------------------------------
|
| 这里是所有管理端API路由，使用 "admin" 中间件组进行保护
|
*/

Route::middleware(['api'])->prefix('admin')->group(function () {
    // 管理员认证路由
    Route::post('/login', function () {
        return response()->json(['message' => '管理员登录API']);
    });
    
    // 需要认证的管理员路由
    Route::middleware(['auth:sanctum'])->group(function () {
        // 用户管理
        Route::apiResource('/users', \App\Http\Controllers\Admin\UserController::class);
        
        // 内容管理
        Route::apiResource('/content', \App\Http\Controllers\Admin\ContentController::class);
        
        // 统计数据
        Route::get('/stats', function () {
            return response()->json(['message' => '系统统计数据']);
        });
    });
}); 