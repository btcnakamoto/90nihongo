<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use App\Models\Admin;

class AuthController extends Controller
{
    /**
     * 管理员登录
     */
    public function login(Request $request)
    {
        $request->validate([
            'account' => 'required', // 可以是邮箱或用户名
            'password' => 'required',
        ]);

        $admin = Admin::where('email', $request->account)
            ->orWhere('username', $request->account)
            ->first();

        if (!$admin || !Hash::check($request->password, $admin->password)) {
            throw ValidationException::withMessages([
                'account' => ['账号或密码错误'],
            ]);
        }

        // 检查管理员状态
        if (!$admin->status) {
            throw ValidationException::withMessages([
                'account' => ['账号已被禁用，请联系超级管理员'],
            ]);
        }

        // 创建token
        $token = $admin->createToken('admin_token', ['admin'])->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => '登录成功',
            'token' => $token,
            'admin' => [
                'id' => $admin->id,
                'username' => $admin->username,
                'email' => $admin->email,
                'role' => $admin->role,
                'status' => $admin->status,
                'is_super_admin' => $admin->isSuperAdmin(),
            ],
        ]);
    }

    /**
     * 管理员登出（单个token）
     */
    public function logout(Request $request)
    {
        try {
            // 删除当前使用的token
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'success' => true,
                'message' => '已成功登出'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '登出失败，请重试'
            ], 500);
        }
    }

    /**
     * 管理员全部登出（删除所有token）
     */
    public function logoutAll(Request $request)
    {
        try {
            // 删除该管理员的所有token
            $request->user()->tokens()->delete();

            return response()->json([
                'success' => true,
                'message' => '已从所有设备登出'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '登出失败，请重试'
            ], 500);
        }
    }

    /**
     * 获取当前管理员信息
     */
    public function me(Request $request)
    {
        $admin = $request->user();

        return response()->json([
            'success' => true,
            'admin' => [
                'id' => $admin->id,
                'username' => $admin->username,
                'email' => $admin->email,
                'role' => $admin->role,
                'status' => $admin->status,
                'is_super_admin' => $admin->isSuperAdmin(),
                'created_at' => $admin->created_at,
                'email_verified_at' => $admin->email_verified_at,
            ],
        ]);
    }

    /**
     * 刷新token
     */
    public function refresh(Request $request)
    {
        try {
            $admin = $request->user();
            
            // 删除当前token
            $request->user()->currentAccessToken()->delete();
            
            // 创建新token
            $newToken = $admin->createToken('admin_token', ['admin'])->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Token已刷新',
                'token' => $newToken,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token刷新失败'
            ], 500);
        }
    }
} 