<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * 显示用户列表
     */
    public function index()
    {
        return response()->json([
            'message' => '用户列表',
            'users' => []
        ]);
    }

    /**
     * 存储新用户
     */
    public function store(Request $request)
    {
        return response()->json([
            'message' => '用户创建成功',
            'user' => []
        ], 201);
    }

    /**
     * 显示指定用户
     */
    public function show(string $id)
    {
        return response()->json([
            'message' => '用户详情',
            'user' => ['id' => $id]
        ]);
    }

    /**
     * 更新指定用户
     */
    public function update(Request $request, string $id)
    {
        return response()->json([
            'message' => '用户更新成功',
            'user' => ['id' => $id]
        ]);
    }

    /**
     * 删除指定用户
     */
    public function destroy(string $id)
    {
        return response()->json([
            'message' => '用户删除成功'
        ]);
    }
} 