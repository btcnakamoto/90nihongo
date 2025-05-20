<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    /**
     * 用户注册
     */
    public function register(Request $request)
    {
        return response()->json([
            'message' => '用户注册成功',
            'user' => []
        ], 201);
    }

    /**
     * 用户登录
     */
    public function login(Request $request)
    {
        return response()->json([
            'message' => '用户登录成功',
            'token' => 'sample_token'
        ]);
    }

    /**
     * 用户登出
     */
    public function logout(Request $request)
    {
        return response()->json([
            'message' => '用户登出成功'
        ]);
    }

    /**
     * 获取当前用户信息
     */
    public function user(Request $request)
    {
        return response()->json([
            'message' => '用户信息',
            'user' => []
        ]);
    }
} 