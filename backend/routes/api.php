<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| 这里是用户端API路由
|
*/


// 认证路由
Route::group(['middleware' => ['api']], function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});

// 需要认证的API
Route::middleware('auth:sanctum')->group(function () {
    Route::get('user', [AuthController::class, 'user']);
    Route::post('logout', [AuthController::class, 'logout']);

    // 用户相关
    Route::get('/learning/paths', function() {
        return response()->json([
            'message' => '学习路径列表',
            'paths' => []
        ]);
    });
    
    // 学习进度相关
    Route::get('/progress', function() {
        return response()->json([
            'message' => '学习进度',
            'progress' => []
        ]);
    });
    
    // 练习相关
    Route::get('/practice/listening', function() {
        return response()->json([
            'message' => '听力练习列表',
            'practices' => []
        ]);
    });
}); 