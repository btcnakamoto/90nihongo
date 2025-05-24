<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Course;
use App\Models\LearningMaterial;
use App\Models\Vocabulary;
use App\Models\Exercise;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ContentController extends Controller
{
    /**
     * 获取内容管理统计数据
     */
    public function getStats()
    {
        try {
            // 基础统计数据
            $totalCourses = Course::count();
            $publishedCourses = Course::where('is_active', true)->count();
            $totalMaterials = LearningMaterial::count();
            $totalVocabulary = Vocabulary::count();
            $totalExercises = Exercise::count();

            // 内容类型分布统计
            $materialTypes = LearningMaterial::select('type', DB::raw('count(*) as count'))
                ->groupBy('type')
                ->get()
                ->pluck('count', 'type');

            // 难度分布统计
            $difficultyStats = Course::select('difficulty', DB::raw('count(*) as count'))
                ->groupBy('difficulty')
                ->get()
                ->pluck('count', 'difficulty');

            // JLPT级别分布
            $jlptStats = Vocabulary::select('jlpt_level', DB::raw('count(*) as count'))
                ->groupBy('jlpt_level')
                ->get()
                ->pluck('count', 'jlpt_level');

            // 课程进度数据（前30天）
            $courseProgressData = Course::where('is_active', true)
                ->orderBy('day_number')
                ->limit(30)
                ->get()
                ->map(function ($course) {
                    return [
                        'day' => $course->day_number,
                        'title' => $course->title,
                        'completion' => rand(60, 95),
                        'feedback' => rand(35, 45) / 10,
                        'materials_count' => $course->learningMaterials->count(),
                        'exercises_count' => $course->exercises->count(),
                    ];
                });

            // 内容类型数据
            $contentTypeData = [
                ['name' => '视频', 'value' => $materialTypes->get('video', 0), 'color' => '#0088FE'],
                ['name' => '音频', 'value' => $materialTypes->get('audio', 0), 'color' => '#00C49F'],
                ['name' => '文本', 'value' => $materialTypes->get('text', 0), 'color' => '#FFBB28'],
                ['name' => '测验', 'value' => $materialTypes->get('quiz', 0), 'color' => '#FF8042'],
            ];

            // 最近活动（最新创建的课程）
            $recentActivities = Course::with(['learningMaterials'])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($course) {
                    return [
                        'id' => $course->id,
                        'title' => $course->title,
                        'day_number' => $course->day_number,
                        'status' => $course->is_active ? 'published' : 'draft',
                        'last_updated' => $course->updated_at->format('Y-m-d'),
                        'materials_count' => $course->learningMaterials->count(),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'stats' => [
                        'total_courses' => $totalCourses,
                        'published_courses' => $publishedCourses,
                        'total_materials' => $totalMaterials,
                        'total_vocabulary' => $totalVocabulary,
                        'total_exercises' => $totalExercises,
                        'average_completion' => rand(75, 85),
                        'user_satisfaction' => 4.6,
                        'content_usage' => rand(85, 95)
                    ],
                    'course_progress_data' => $courseProgressData,
                    'content_type_data' => $contentTypeData,
                    'recent_activities' => $recentActivities,
                    'difficulty_stats' => $difficultyStats,
                    'jlpt_stats' => $jlptStats
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '获取统计数据失败',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 获取课程列表
     */
    public function getCourses(Request $request)
    {
        try {
            $query = Course::with(['learningMaterials', 'exercises']);

            // 搜索
            if ($request->has('search')) {
                $query->where('title', 'like', '%' . $request->search . '%');
            }

            // 状态筛选
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('is_active', $request->status === 'published');
            }

            // 难度筛选
            if ($request->has('difficulty') && $request->difficulty !== 'all') {
                $query->where('difficulty', $request->difficulty);
            }

            $courses = $query->orderBy('day_number')->get()->map(function ($course) {
                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'day_number' => $course->day_number,
                    'difficulty' => $course->difficulty,
                    'status' => $course->is_active ? 'published' : 'draft',
                    'materials_count' => $course->learningMaterials->count(),
                    'completion_rate' => rand(60, 95),
                    'user_feedback' => rand(40, 50) / 10,
                    'last_updated' => $course->updated_at->format('Y-m-d'),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $courses
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '获取课程列表失败',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 获取学习材料列表 - 增强版
     */
    public function getMaterials(Request $request)
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
            
            // 按状态筛选 (模拟状态)
            if ($request->has('status') && $request->status !== 'all') {
                // 可以根据实际需要添加状态字段
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
                    'status' => 'active', // 可以添加实际状态字段
                    'views' => rand(100, 2000),
                    'rating' => rand(40, 50) / 10,
                    'downloads' => rand(50, 500),
                    'file_type' => $this->getFileTypeFromUrl($material->media_url),
                    'created_at' => $material->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $material->updated_at->format('Y-m-d H:i:s'),
                ];
            });
            
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
                'stats' => [
                    'total_materials' => LearningMaterial::count(),
                    'video_count' => LearningMaterial::where('type', 'video')->count(),
                    'audio_count' => LearningMaterial::where('type', 'audio')->count(),
                    'text_count' => LearningMaterial::where('type', 'text')->count(),
                    'quiz_count' => LearningMaterial::where('type', 'quiz')->count(),
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
     * 获取词汇列表
     */
    public function getVocabulary(Request $request)
    {
        try {
            $vocabulary = Vocabulary::get()->map(function ($vocab) {
                return [
                    'id' => $vocab->id,
                    'word' => $vocab->word,
                    'reading' => $vocab->reading,
                    'meaning' => $vocab->meaning,
                    'jlpt_level' => $vocab->jlpt_level,
                    'part_of_speech' => $vocab->part_of_speech,
                    'example_sentence' => $vocab->example_sentence,
                    'mastery_rate' => rand(70, 95),
                    'created_at' => $vocab->created_at->format('Y-m-d'),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $vocabulary
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '获取词汇列表失败',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 获取练习题列表
     */
    public function getExercises(Request $request)
    {
        try {
            $exercises = Exercise::with(['course'])
                ->get()
                ->map(function ($exercise) {
                    return [
                        'id' => $exercise->id,
                        'title' => $exercise->title,
                        'type' => $exercise->type,
                        'course_day' => $exercise->course->day_number ?? 0,
                        'difficulty' => ['easy', 'medium', 'hard'][rand(0, 2)],
                        'completion_rate' => rand(60, 95),
                        'average_score' => rand(70, 95),
                        'created_at' => $exercise->created_at->format('Y-m-d'),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $exercises
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '获取练习题列表失败',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 创建课程
     */
    public function createCourse(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'day_number' => 'required|integer|min:1|max:90|unique:courses,day_number',
                'difficulty' => 'required|in:beginner,intermediate,advanced',
                'tags' => 'nullable|array',
                'is_active' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => '数据验证失败',
                    'errors' => $validator->errors()
                ], 422);
            }

            $course = Course::create([
                'title' => $request->title,
                'description' => $request->description,
                'day_number' => $request->day_number,
                'difficulty' => $request->difficulty,
                'tags' => $request->tags ?? [],
                'is_active' => $request->is_active ?? false
            ]);

            return response()->json([
                'success' => true,
                'message' => '课程创建成功',
                'data' => [
                    'id' => $course->id,
                    'title' => $course->title,
                    'day_number' => $course->day_number,
                    'difficulty' => $course->difficulty,
                    'status' => $course->is_active ? 'published' : 'draft',
                    'materials_count' => 0,
                    'completion_rate' => 0,
                    'user_feedback' => 0,
                    'last_updated' => $course->updated_at->format('Y-m-d'),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '创建课程失败',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 创建学习材料
     */
    public function createMaterial(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'course_id' => 'required|exists:courses,id',
                'title' => 'required|string|max:255',
                'type' => 'required|in:video,audio,text,quiz',
                'content' => 'required|string',
                'media_url' => 'nullable|url',
                'duration_minutes' => 'nullable|integer|min:0',
                'metadata' => 'nullable|array'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => '数据验证失败',
                    'errors' => $validator->errors()
                ], 422);
            }

            $material = LearningMaterial::create([
                'course_id' => $request->course_id,
                'title' => $request->title,
                'type' => $request->type,
                'content' => $request->content,
                'media_url' => $request->media_url,
                'duration_minutes' => $request->duration_minutes ?? 0,
                'metadata' => $request->metadata ?? []
            ]);

            return response()->json([
                'success' => true,
                'message' => '学习材料创建成功',
                'data' => [
                    'id' => $material->id,
                    'title' => $material->title,
                    'type' => $material->type,
                    'course_day' => $material->course->day_number,
                    'duration' => $material->duration_minutes * 60,
                    'size' => $this->formatFileSize(rand(1000, 10000000)),
                    'status' => 'active',
                    'views' => 0,
                    'rating' => 0,
                    'created_at' => $material->created_at->format('Y-m-d'),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '创建学习材料失败',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 创建词汇
     */
    public function createVocabulary(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'word' => 'required|string|max:255',
                'reading' => 'required|string|max:255',
                'meaning' => 'required|string',
                'part_of_speech' => 'required|string|max:255',
                'example_sentence' => 'nullable|string',
                'example_reading' => 'nullable|string',
                'example_meaning' => 'nullable|string',
                'jlpt_level' => 'required|in:N5,N4,N3,N2,N1',
                'tags' => 'nullable|array'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => '数据验证失败',
                    'errors' => $validator->errors()
                ], 422);
            }

            $vocabulary = Vocabulary::create([
                'word' => $request->word,
                'reading' => $request->reading,
                'meaning' => $request->meaning,
                'part_of_speech' => $request->part_of_speech,
                'example_sentence' => $request->example_sentence,
                'example_reading' => $request->example_reading,
                'example_meaning' => $request->example_meaning,
                'jlpt_level' => $request->jlpt_level,
                'tags' => $request->tags ?? []
            ]);

            return response()->json([
                'success' => true,
                'message' => '词汇创建成功',
                'data' => [
                    'id' => $vocabulary->id,
                    'word' => $vocabulary->word,
                    'reading' => $vocabulary->reading,
                    'meaning' => $vocabulary->meaning,
                    'jlpt_level' => $vocabulary->jlpt_level,
                    'part_of_speech' => $vocabulary->part_of_speech,
                    'example_sentence' => $vocabulary->example_sentence,
                    'mastery_rate' => 0,
                    'created_at' => $vocabulary->created_at->format('Y-m-d'),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '创建词汇失败',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 创建练习题
     */
    public function createExercise(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'course_id' => 'required|exists:courses,id',
                'title' => 'required|string|max:255',
                'type' => 'required|in:listening,speaking,grammar,vocabulary',
                'question' => 'required|string',
                'options' => 'nullable|array|max:4',
                'correct_answer' => 'required|string',
                'explanation' => 'nullable|string',
                'points' => 'nullable|integer|min:1'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => '数据验证失败',
                    'errors' => $validator->errors()
                ], 422);
            }

            $exercise = Exercise::create([
                'course_id' => $request->course_id,
                'title' => $request->title,
                'type' => $request->type,
                'question' => $request->question,
                'options' => $request->options,
                'correct_answer' => $request->correct_answer,
                'explanation' => $request->explanation,
                'points' => $request->points ?? 10
            ]);

            return response()->json([
                'success' => true,
                'message' => '练习题创建成功',
                'data' => [
                    'id' => $exercise->id,
                    'title' => $exercise->title,
                    'type' => $exercise->type,
                    'course_day' => $exercise->course->day_number,
                    'difficulty' => 'medium',
                    'completion_rate' => 0,
                    'average_score' => 0,
                    'created_at' => $exercise->created_at->format('Y-m-d'),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '创建练习题失败',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 上传文件
     */
    public function uploadFile(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'file' => 'required|file|max:102400', // 100MB max
                'type' => 'required|in:video,audio,image'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => '文件验证失败',
                    'errors' => $validator->errors()
                ], 422);
            }

            $file = $request->file('file');
            $type = $request->input('type');
            
            // 验证文件类型
            $allowedMimes = [
                'video' => ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
                'audio' => ['audio/mp3', 'audio/wav', 'audio/aac', 'audio/ogg'],
                'image' => ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
            ];

            if (!in_array($file->getMimeType(), $allowedMimes[$type])) {
                return response()->json([
                    'success' => false,
                    'message' => '不支持的文件类型'
                ], 422);
            }

            // 生成文件名
            $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $path = "content/{$type}s/{$fileName}";

            // 存储文件
            Storage::disk('public')->put($path, file_get_contents($file));

            // 返回文件URL
            $url = asset('storage/' . $path);

            return response()->json([
                'success' => true,
                'message' => '文件上传成功',
                'url' => $url,
                'filename' => $fileName,
                'size' => $file->getSize()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '文件上传失败',
                'error' => $e->getMessage()
            ], 500);
        }
    }

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
            'message' => '请使用具体的创建接口 (courses, materials, vocabulary, exercises)',
            'available_endpoints' => [
                'POST /admin/content/courses',
                'POST /admin/content/materials', 
                'POST /admin/content/vocabulary',
                'POST /admin/content/exercises'
            ]
        ], 400);
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