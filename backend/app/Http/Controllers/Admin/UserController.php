<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    /**
     * 显示用户列表
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = User::with(['learningProgress']);

            // 搜索功能
            if ($request->has('search')) {
                $search = $request->input('search');
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('username', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            // 状态筛选
            if ($request->has('status')) {
                $status = $request->input('status');
                if ($status === 'active') {
                    $query->where('is_active', true)
                          ->where(function($q) {
                              $q->whereNull('deleted_at');
                          });
                } elseif ($status === 'inactive') {
                    $query->where('is_active', false);
                } elseif ($status === 'deleted') {
                    $query->onlyTrashed();
                }
            } else {
                // 默认不显示已删除的用户
                $query->whereNull('deleted_at');
            }

            // 日语水平筛选
            if ($request->has('japanese_level')) {
                $level = $request->input('japanese_level');
                if (in_array($level, ['N1', 'N2', 'N3', 'N4', 'N5'])) {
                    $query->where('japanese_level', $level);
                }
            }

            // 注册时间筛选
            if ($request->has('date_from')) {
                $query->whereDate('created_at', '>=', $request->input('date_from'));
            }
            if ($request->has('date_to')) {
                $query->whereDate('created_at', '<=', $request->input('date_to'));
            }

            // 排序
            $sortBy = $request->input('sort_by', 'created_at');
            $sortOrder = $request->input('sort_order', 'desc');
            
            if (in_array($sortBy, ['name', 'email', 'created_at', 'last_login_at', 'japanese_level'])) {
                $query->orderBy($sortBy, $sortOrder);
            }

            // 分页
            $perPage = min($request->input('per_page', 15), 100); // 最多100条
            $users = $query->paginate($perPage);

            // 数据转换
            $users->getCollection()->transform(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                    'japanese_level' => $user->japanese_level,
                    'is_active' => $user->is_active,
                    'email_verified_at' => $user->email_verified_at,
                    'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                    'last_login_at' => $user->last_login_at ? $user->last_login_at->format('Y-m-d H:i:s') : null,
                    'study_start_date' => $user->study_start_date ? $user->study_start_date->format('Y-m-d') : null,
                    'daily_study_minutes' => $user->daily_study_minutes,
                    'learning_progress' => [
                        'current_day' => $user->learningProgress->current_day ?? 1,
                        'total_study_minutes' => $user->learningProgress->total_study_minutes ?? 0,
                        'consecutive_days' => $user->learningProgress->consecutive_days ?? 0,
                        'listening_score' => $user->learningProgress->listening_score ?? 0,
                        'speaking_score' => $user->learningProgress->speaking_score ?? 0,
                        'vocabulary_score' => $user->learningProgress->vocabulary_score ?? 0,
                        'grammar_score' => $user->learningProgress->grammar_score ?? 0,
                    ],
                ];
            });

            return response()->json([
                'success' => true,
                'message' => '获取用户列表成功',
                'data' => $users,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '获取用户列表失败: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 存储新用户
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'username' => 'required|string|max:255|unique:users',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8',
                'japanese_level' => 'required|in:N1,N2,N3,N4,N5',
                'daily_study_minutes' => 'nullable|integer|min:15|max:480',
            ]);

            DB::beginTransaction();

            $user = User::create([
                'name' => $request->name,
                'username' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'japanese_level' => $request->japanese_level,
                'daily_study_minutes' => $request->daily_study_minutes ?? 60,
                'study_start_date' => now()->toDateString(),
                'is_active' => true,
            ]);

            // 创建学习进度记录
            $user->learningProgress()->create([
                'current_day' => 1,
                'total_study_minutes' => 0,
                'consecutive_days' => 0,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => '用户创建成功',
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'japanese_level' => $user->japanese_level,
                    'is_active' => $user->is_active,
                    'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                ],
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => '验证失败',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => '用户创建失败: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 显示指定用户
     */
    public function show(string $id): JsonResponse
    {
        try {
            $user = User::with([
                'learningProgress',
                'achievements' => function($query) {
                    $query->orderBy('unlocked_at', 'desc');
                }
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'message' => '获取用户详情成功',
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                    'japanese_level' => $user->japanese_level,
                    'learning_goals' => $user->learning_goals,
                    'daily_study_minutes' => $user->daily_study_minutes,
                    'study_start_date' => $user->study_start_date ? $user->study_start_date->format('Y-m-d') : null,
                    'is_active' => $user->is_active,
                    'email_verified_at' => $user->email_verified_at,
                    'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                    'last_login_at' => $user->last_login_at ? $user->last_login_at->format('Y-m-d H:i:s') : null,
                    'learning_progress' => $user->learningProgress ? [
                        'current_day' => $user->learningProgress->current_day,
                        'total_study_minutes' => $user->learningProgress->total_study_minutes,
                        'consecutive_days' => $user->learningProgress->consecutive_days,
                        'listening_score' => $user->learningProgress->listening_score,
                        'speaking_score' => $user->learningProgress->speaking_score,
                        'vocabulary_score' => $user->learningProgress->vocabulary_score,
                        'grammar_score' => $user->learningProgress->grammar_score,
                        'last_study_date' => $user->learningProgress->last_study_date,
                    ] : null,
                    'achievements' => $user->achievements->map(function($achievement) {
                        return [
                            'id' => $achievement->id,
                            'name' => $achievement->name,
                            'description' => $achievement->description,
                            'icon' => $achievement->icon,
                            'type' => $achievement->type,
                            'unlocked_at' => $achievement->pivot->unlocked_at,
                        ];
                    }),
                ],
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '用户不存在',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '获取用户详情失败: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 更新指定用户
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);

            $request->validate([
                'name' => 'sometimes|string|max:255',
                'username' => ['sometimes', 'string', 'max:255', Rule::unique('users')->ignore($user->id)],
                'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
                'password' => 'sometimes|string|min:8',
                'japanese_level' => 'sometimes|in:N1,N2,N3,N4,N5',
                'daily_study_minutes' => 'nullable|integer|min:15|max:480',
                'is_active' => 'sometimes|boolean',
                'learning_goals' => 'sometimes|array',
            ]);

            $updateData = $request->only([
                'name', 'username', 'email', 'japanese_level', 
                'daily_study_minutes', 'is_active', 'learning_goals'
            ]);

            if ($request->has('password')) {
                $updateData['password'] = Hash::make($request->password);
            }

            $user->update($updateData);

            return response()->json([
                'success' => true,
                'message' => '用户更新成功',
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'japanese_level' => $user->japanese_level,
                    'is_active' => $user->is_active,
                    'updated_at' => $user->updated_at->format('Y-m-d H:i:s'),
                ],
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '用户不存在',
            ], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => '验证失败',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '用户更新失败: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 删除指定用户（软删除）
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);
            
            // 软删除
            $user->delete();

            return response()->json([
                'success' => true,
                'message' => '用户删除成功',
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '用户不存在',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '用户删除失败: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 批量操作
     */
    public function batchAction(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'action' => 'required|in:activate,deactivate,delete',
                'user_ids' => 'required|array|min:1',
                'user_ids.*' => 'integer|exists:users,id',
            ]);

            $userIds = $request->input('user_ids');
            $action = $request->input('action');

            switch ($action) {
                case 'activate':
                    User::whereIn('id', $userIds)->update(['is_active' => true]);
                    $message = '用户已批量激活';
                    break;
                case 'deactivate':
                    User::whereIn('id', $userIds)->update(['is_active' => false]);
                    $message = '用户已批量停用';
                    break;
                case 'delete':
                    User::whereIn('id', $userIds)->delete();
                    $message = '用户已批量删除';
                    break;
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'affected_count' => count($userIds),
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => '验证失败',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '批量操作失败: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 获取用户统计信息
     */
    public function stats(): JsonResponse
    {
        try {
            $stats = [
                'total_users' => User::count(),
                'active_users' => User::where('is_active', true)->count(),
                'inactive_users' => User::where('is_active', false)->count(),
                'deleted_users' => User::onlyTrashed()->count(),
                'new_users_today' => User::whereDate('created_at', today())->count(),
                'new_users_this_week' => User::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
                'new_users_this_month' => User::whereMonth('created_at', now()->month)->count(),
                'users_by_level' => User::select('japanese_level', DB::raw('count(*) as count'))
                    ->groupBy('japanese_level')
                    ->get()
                    ->pluck('count', 'japanese_level'),
            ];

            return response()->json([
                'success' => true,
                'message' => '获取统计信息成功',
                'data' => $stats,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '获取统计信息失败: ' . $e->getMessage(),
            ], 500);
        }
    }
} 