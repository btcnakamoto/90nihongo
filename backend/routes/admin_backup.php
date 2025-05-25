<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\ContentController;use App\Http\Controllers\Admin\MaterialController;use App\Http\Controllers\Admin\DatabaseBackupController;use App\Http\Controllers\Admin\SubscriptionController;

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
    
    // 订阅管理
    Route::prefix('subscriptions')->group(function () {
        Route::get('/plans', [SubscriptionController::class, 'getPlans']);
        Route::get('/stats', [SubscriptionController::class, 'getStats']);
        Route::put('/users/{user}/subscription', [SubscriptionController::class, 'updateUserSubscription']);
        Route::post('/users/batch-update', [SubscriptionController::class, 'batchUpdateSubscription']);
        Route::get('/expiring', [SubscriptionController::class, 'getExpiringSubscriptions']);
        Route::get('/referrals/stats', [SubscriptionController::class, 'getReferralStats']);
    });
    
    // 内容管理 - 特定路由必须在资源路由之前
    Route::prefix('content')->group(function () {
        // 获取数据的路由
        Route::get('/stats', [ContentController::class, 'getStats']);
        Route::get('/courses', [ContentController::class, 'getCourses']);
        Route::get('/materials', [ContentController::class, 'getMaterials']);
        Route::get('/vocabulary', [ContentController::class, 'getVocabulary']);
        Route::get('/exercises', [ContentController::class, 'getExercises']);
        
        // 创建内容的路由
        Route::post('/courses', [ContentController::class, 'createCourse']);
        Route::post('/materials', [ContentController::class, 'createMaterial']);
        Route::post('/vocabulary', [ContentController::class, 'createVocabulary']);
        Route::post('/exercises', [ContentController::class, 'createExercise']);
        
        // 文件上传
        Route::post('/upload', [ContentController::class, 'uploadFile']);
    });
    Route::apiResource('/content', ContentController::class);        // 学习材料专门管理路由    Route::prefix('materials')->group(function () {        Route::get('/', [MaterialController::class, 'getMaterialsWithFilters']);        Route::get('/stats', [MaterialController::class, 'getMaterialStats']);        Route::get('/{id}', [MaterialController::class, 'getMaterialDetail']);        Route::post('/batch-operation', [MaterialController::class, 'batchOperation']);    });        // 数据库备份管理
    Route::prefix('database')->group(function () {
        Route::get('/status', [DatabaseBackupController::class, 'status']);
        Route::get('/tables', [DatabaseBackupController::class, 'tables']);
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
