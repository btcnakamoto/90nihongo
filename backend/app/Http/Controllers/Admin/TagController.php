<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Tag;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class TagController extends Controller
{
    /**
     * 获取标签列表
     */
    public function index(Request $request)
    {
        try {
            $query = Tag::query();

            // 搜索
            if ($request->has('search') && !empty($request->search)) {
                $query->where('name', 'like', '%' . $request->search . '%');
            }

            // 状态筛选
            if ($request->has('status') && $request->status !== 'all') {
                if ($request->status === 'active') {
                    $query->where('is_active', true);
                } elseif ($request->status === 'inactive') {
                    $query->where('is_active', false);
                }
            }

            // 排序
            $sortBy = $request->get('sort_by', 'usage_count');
            $sortDirection = $request->get('sort_direction', 'desc');
            
            if (in_array($sortBy, ['id', 'name', 'usage_count', 'created_at', 'updated_at'])) {
                $query->orderBy($sortBy, $sortDirection);
            } else {
                $query->orderBy('usage_count', 'desc');
            }

            // 分页或全部
            if ($request->has('per_page') && is_numeric($request->per_page)) {
                $tags = $query->paginate($request->per_page);
            } else {
                $tags = $query->get();
            }

            return response()->json([
                'success' => true,
                'data' => $tags
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '获取标签列表失败',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 显示指定标签
     */
    public function show($id)
    {
        try {
            $tag = Tag::with('learningMaterials')->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $tag
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '获取标签详情失败',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 创建新标签
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:tags,name',
                'description' => 'nullable|string|max:500',
                'is_active' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => '数据验证失败',
                    'errors' => $validator->errors()
                ], 422);
            }

            $tag = Tag::create([
                'name' => $request->name,
                'slug' => '',  // 将通过模型的setNameAttribute自动生成
                'description' => $request->description,
                'is_active' => $request->is_active ?? true,
                'status' => 'active',
                'usage_count' => 0
            ]);

            return response()->json([
                'success' => true,
                'message' => '标签创建成功',
                'data' => $tag
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '创建标签失败',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 更新标签
     */
    public function update(Request $request, $id)
    {
        try {
            $tag = Tag::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => [
                    'required',
                    'string',
                    'max:255',
                    Rule::unique('tags', 'name')->ignore($tag->id)
                ],
                'description' => 'nullable|string|max:500',
                'is_active' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => '数据验证失败',
                    'errors' => $validator->errors()
                ], 422);
            }

            $tag->update([
                'name' => $request->name,
                'description' => $request->description,
                'is_active' => $request->is_active ?? $tag->is_active,
                'status' => $request->is_active ? 'active' : 'inactive'
            ]);

            return response()->json([
                'success' => true,
                'message' => '标签更新成功',
                'data' => $tag
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '更新标签失败',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 删除标签
     */
    public function destroy($id)
    {
        try {
            $tag = Tag::findOrFail($id);

            // 检查是否有关联的学习材料
            if ($tag->learningMaterials()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => '无法删除，该标签下还有关联的学习材料'
                ], 400);
            }

            $tag->delete();

            return response()->json([
                'success' => true,
                'message' => '标签删除成功'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '删除标签失败',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 获取标签统计信息
     */
    public function stats()
    {
        try {
            $stats = [
                'total_tags' => Tag::count(),
                'active_tags' => Tag::where('is_active', true)->count(),
                'inactive_tags' => Tag::where('is_active', false)->count(),
                'most_used_tags' => Tag::withCount('learningMaterials')
                    ->orderBy('learning_materials_count', 'desc')
                    ->limit(10)
                    ->get()
                    ->map(function ($tag) {
                        return [
                            'id' => $tag->id,
                            'name' => $tag->name,
                            'usage_count' => $tag->usage_count,
                            'materials_count' => $tag->learning_materials_count
                        ];
                    }),
                'recent_tags' => Tag::orderBy('created_at', 'desc')
                    ->limit(5)
                    ->get()
                    ->map(function ($tag) {
                        return [
                            'id' => $tag->id,
                            'name' => $tag->name,
                            'created_at' => $tag->created_at->format('Y-m-d H:i:s')
                        ];
                    })
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '获取统计信息失败',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 批量操作标签
     */
    public function batchAction(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'action' => 'required|in:activate,deactivate,delete',
                'ids' => 'required|array|min:1',
                'ids.*' => 'exists:tags,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => '数据验证失败',
                    'errors' => $validator->errors()
                ], 422);
            }

            $action = $request->action;
            $ids = $request->ids;
            $affectedCount = 0;

            DB::beginTransaction();

            switch ($action) {
                case 'activate':
                    $affectedCount = Tag::whereIn('id', $ids)->update([
                        'is_active' => true,
                        'status' => 'active'
                    ]);
                    break;

                case 'deactivate':
                    $affectedCount = Tag::whereIn('id', $ids)->update([
                        'is_active' => false,
                        'status' => 'inactive'
                    ]);
                    break;

                case 'delete':
                    // 检查是否有关联的学习材料
                    $hasMaterials = DB::table('learning_material_tags')
                        ->whereIn('tag_id', $ids)
                        ->exists();

                    if ($hasMaterials) {
                        DB::rollBack();
                        return response()->json([
                            'success' => false,
                            'message' => '无法删除，部分标签下还有关联的学习材料'
                        ], 400);
                    }

                    $affectedCount = Tag::whereIn('id', $ids)->delete();
                    break;
            }

            DB::commit();

            $actionText = [
                'activate' => '启用',
                'deactivate' => '禁用',
                'delete' => '删除'
            ];

            return response()->json([
                'success' => true,
                'message' => "成功{$actionText[$action]} {$affectedCount} 个标签",
                'affected_count' => $affectedCount
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => '批量操作失败',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 获取热门标签
     */
    public function popular()
    {
        try {
            $tags = Tag::popular()
                ->active()
                ->limit(20)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $tags
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '获取热门标签失败',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 