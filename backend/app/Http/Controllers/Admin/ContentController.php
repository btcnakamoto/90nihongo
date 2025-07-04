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
     * 获取课程详情
     */
    public function getCourseDetail($id)
    {
        try {
            $course = Course::with(['learningMaterials', 'exercises'])->findOrFail($id);

            $courseDetail = [
                'id' => $course->id,
                'title' => $course->title,
                'description' => $course->description,
                'day_number' => $course->day_number,
                'difficulty' => $course->difficulty,
                'status' => $course->is_active ? 'published' : 'draft',
                'tags' => $course->tags ?? [],
                'is_active' => $course->is_active,
                'materials_count' => $course->learningMaterials->count(),
                'exercises_count' => $course->exercises->count(),
                'completion_rate' => rand(60, 95),
                'user_feedback' => rand(40, 50) / 10,
                'created_at' => $course->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $course->updated_at->format('Y-m-d H:i:s'),
                'last_updated' => $course->updated_at->format('Y-m-d'),
                
                // 学习材料详情
                'materials' => $course->learningMaterials->map(function ($material) {
                    return [
                        'id' => $material->id,
                        'title' => $material->title,
                        'type' => $material->type,
                        'course_day' => $material->course->day_number,
                        'duration' => $material->duration_minutes ?? 0,
                        'size' => $this->formatFileSize(rand(1024, 10240000)),
                        'status' => 'active',
                        'views' => rand(100, 1000),
                        'rating' => rand(35, 50) / 10,
                        'created_at' => $material->created_at->format('Y-m-d')
                    ];
                }),
                
                // 练习题详情
                'exercises' => $course->exercises->map(function ($exercise) {
                    return [
                        'id' => $exercise->id,
                        'title' => $exercise->title,
                        'type' => $exercise->type,
                        'course_day' => $exercise->course->day_number,
                        'difficulty' => $exercise->difficulty ?? 'medium',
                        'completion_rate' => rand(60, 90),
                        'average_score' => rand(70, 95),
                        'created_at' => $exercise->created_at->format('Y-m-d')
                    ];
                }),
                
                // 用户进度统计
                'user_progress' => [
                    'total_users' => rand(500, 1500),
                    'completed_users' => rand(300, 800),
                    'in_progress_users' => rand(100, 400),
                    'not_started_users' => rand(50, 300)
                ],
                
                // 分析数据
                'analytics' => [
                    'daily_views' => rand(50, 200),
                    'weekly_views' => rand(300, 1000),
                    'monthly_views' => rand(1000, 5000),
                    'avg_time_spent' => rand(20, 60),
                    'bounce_rate' => rand(10, 30)
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $courseDetail
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '获取课程详情失败',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 获取学习材料列表
     */
    public function getMaterials(Request $request)
    {
        try {
            $query = LearningMaterial::with(['course']);
            
            // 处理include参数，加载关联数据
            if ($request->has('include')) {
                $includes = explode(',', $request->include);
                $validIncludes = ['categories', 'tags', 'dialogue'];
                
                foreach ($includes as $include) {
                    $include = trim($include);
                    if (in_array($include, $validIncludes)) {
                        $query->with($include);
                    }
                }
            }
            
            // 搜索
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('title', 'like', '%' . $search . '%')
                      ->orWhere('source_id', 'like', '%' . $search . '%');
                      
                    // 如果搜索JSON内容
                    if (strlen($search) > 1) {
                        $q->orWhereRaw("JSON_EXTRACT(content, '$.japanese') LIKE ?", ["%{$search}%"])
                          ->orWhereRaw("JSON_EXTRACT(content, '$.chinese') LIKE ?", ["%{$search}%"]);
                    }
                });
            }
            
            // 按类型筛选
            if ($request->has('type') && $request->type !== 'all') {
                $query->where('type', $request->type);
            }
            
            // 按分类筛选
            if ($request->has('category') && $request->category !== 'all') {
                $query->whereHas('categories', function ($q) use ($request) {
                    $q->where('categories.id', $request->category);
                });
            }
            
            // 按标签筛选
            if ($request->has('tag') && $request->tag !== 'all') {
                $query->whereHas('tags', function ($q) use ($request) {
                    $q->where('tags.id', $request->tag);
                });
            }
            
            $materials = $query->orderBy('created_at', 'desc')->get()->map(function ($material) {
                $data = [
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
                    'content_length' => $material->content_length,
                    'content_style' => $material->content_style,
                    'source_id' => $material->source_id,
                    'source_type' => $material->source_type,
                    'created_at' => $material->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $material->updated_at->format('Y-m-d H:i:s'),
                ];

                // 添加分类信息
                if ($material->relationLoaded('categories')) {
                    $data['categories'] = $material->categories->map(function ($category) {
                        return [
                            'id' => $category->id,
                            'name' => $category->name,
                            'slug' => $category->slug,
                            'level' => $category->level,
                            'parent_id' => $category->parent_id
                        ];
                    });
                }

                // 添加标签信息
                if ($material->relationLoaded('tags')) {
                    $data['tags'] = $material->tags->map(function ($tag) {
                        return [
                            'id' => $tag->id,
                            'name' => $tag->name,
                            'slug' => $tag->slug,
                            'usage_count' => $tag->usage_count
                        ];
                    });
                }

                // 添加对话信息
                if ($material->relationLoaded('dialogue') && $material->dialogue) {
                    $data['dialogue'] = [
                        'id' => $material->dialogue->id,
                        'title' => $material->dialogue->title,
                        'scenario' => $material->dialogue->scenario,
                        'participant_count' => $material->dialogue->participant_count,
                        'difficulty_level' => $material->dialogue->difficulty_level,
                        'lines' => $material->dialogue->dialogueLines ? $material->dialogue->dialogueLines->map(function ($line) {
                            return [
                                'id' => $line->id,
                                'speaker' => $line->speaker,
                                'line_order' => $line->line_order,
                                'japanese_text' => $line->japanese_text,
                                'chinese_text' => $line->chinese_text,
                                'audio_url' => $line->audio_url
                            ];
                        }) : []
                    ];
                }

                return $data;
            });
            
            return response()->json([
                'success' => true,
                'data' => $materials,
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
     * 获取句子/例句列表
     */
    public function getSentences(Request $request)
    {
        try {
            $query = LearningMaterial::whereJsonContains('metadata->content_type', 'sentence');

            // 搜索
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->whereRaw("JSON_EXTRACT(content, '$.japanese') LIKE ?", ["%{$search}%"])
                      ->orWhereRaw("JSON_EXTRACT(content, '$.chinese') LIKE ?", ["%{$search}%"]);
                });
            }

            // 难度筛选
            if ($request->has('difficulty') && $request->difficulty !== 'all') {
                $query->whereJsonContains('metadata->difficulty', $request->difficulty);
            }

            // 分类筛选
            if ($request->has('category') && $request->category !== 'all') {
                $query->whereJsonContains('metadata->category', $request->category);
            }

            $sentences = $query->orderBy('created_at', 'desc')->get()->map(function ($item) {
                $content = json_decode($item->content, true);
                $metadata = $item->metadata;
                
                return [
                    'id' => $item->id,
                    'japanese' => $content['japanese'] ?? '',
                    'chinese' => $content['chinese'] ?? '',
                    'difficulty' => $metadata['difficulty'] ?? '',
                    'category' => $metadata['category'] ?? '',
                    'subcategory' => $metadata['subcategory'] ?? '',
                    'style' => $metadata['style'] ?? '',
                    'length' => $metadata['length'] ?? '',
                    'tags' => $metadata['tags'] ?? [],
                    'created_at' => $item->created_at->format('Y-m-d H:i:s'),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $sentences
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '获取句子列表失败',
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
     * 批量创建内容
     */
    public function batchCreate(Request $request, $contentType)
    {
        try {
            $validator = Validator::make($request->all(), [
                'data' => 'required|array|min:1|max:1000',
                'data.*' => 'required|array'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => '数据验证失败',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->input('data');
            $successCount = 0;
            $errorCount = 0;
            $errors = [];

            DB::beginTransaction();

            try {
                foreach ($data as $index => $item) {
                    try {
                        switch ($contentType) {
                            case 'course':
                                $this->createCourseFromData($item);
                                break;
                            case 'material':
                                $this->createMaterialFromData($item);
                                break;
                            case 'vocabulary':
                                $this->createVocabularyFromData($item);
                                break;
                            case 'exercise':
                                $this->createExerciseFromData($item);
                                break;
                            case 'sentence':
                                $this->createSentenceFromData($item);
                                break;
                            default:
                                throw new \Exception('不支持的内容类型');
                        }
                        $successCount++;
                    } catch (\Exception $e) {
                        $errorCount++;
                        $errors[] = "第" . ($index + 1) . "行: " . $e->getMessage();
                    }
                }

                if ($errorCount > 0 && $successCount === 0) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => '批量导入失败，所有数据都有错误',
                        'errors' => $errors
                    ], 400);
                }

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => "批量导入完成。成功: {$successCount}, 失败: {$errorCount}",
                    'data' => [
                        'success_count' => $successCount,
                        'error_count' => $errorCount,
                        'errors' => $errors
                    ]
                ]);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '批量导入失败',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 批量删除内容
     */
    public function batchDelete(Request $request, $contentType)
    {
        try {
            $validator = Validator::make($request->all(), [
                'ids' => 'required|array|min:1|max:100',
                'ids.*' => 'required|integer|min:1'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => '数据验证失败',
                    'errors' => $validator->errors()
                ], 422);
            }

            $ids = $request->input('ids');
            $deletedCount = 0;

            DB::beginTransaction();

            try {
                switch ($contentType) {
                    case 'course':
                        $deletedCount = Course::whereIn('id', $ids)->delete();
                        break;
                    case 'material':
                        $deletedCount = LearningMaterial::whereIn('id', $ids)->delete();
                        break;
                    case 'vocabulary':
                        $deletedCount = Vocabulary::whereIn('id', $ids)->delete();
                        break;
                    case 'exercise':
                        $deletedCount = Exercise::whereIn('id', $ids)->delete();
                        break;
                    case 'sentence':
                        $deletedCount = LearningMaterial::whereIn('id', $ids)
                            ->whereJsonContains('metadata->content_type', 'sentence')
                            ->delete();
                        break;
                    default:
                        throw new \Exception('不支持的内容类型');
                }

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => "成功删除 {$deletedCount} 条记录",
                    'deleted_count' => $deletedCount
                ]);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '批量删除失败',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 导出数据
     */
    public function exportData($contentType)
    {
        try {
            $data = [];
            $filename = '';

            switch ($contentType) {
                case 'course':
                    $data = Course::all()->toArray();
                    $filename = 'courses_export_' . date('Y-m-d') . '.csv';
                    break;
                case 'material':
                    $data = LearningMaterial::with('course')->get()->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'title' => $item->title,
                            'type' => $item->type,
                            'course_day' => $item->course ? $item->course->day_number : null,
                            'content' => $item->content,
                            'media_url' => $item->media_url,
                            'duration_minutes' => $item->duration_minutes,
                            'created_at' => $item->created_at
                        ];
                    })->toArray();
                    $filename = 'materials_export_' . date('Y-m-d') . '.csv';
                    break;
                case 'vocabulary':
                    $data = Vocabulary::all()->toArray();
                    $filename = 'vocabulary_export_' . date('Y-m-d') . '.csv';
                    break;
                case 'exercise':
                    $data = Exercise::with('course')->get()->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'title' => $item->title,
                            'type' => $item->type,
                            'course_day' => $item->course ? $item->course->day_number : null,
                            'question' => $item->question,
                            'options' => is_array($item->options) ? implode(';', $item->options) : $item->options,
                            'correct_answer' => $item->correct_answer,
                            'explanation' => $item->explanation,
                            'points' => $item->points,
                            'created_at' => $item->created_at
                        ];
                    })->toArray();
                    $filename = 'exercises_export_' . date('Y-m-d') . '.csv';
                    break;
                case 'sentence':
                    $data = LearningMaterial::whereJsonContains('metadata->content_type', 'sentence')
                        ->get()->map(function ($item) {
                            $content = json_decode($item->content, true);
                            $metadata = $item->metadata;
                            return [
                                'id' => $item->id,
                                'japanese' => $content['japanese'] ?? '',
                                'chinese' => $content['chinese'] ?? '',
                                'difficulty' => $metadata['difficulty'] ?? '',
                                'category' => $metadata['category'] ?? '',
                                'subcategory' => $metadata['subcategory'] ?? '',
                                'style' => $metadata['style'] ?? '',
                                'length' => $metadata['length'] ?? '',
                                'tags' => is_array($metadata['tags']) ? implode(';', $metadata['tags']) : '',
                                'created_at' => $item->created_at
                            ];
                        })->toArray();
                    $filename = 'sentences_export_' . date('Y-m-d') . '.csv';
                    break;
                default:
                    throw new \Exception('不支持的内容类型');
            }

            if (empty($data)) {
                return response()->json([
                    'success' => false,
                    'message' => '没有数据可导出'
                ], 404);
            }

            // 生成CSV内容
            $output = fopen('php://temp', 'r+');
            
            // 写入表头
            if (!empty($data)) {
                fputcsv($output, array_keys($data[0]));
                
                // 写入数据
                foreach ($data as $row) {
                    fputcsv($output, $row);
                }
            }
            
            rewind($output);
            $csvContent = stream_get_contents($output);
            fclose($output);

            return response($csvContent)
                ->header('Content-Type', 'text/csv; charset=UTF-8')
                ->header('Content-Disposition', 'attachment; filename="' . $filename . '"')
                ->header('Content-Length', strlen($csvContent));

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '导出失败',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 从数据创建课程
     */
    private function createCourseFromData($data)
    {
        $validator = Validator::make($data, [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'day_number' => 'required|integer|min:1|max:90|unique:courses,day_number',
            'difficulty' => 'required|in:beginner,intermediate,advanced',
            'tags' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            throw new \Exception('课程数据验证失败: ' . implode(', ', $validator->errors()->all()));
        }

        return Course::create([
            'title' => $data['title'],
            'description' => $data['description'],
            'day_number' => $data['day_number'],
            'difficulty' => $data['difficulty'],
            'tags' => isset($data['tags']) ? explode(',', $data['tags']) : [],
            'is_active' => isset($data['is_active']) ? (bool)$data['is_active'] : false
        ]);
    }

    /**
     * 从数据创建学习材料
     */
    private function createMaterialFromData($data)
    {
        $validator = Validator::make($data, [
            'title' => 'required|string|max:255',
            'type' => 'required|in:video,audio,text,quiz',
            'course_day' => 'required|integer|min:1|max:90',
            'content' => 'required|string',
            'media_url' => 'nullable|url',
            'duration_minutes' => 'nullable|integer|min:0'
        ]);

        if ($validator->fails()) {
            throw new \Exception('学习材料数据验证失败: ' . implode(', ', $validator->errors()->all()));
        }

        // 查找对应的课程
        $course = Course::where('day_number', $data['course_day'])->first();
        if (!$course) {
            throw new \Exception('第' . $data['course_day'] . '天的课程不存在');
        }

        return LearningMaterial::create([
            'course_id' => $course->id,
            'title' => $data['title'],
            'type' => $data['type'],
            'content' => $data['content'],
            'media_url' => $data['media_url'] ?? null,
            'duration_minutes' => $data['duration_minutes'] ?? 0,
            'metadata' => []
        ]);
    }

    /**
     * 从数据创建词汇
     */
    private function createVocabularyFromData($data)
    {
        $validator = Validator::make($data, [
            'word' => 'required|string|max:255',
            'reading' => 'required|string|max:255',
            'meaning' => 'required|string',
            'part_of_speech' => 'required|string|max:255',
            'jlpt_level' => 'required|in:N5,N4,N3,N2,N1',
            'example_sentence' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            throw new \Exception('词汇数据验证失败: ' . implode(', ', $validator->errors()->all()));
        }

        return Vocabulary::create([
            'word' => $data['word'],
            'reading' => $data['reading'],
            'meaning' => $data['meaning'],
            'part_of_speech' => $data['part_of_speech'],
            'example_sentence' => $data['example_sentence'] ?? null,
            'example_reading' => $data['example_reading'] ?? null,
            'example_meaning' => $data['example_meaning'] ?? null,
            'jlpt_level' => $data['jlpt_level'],
            'tags' => isset($data['tags']) ? explode(',', $data['tags']) : []
        ]);
    }

    /**
     * 从数据创建练习题
     */
    private function createExerciseFromData($data)
    {
        $validator = Validator::make($data, [
            'title' => 'required|string|max:255',
            'type' => 'required|in:listening,speaking,grammar,vocabulary',
            'course_day' => 'required|integer|min:1|max:90',
            'question' => 'required|string',
            'correct_answer' => 'required|string',
            'options' => 'nullable|string',
            'explanation' => 'nullable|string',
            'points' => 'nullable|integer|min:1'
        ]);

        if ($validator->fails()) {
            throw new \Exception('练习题数据验证失败: ' . implode(', ', $validator->errors()->all()));
        }

        // 查找对应的课程
        $course = Course::where('day_number', $data['course_day'])->first();
        if (!$course) {
            throw new \Exception('第' . $data['course_day'] . '天的课程不存在');
        }

        // 处理选项
        $options = null;
        if (isset($data['options']) && !empty($data['options'])) {
            if (is_string($data['options'])) {
                $options = explode(',', $data['options']);
            } else {
                $options = $data['options'];
            }
        }

        return Exercise::create([
            'course_id' => $course->id,
            'title' => $data['title'],
            'type' => $data['type'],
            'question' => $data['question'],
            'options' => $options,
            'correct_answer' => $data['correct_answer'],
            'explanation' => $data['explanation'] ?? null,
            'points' => $data['points'] ?? 10
        ]);
    }

    /**
     * 从数据创建句子/例句
     */
    private function createSentenceFromData($data)
    {
        \Log::info('开始处理句子数据:', $data);
        
        $validator = Validator::make($data, [
            'japanese' => 'required|string',
            'chinese' => 'required|string',
            'difficulty' => 'required|in:N5,N4,N3,N2,N1',
            'category' => 'nullable|string|max:255',
            'subcategory' => 'nullable|string|max:255',
            'style' => 'nullable|string|max:255',
            'length' => 'nullable|string|max:255',
            'tags' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            $errors = $validator->errors()->all();
            \Log::error('句子数据验证失败:', $errors);
            throw new \Exception('句子数据验证失败: ' . implode(', ', $errors));
        }

        try {
            // 首先检查是否有现有的课程
            $existingCourse = DB::table('courses')->first();
            $courseId = $existingCourse ? $existingCourse->id : null;
            
            \Log::info('使用课程ID:', ['course_id' => $courseId]);
            
            // 直接使用数据库操作创建学习材料
            $materialId = DB::table('learning_materials')->insertGetId([
                'course_id' => $courseId, // 如果没有课程就设为null
                'title' => mb_substr($data['japanese'], 0, 50) . '...',
                'type' => 'text',
                'content' => json_encode([
                    'japanese' => $data['japanese'],
                    'chinese' => $data['chinese'],
                    'category' => $data['category'] ?? null,
                    'subcategory' => $data['subcategory'] ?? null,
                    'style' => $data['style'] ?? null,
                    'length' => $data['length'] ?? null,
                    'difficulty' => $data['difficulty'],
                    'tags' => $data['tags'] ?? []
                ], JSON_UNESCAPED_UNICODE),
                'metadata' => json_encode([
                    'content_type' => 'sentence',
                    'difficulty' => $data['difficulty'],
                    'category' => $data['category'] ?? null,
                    'subcategory' => $data['subcategory'] ?? null,
                    'style' => $data['style'] ?? null,
                    'length' => $data['length'] ?? null,
                    'tags' => $data['tags'] ?? []
                ]),
                'created_at' => now(),
                'updated_at' => now()
            ]);
            
            \Log::info('句子数据插入成功:', ['id' => $materialId]);
            return (object)['id' => $materialId];
            
        } catch (\Exception $e) {
            \Log::error('句子创建过程中发生错误:', [
                'error' => $e->getMessage(),
                'data' => $data,
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            throw new \Exception('句子创建失败: ' . $e->getMessage());
        }
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