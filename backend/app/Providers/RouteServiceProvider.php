<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Http\Request;
use Illuminate\Cache\RateLimiting\Limit;

class RouteServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        $this->routes(function () {
            // 用户端API路由
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));

            // 管理端API路由
            Route::middleware('api')
                ->prefix('admin')
                ->group(base_path('routes/admin.php'));

            // Web路由
            Route::middleware('web')
                ->group(base_path('routes/web.php'));
        });
    }
} 