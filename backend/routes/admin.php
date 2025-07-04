<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\ContentController;
use App\Http\Controllers\Admin\MaterialController;
use App\Http\Controllers\Admin\DatabaseBackupController;
use App\Http\Controllers\Admin\SubscriptionController;
use App\Http\Controllers\Admin\ResourceController;
use App\Http\Controllers\Admin\BilibiliExtractorController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\TagController;

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
        Route::get('/courses/{id}', [ContentController::class, 'getCourseDetail']);
        Route::get('/materials', [ContentController::class, 'getMaterials']);
        Route::get('/vocabulary', [ContentController::class, 'getVocabulary']);
        Route::get('/exercises', [ContentController::class, 'getExercises']);
        Route::get('/sentences', [ContentController::class, 'getSentences']);
        
        // 创建内容的路由
        Route::post('/courses', [ContentController::class, 'createCourse']);
        Route::post('/materials', [ContentController::class, 'createMaterial']);
        Route::post('/vocabulary', [ContentController::class, 'createVocabulary']);
        Route::post('/exercises', [ContentController::class, 'createExercise']);
        
        // 文件上传
        Route::post('/upload', [ContentController::class, 'uploadFile']);
        
        // 批量操作
        Route::post('/batch/{contentType}', [ContentController::class, 'batchCreate']);
        Route::delete('/batch/{contentType}', [ContentController::class, 'batchDelete']);
        
        // 数据导出
        Route::get('/export/{contentType}', [ContentController::class, 'exportData']);
    });
    
    Route::apiResource('/content', ContentController::class);
    
    // 标签管理 - 先定义自定义路由，再定义RESTful资源路由
    Route::prefix('tags')->group(function () {
        Route::get('/stats', [TagController::class, 'stats']);
        Route::get('/popular', [TagController::class, 'popular']);
        Route::post('/batch-action', [TagController::class, 'batchAction']);
    });
    Route::apiResource('/tags', TagController::class);

    // 分类管理
    Route::prefix('categories')->group(function () {
        Route::get('/stats', [CategoryController::class, 'stats']);
        Route::get('/tree', [CategoryController::class, 'tree']);
        Route::post('/batch-action', [CategoryController::class, 'batchAction']);
    });
    Route::apiResource('/categories', CategoryController::class);

    
    // 学习材料专门管理路由
    Route::prefix('materials')->group(function () {
        Route::get('/', [MaterialController::class, 'getMaterialsWithFilters']);
        Route::get('/stats', [MaterialController::class, 'getMaterialStats']);
        Route::get('/{id}', [MaterialController::class, 'getMaterialDetail']);
        Route::post('/batch-operation', [MaterialController::class, 'batchOperation']);
    });
    
    // 资源管理
    Route::prefix('resources')->group(function () {
        Route::get('/', [ResourceController::class, 'index']);
        Route::get('/stats', [ResourceController::class, 'getStats']);
        Route::get('/tasks', [ResourceController::class, 'getTasks']);
        Route::get('/tasks/{taskId}', [ResourceController::class, 'getTaskDetail']);
        Route::post('/web-scraping', [ResourceController::class, 'startWebScraping']);
        Route::post('/file-upload', [ResourceController::class, 'uploadFiles']);
        Route::post('/api-import', [ResourceController::class, 'startApiImport']);
        Route::patch('/tasks/{taskId}/toggle', [ResourceController::class, 'toggleTask']);
        Route::delete('/tasks/{taskId}', [ResourceController::class, 'cancelTask']);
        
        // B站视频提取管理 - 必须在通用路由之前
        Route::prefix('bilibili')->group(function () {
            Route::post('/video-info', [BilibiliExtractorController::class, 'getVideoInfo']);
            Route::post('/extract', [BilibiliExtractorController::class, 'submitExtraction']);
            Route::get('/jobs', [BilibiliExtractorController::class, 'getJobs']);
            Route::get('/jobs/{jobId}', [BilibiliExtractorController::class, 'getJob']);
            Route::delete('/jobs/{jobId}', [BilibiliExtractorController::class, 'deleteJob']);
            Route::post('/jobs/{jobId}/retry', [BilibiliExtractorController::class, 'retryJob']);
            Route::get('/jobs/{jobId}/download/{fileType}', [BilibiliExtractorController::class, 'downloadFile']);
            Route::get('/system-status', [BilibiliExtractorController::class, 'getSystemStatus']);
        });
        
        // 通用资源删除路由 - 必须在最后
        Route::delete('/{resourceId}', [ResourceController::class, 'deleteResource']);
    });
    
    // 数据库备份管理
    Route::prefix('database')->group(function () {
        Route::get('/status', [DatabaseBackupController::class, 'status']);
        Route::get('/tables', [DatabaseBackupController::class, 'tables']);
        Route::get('/backups', [DatabaseBackupController::class, 'index']);
        Route::post('/backups', [DatabaseBackupController::class, 'store']);
        Route::post('/backups/tables', [DatabaseBackupController::class, 'backupTables']);
        Route::get('/backups/{filename}/download', [DatabaseBackupController::class, 'download']);
        Route::delete('/backups/{filename}', [DatabaseBackupController::class, 'destroy']);
        Route::post('/restore', [DatabaseBackupController::class, 'restore']);
    });
    
    // 系统设置管理
    Route::prefix('settings')->group(function () {
        Route::get('/', [SettingsController::class, 'index']);
        Route::get('/{group}', [SettingsController::class, 'getByGroup']);
        Route::put('/', [SettingsController::class, 'update']);
        Route::put('/{group}', [SettingsController::class, 'updateGroup']);
        Route::post('/initialize', [SettingsController::class, 'initialize']);
        Route::post('/reset', [SettingsController::class, 'reset']);
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