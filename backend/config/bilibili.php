<?php

return [
    /*
    |--------------------------------------------------------------------------
    | B站视频提取配置
    |--------------------------------------------------------------------------
    */

    // 是否使用测试脚本（在开发环境中建议使用测试脚本）
    'use_test_script' => env('BILIBILI_USE_TEST_SCRIPT', false),
    
    // Python可执行文件路径
    'python_path' => env('PYTHON_PATH', 'python'),
    
    // 提取任务超时时间（秒）
    'extraction_timeout' => env('BILIBILI_EXTRACTION_TIMEOUT', 1500),
    
    // 输出目录
    'output_directory' => 'bilibili_extracts',
    
    // 支持的视频格式
    'supported_formats' => ['mp4', 'mkv', 'webm'],
    
    // 音频输出设置
    'audio_settings' => [
        'format' => 'wav',
        'sample_rate' => 16000,
        'channels' => 1,
        'codec' => 'pcm_s16le'
    ],
    
    // 字幕设置
    'subtitle_settings' => [
        'format' => 'srt',
        'encoding' => 'utf-8'
    ]
]; 