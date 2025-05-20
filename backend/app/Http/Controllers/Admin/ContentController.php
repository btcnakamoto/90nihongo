<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ContentController extends Controller
{
    /**
     * 显示学习内容列表
     */
    public function index()
    {
        return response()->json([
            'message' => '学习内容列表',
            'content' => []
        ]);
    }

    /**
     * 存储新学习内容
     */
    public function store(Request $request)
    {
        return response()->json([
            'message' => '学习内容创建成功',
            'content' => []
        ], 201);
    }

    /**
     * 显示指定学习内容
     */
    public function show(string $id)
    {
        return response()->json([
            'message' => '学习内容详情',
            'content' => ['id' => $id]
        ]);
    }

    /**
     * 更新指定学习内容
     */
    public function update(Request $request, string $id)
    {
        return response()->json([
            'message' => '学习内容更新成功',
            'content' => ['id' => $id]
        ]);
    }

    /**
     * 删除指定学习内容
     */
    public function destroy(string $id)
    {
        return response()->json([
            'message' => '学习内容删除成功'
        ]);
    }
} 