<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    /**
     * 获取分类列表
     */
    public function index(Request $request)
    {
        try {
            $query = Category::query()
                ->withCount('learningMaterials as materials_count')
                ->with('parent:id,name');

            // 搜索功能
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('slug', 'like', "%{$search}%");
                });
            }

            // 按级别筛选
            if ($request->has('level') && $request->level !== 'all') {
                $query->where('level', $request->level);
            }

            // 按状态筛选
            if ($request->has('status')) {
                if ($request->status === 'active') {
                    $query->where('is_active', true);
                } elseif ($request->status === 'inactive') {
                    $query->where('is_active', false);
                }
            }

            // 按父分类筛选
            if ($request->has('parent_id')) {
                if ($request->parent_id === 'null') {
                    $query->whereNull('parent_id');
                } elseif ($request->parent_id !== 'all') {
                    $query->where('parent_id', $request->parent_id);
                }
            }

            // 排序
            $sortBy = $request->get('sort_by', 'sort_order');
            $sortDirection = $request->get('sort_direction', 'asc');
            
            if (in_array($sortBy, ['sort_order', 'level', 'name', 'created_at', 'materials_count'])) {
                if ($sortBy === 'materials_count') {
                    $query->orderBy('learning_materials_count', $sortDirection);
                } else {
                    $query->orderBy($sortBy, $sortDirection);
                }
            }

            // 分页或全部数据
            if ($request->has('per_page') && $request->per_page !== 'all') {
                $categories = $query->paginate($request->per_page);
            } else {
                $categories = $query->get();
            }

            return response()->json([
                'success' => true,
                'data' => $categories
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '获取分类列表失败',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * 获取分类详情
     */
    public function show($id)
    {
        try {
            $category = Category::with(['parent', 'children', 'learningMaterials'])
                ->withCount('learningMaterials as materials_count')
                ->findOrFail($id);

            // 获取面包屑
            $breadcrumb = $category->getBreadcrumb();

            return response()->json([
                'success' => true,
                'data' => [
                    'category' => $category,
                    'breadcrumb' => $breadcrumb,
                    'stats' => [
                        'materials_count' => $category->materials_count,
                        'children_count' => $category->children->count(),
                        'level' => $category->level,
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '获取分类详情失败',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 404);
        }
    }

    /**
     * 创建分类
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'parent_id' => 'nullable|exists:categories,id',
            'sort_order' => 'nullable|integer|min:0'
        ]);

        try {
            DB::beginTransaction();

            // 自动生成slug
            $slug = Str::slug($request->name);
            $originalSlug = $slug;
            $counter = 1;
            
            while (Category::where('slug', $slug)->exists()) {
                $slug = $originalSlug . '-' . $counter;
                $counter++;
            }

            // 确定分类级别
            $level = 1;
            if ($request->parent_id) {
                $parent = Category::findOrFail($request->parent_id);
                $level = $parent->level + 1;
            }

            // 如果没有指定排序，使用下一个可用的排序号
            $sortOrder = $request->sort_order;
            if (!$sortOrder) {
                $maxOrder = Category::where('parent_id', $request->parent_id)
                    ->max('sort_order');
                $sortOrder = ($maxOrder ?? 0) + 1;
            }

            $category = Category::create([
                'name' => $request->name,
                'slug' => $slug,
                'parent_id' => $request->parent_id,
                'level' => $level,
                'sort_order' => $sortOrder,
                'is_active' => $request->get('is_active', true)
            ]);

            // 重新加载关联数据
            $category->load('parent');
            $category->loadCount('learningMaterials as materials_count');

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => '分类创建成功',
                'data' => $category
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => '创建分类失败',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * 更新分类
     */
    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories', 'name')->ignore($category->id)
            ],
            'parent_id' => [
                'nullable',
                'exists:categories,id',
                function ($attribute, $value, $fail) use ($category) {
                    if ($value == $category->id) {
                        $fail('分类不能作为自己的父分类');
                    }
                    
                    // 检查是否会形成循环引用
                    if ($value && $this->wouldCreateCircularReference($category->id, $value)) {
                        $fail('不能将分类移动到其子分类下');
                    }
                }
            ],
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'boolean'
        ]);

        try {
            DB::beginTransaction();

            // 如果名称改变了，重新生成slug
            $slug = $category->slug;
            if ($category->name !== $request->name) {
                $slug = Str::slug($request->name);
                $originalSlug = $slug;
                $counter = 1;
                
                while (Category::where('slug', $slug)->where('id', '!=', $category->id)->exists()) {
                    $slug = $originalSlug . '-' . $counter;
                    $counter++;
                }
            }

            // 更新级别（如果父分类改变了）
            $level = $category->level;
            if ($category->parent_id != $request->parent_id) {
                $level = 1;
                if ($request->parent_id) {
                    $parent = Category::findOrFail($request->parent_id);
                    $level = $parent->level + 1;
                }
                
                // 同时更新所有子分类的级别
                $this->updateChildrenLevels($category->id, $level);
            }

            $category->update([
                'name' => $request->name,
                'slug' => $slug,
                'parent_id' => $request->parent_id,
                'level' => $level,
                'sort_order' => $request->get('sort_order', $category->sort_order),
                'is_active' => $request->get('is_active', $category->is_active)
            ]);

            // 重新加载关联数据
            $category->load('parent');
            $category->loadCount('learningMaterials as materials_count');

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => '分类更新成功',
                'data' => $category
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => '更新分类失败',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * 删除分类
     */
    public function destroy($id)
    {
        try {
            $category = Category::findOrFail($id);

            // 检查是否有子分类
            if ($category->children()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => '无法删除具有子分类的分类，请先删除或移动子分类'
                ], 400);
            }

            // 检查是否有关联的学习材料
            if ($category->learningMaterials()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => '无法删除具有关联学习材料的分类，请先移除关联'
                ], 400);
            }

            $category->delete();

            return response()->json([
                'success' => true,
                'message' => '分类删除成功'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '删除分类失败',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * 获取分类统计信息
     */
    public function stats()
    {
        try {
            $stats = [
                'total_categories' => Category::count(),
                'active_categories' => Category::where('is_active', true)->count(),
                'inactive_categories' => Category::where('is_active', false)->count(),
                'top_level_categories' => Category::whereNull('parent_id')->count(),
                'categories_by_level' => Category::select('level', DB::raw('count(*) as count'))
                    ->groupBy('level')
                    ->orderBy('level')
                    ->get(),
                'most_used_categories' => Category::withCount('learningMaterials')
                    ->orderBy('learning_materials_count', 'desc')
                    ->limit(10)
                    ->get(['id', 'name', 'learning_materials_count']),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '获取统计信息失败',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * 获取分类树形结构
     */
    public function tree()
    {
        try {
            $categories = Category::with('children.children.children')
                ->whereNull('parent_id')
                ->orderBy('sort_order')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $categories
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '获取分类树失败',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * 批量操作分类
     */
    public function batchAction(Request $request)
    {
        $request->validate([
            'action' => 'required|in:activate,deactivate,delete',
            'ids' => 'required|array|min:1',
            'ids.*' => 'exists:categories,id'
        ]);

        try {
            DB::beginTransaction();

            $action = $request->action;
            $ids = $request->ids;
            $affectedCount = 0;

            switch ($action) {
                case 'activate':
                    $affectedCount = Category::whereIn('id', $ids)->update(['is_active' => true]);
                    break;

                case 'deactivate':
                    $affectedCount = Category::whereIn('id', $ids)->update(['is_active' => false]);
                    break;

                case 'delete':
                    // 检查是否有子分类或关联材料
                    $hasChildren = Category::whereIn('parent_id', $ids)->exists();
                    $hasMaterials = DB::table('learning_material_categories')
                        ->whereIn('category_id', $ids)
                        ->exists();

                    if ($hasChildren) {
                        throw new \Exception('无法删除具有子分类的分类');
                    }

                    if ($hasMaterials) {
                        throw new \Exception('无法删除具有关联学习材料的分类');
                    }

                    $affectedCount = Category::whereIn('id', $ids)->delete();
                    break;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "批量{$this->getActionName($action)}成功",
                'affected_count' => $affectedCount
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => "批量操作失败：{$e->getMessage()}",
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * 检查是否会形成循环引用
     */
    private function wouldCreateCircularReference($categoryId, $newParentId)
    {
        $category = Category::find($newParentId);
        
        while ($category) {
            if ($category->id == $categoryId) {
                return true;
            }
            $category = $category->parent;
        }
        
        return false;
    }

    /**
     * 更新子分类的级别
     */
    private function updateChildrenLevels($parentId, $parentLevel)
    {
        $children = Category::where('parent_id', $parentId)->get();
        
        foreach ($children as $child) {
            $newLevel = $parentLevel + 1;
            $child->update(['level' => $newLevel]);
            
            // 递归更新子分类的子分类
            $this->updateChildrenLevels($child->id, $newLevel);
        }
    }

    /**
     * 获取操作名称
     */
    private function getActionName($action)
    {
        $names = [
            'activate' => '启用',
            'deactivate' => '禁用',
            'delete' => '删除'
        ];
        
        return $names[$action] ?? $action;
    }
} 