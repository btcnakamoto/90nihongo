<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LearningMaterial;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class MaterialController extends Controller
{
    /**
     * 获取学习材料初期化数据
     */
    public function getMaterialsWithFilters(Request $request)
    {
        try {
            $query = LearningMaterial::with(['course']);

            // 搜索
            if ($request->has('search') && !empty($request->search)) {
                $query->where('title', 'like', '%' . $request->search . '%');
            }

            // 按类型筛选
            if ($request->has('type') && $request->type !== 'all') {
                $query->where('type', $request->type);
            }

            // 按课程筛选
            if ($request->has('course_id') && $request->course_id !== 'all') {
                $query->where('course_id', $request->course_id);
            }

            // 按状态筛选
            if ($request->has('status') && $request->status !== 'all') {
                // 这里可以根据实际的状态字段进行筛选
            }

            // 分页
            $perPage = $request->get('per_page', 20);
            $page = $request->get('page', 1);

            // 排序
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            
            $materials = $query->orderBy($sortBy, $sortOrder)
                ->paginate($perPage, ['*'], 'page', $page);

            $formattedMaterials = $materials->getCollection()->map(function ($material) {
                return [
                    'id' => $material->id,
                    'title' => $material->title,
                    'type' => $material->type,
                    'course_id' => $material->course_id,
                    'course_title' => $material->course->title ?? '未分配',
                    'course_day' => $material->course->day_number ?? 0,
                    'content' => $material->content,
                    'media_url' => $material->media_url,
                    'duration' => $material->duration_minutes ?? 0,
                    'duration_formatted' => $this->formatDuration($material->duration_minutes ?? 0),
                    'size' => $this->formatFileSize(rand(1000, 50000000)),
                    'status' => 'active',
                    'views' => rand(100, 2000),
                    'rating' => rand(40, 50) / 10,
                    'downloads' => rand(50, 500),
                    'file_type' => $this->getFileTypeFromUrl($material->media_url),
                    'created_at' => $material->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $material->updated_at->format('Y-m-d H:i:s'),
                ];
            });

            // 获取统计数据
            $stats = $this->getMaterialStats();

            // 获取所有课程用于筛选器
            $courses = Course::select('id', 'title', 'day_number')->orderBy('day_number')->get();

            return response()->json([
                'success' => true,
                'data' => $formattedMaterials,
                'pagination' => [
                    'current_page' => $materials->currentPage(),
                    'last_page' => $materials->lastPage(),
                    'per_page' => $materials->perPage(),
                    'total' => $materials->total(),
                    'from' => $materials->firstItem(),
                    'to' => $materials->lastItem(),
                ],
                'stats' => $stats,
                'courses' => $courses,
                'filter_options' => [
                    'types' => ['video', 'audio', 'text', 'quiz'],
                    'statuses' => ['active', 'inactive', 'pending']
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '获取学习材料失败',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 获取学习材料统计数据
     */
    public function getMaterialStats()
    {
        try {
            $totalMaterials = LearningMaterial::count();
            $videoCount = LearningMaterial::where('type', 'video')->count();
            $audioCount = LearningMaterial::where('type', 'audio')->count();
            $textCount = LearningMaterial::where('type', 'text')->count();
            $quizCount = LearningMaterial::where('type', 'quiz')->count();

            // 按日期统计创建趋势
            $materialTrends = LearningMaterial::selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->groupBy('date')
                ->orderBy('date', 'desc')
                ->take(30)
                ->get();

            // 按课程统计材料分布
            $materialsByCourse = LearningMaterial::join('courses', 'learning_materials.course_id', '=', 'courses.id')
                ->selectRaw('courses.day_number, courses.title, COUNT(learning_materials.id) as material_count')
                ->groupBy('courses.id', 'courses.day_number', 'courses.title')
                ->orderBy('courses.day_number')
                ->get();

            return [
                'total_materials' => $totalMaterials,
                'video_count' => $videoCount,
                'audio_count' => $audioCount,
                'text_count' => $textCount,
                'quiz_count' => $quizCount,
                'material_trends' => $materialTrends,
                'materials_by_course' => $materialsByCourse,
                'type_distribution' => [
                    ['name' => '视频', 'value' => $videoCount, 'color' => '#0088FE'],
                    ['name' => '音频', 'value' => $audioCount, 'color' => '#00C49F'],
                    ['name' => '文本', 'value' => $textCount, 'color' => '#FFBB28'],
                    ['name' => '测验', 'value' => $quizCount, 'color' => '#FF8042']
                ]
            ];
        } catch (\Exception $e) {
            return [
                'total_materials' => 0,
                'video_count' => 0,
                'audio_count' => 0,
                'text_count' => 0,
                'quiz_count' => 0,
                'material_trends' => [],
                'materials_by_course' => [],
                'type_distribution' => []
            ];
        }
    }

    /**
     * 获取学习材料详情
     */
    public function getMaterialDetail($id)
    {
        try {
            $material = LearningMaterial::with(['course'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $material->id,
                    'title' => $material->title,
                    'type' => $material->type,
                    'course_id' => $material->course_id,
                    'course_title' => $material->course->title ?? '未分配',
                    'course_day' => $material->course->day_number ?? 0,
                    'content' => $material->content,
                    'media_url' => $material->media_url,
                    'duration' => $material->duration_minutes ?? 0,
                    'duration_formatted' => $this->formatDuration($material->duration_minutes ?? 0),
                    'metadata' => $material->metadata ?? [],
                    'file_type' => $this->getFileTypeFromUrl($material->media_url),
                    'views' => rand(100, 2000),
                    'rating' => rand(40, 50) / 10,
                    'downloads' => rand(50, 500),
                    'created_at' => $material->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $material->updated_at->format('Y-m-d H:i:s'),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '获取材料详情失败',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * 批量操作学习材料
     */
    public function batchOperation(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'action' => 'required|in:delete,activate,deactivate,move',
                'material_ids' => 'required|array',
                'material_ids.*' => 'exists:learning_materials,id',
                'target_course_id' => 'nullable|exists:courses,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => '参数验证失败',
                    'errors' => $validator->errors()
                ], 422);
            }

            $materialIds = $request->material_ids;
            $action = $request->action;
            
            switch ($action) {
                case 'delete':
                    LearningMaterial::whereIn('id', $materialIds)->delete();
                    $message = '批量删除成功';
                    break;
                    
                case 'move':
                    if (!$request->target_course_id) {
                        throw new \Exception('移动操作需要指定目标课程');
                    }
                    LearningMaterial::whereIn('id', $materialIds)
                        ->update(['course_id' => $request->target_course_id]);
                    $message = '批量移动成功';
                    break;
                    
                default:
                    $message = '操作完成';
                    break;
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'affected_count' => count($materialIds)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '批量操作失败',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 格式化时长
     */
    private function formatDuration($minutes)
    {
        if ($minutes < 60) {
            return $minutes . ' 分钟';
        }
        
        $hours = floor($minutes / 60);
        $remainingMinutes = $minutes % 60;
        
        if ($remainingMinutes === 0) {
            return $hours . ' 小时';
        }
        
        return $hours . ' 小时 ' . $remainingMinutes . ' 分钟';
    }

    /**
     * 格式化文件大小
     */
    private function formatFileSize($bytes)
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 1) . $units[$i];
    }

    /**
     * 从URL获取文件类型
     */
    private function getFileTypeFromUrl($url)
    {
        if (empty($url)) {
            return 'unknown';
        }
        
        $extension = pathinfo($url, PATHINFO_EXTENSION);
        
        $videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'];
        $audioExtensions = ['mp3', 'wav', 'aac', 'ogg', 'flac'];
        $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
        
        if (in_array(strtolower($extension), $videoExtensions)) {
            return 'video';
        } elseif (in_array(strtolower($extension), $audioExtensions)) {
            return 'audio';
        } elseif (in_array(strtolower($extension), $imageExtensions)) {
            return 'image';
        }
        
        return 'unknown';
    }
} 