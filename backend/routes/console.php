<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// 数据库备份调度任务
// 默认关闭，可在配置中启用
if (config('backup.schedule.enabled', false)) {
    $frequency = config('backup.schedule.frequency', 'daily');
    $time = config('backup.schedule.time', '02:00');
    $description = config('backup.schedule.description', '自动备份');
    
    $command = Schedule::command('db:backup', ['--description' => $description]);
    
    match($frequency) {
        'daily' => $command->dailyAt($time),
        'weekly' => $command->weeklyOn(0, $time), // 周日执行
        'monthly' => $command->monthlyOn(1, $time), // 每月1日执行
        default => $command->dailyAt($time)
    };
    
    $command->withoutOverlapping()
           ->onOneServer()
           ->runInBackground();
}
