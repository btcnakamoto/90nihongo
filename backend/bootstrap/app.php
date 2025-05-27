<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            Route::prefix('admin')
                ->middleware('api')
                ->group(base_path('routes/admin.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware) {
        // 配置CORS中间件到api路由
        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);
        
        // 也可以对web路由添加CORS支持（如果需要）
        $middleware->web(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // 处理未认证异常，对API请求返回JSON响应
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, $request) {
            // 对于API请求，始终返回JSON响应
            if ($request->expectsJson() || 
                $request->is('admin/*') || 
                $request->is('api/*') ||
                $request->wantsJson() ||
                str_contains($request->header('Accept', ''), 'application/json')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated',
                    'error' => 'Authentication required'
                ], 401);
            }
            
            // 对于web请求，重定向到前端登录页面
            return redirect('http://localhost:8081/login');
        });
    })->create();
