<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Course;
use App\Models\LearningMaterial;
use App\Models\Vocabulary;
use App\Models\Exercise;
use Carbon\Carbon;

class ContentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 创建90天课程
        $courses = [
            [
                'title' => '生活基础：打招呼与自我介绍',
                'description' => '学习日常打招呼用语和基础的自我介绍方式',
                'day_number' => 1,
                'difficulty' => 'beginner',
                'tags' => ['日常对话', '基础', '打招呼'],
                'is_active' => true,
            ],
            [
                'title' => '餐厅点餐：实用对话练习',
                'description' => '掌握在餐厅点餐的基本日语表达',
                'day_number' => 2,
                'difficulty' => 'beginner',
                'tags' => ['餐厅', '点餐', '实用对话'],
                'is_active' => true,
            ],
            [
                'title' => '交通出行：问路与乘车',
                'description' => '学习问路和使用公共交通的日语表达',
                'day_number' => 3,
                'difficulty' => 'beginner',
                'tags' => ['交通', '问路', '出行'],
                'is_active' => false,
            ],
            [
                'title' => '购物场景：商店对话',
                'description' => '在商店购物时的常用日语对话',
                'day_number' => 4,
                'difficulty' => 'intermediate',
                'tags' => ['购物', '商店', '对话'],
                'is_active' => false,
            ],
            [
                'title' => '职场基础：同事交流',
                'description' => '职场环境中与同事交流的日语表达',
                'day_number' => 15,
                'difficulty' => 'intermediate',
                'tags' => ['职场', '同事', '商务日语'],
                'is_active' => true,
            ],
        ];

        foreach ($courses as $courseData) {
            $course = Course::create($courseData);

            // 为每个课程创建学习材料
            $materials = [
                [
                    'title' => $courseData['title'] . ' - 视频教程',
                    'type' => 'video',
                    'content' => '视频教学内容',
                    'media_url' => 'https://example.com/video/' . $course->id,
                    'duration_minutes' => rand(5, 15),
                    'metadata' => ['resolution' => '1080p', 'format' => 'mp4'],
                ],
                [
                    'title' => $courseData['title'] . ' - 音频练习',
                    'type' => 'audio',
                    'content' => '音频练习内容',
                    'media_url' => 'https://example.com/audio/' . $course->id,
                    'duration_minutes' => rand(3, 8),
                    'metadata' => ['format' => 'mp3', 'bitrate' => '128kbps'],
                ],
                [
                    'title' => $courseData['title'] . ' - 课文资料',
                    'type' => 'text',
                    'content' => '课文学习资料内容...',
                    'duration_minutes' => rand(10, 20),
                    'metadata' => ['word_count' => rand(500, 1000)],
                ],
            ];

            foreach ($materials as $materialData) {
                $materialData['course_id'] = $course->id;
                LearningMaterial::create($materialData);
            }

            // 为每个课程创建练习题
            $exercises = [
                [
                    'title' => $courseData['title'] . ' - 听力测试',
                    'type' => 'listening',
                    'question' => '请听音频并选择正确答案',
                    'options' => ['选项A', '选项B', '选项C', '选项D'],
                    'correct_answer' => '选项A',
                    'explanation' => '正确答案解释...',
                    'points' => 10,
                ],
                [
                    'title' => $courseData['title'] . ' - 口语练习',
                    'type' => 'speaking',
                    'question' => '请用日语进行自我介绍',
                    'correct_answer' => '示例答案',
                    'explanation' => '口语练习要点...',
                    'points' => 15,
                ],
                [
                    'title' => $courseData['title'] . ' - 语法填空',
                    'type' => 'grammar',
                    'question' => '请填入正确的助词',
                    'options' => ['は', 'を', 'に', 'で'],
                    'correct_answer' => 'は',
                    'explanation' => '语法解释...',
                    'points' => 10,
                ],
            ];

            foreach ($exercises as $exerciseData) {
                $exerciseData['course_id'] = $course->id;
                Exercise::create($exerciseData);
            }
        }

        // 创建词汇数据
        $vocabularies = [
            [
                'word' => 'こんにちは',
                'reading' => 'konnichiwa',
                'meaning' => '你好（白天问候语）',
                'part_of_speech' => '感叹词',
                'example_sentence' => 'こんにちは、元気ですか？',
                'example_reading' => 'konnichiwa, genki desu ka?',
                'example_meaning' => '你好，身体好吗？',
                'jlpt_level' => 'N5',
                'tags' => ['打招呼', '基础', '日常用语'],
            ],
            [
                'word' => 'ありがとう',
                'reading' => 'arigatou',
                'meaning' => '谢谢',
                'part_of_speech' => '感叹词',
                'example_sentence' => '手伝ってくれて、ありがとう。',
                'example_reading' => 'tetsudatte kurete, arigatou.',
                'example_meaning' => '谢谢你帮忙。',
                'jlpt_level' => 'N5',
                'tags' => ['感谢', '基础', '礼貌用语'],
            ],
            [
                'word' => '会社',
                'reading' => 'kaisha',
                'meaning' => '公司',
                'part_of_speech' => '名词',
                'example_sentence' => '私の会社は東京にあります。',
                'example_reading' => 'watashi no kaisha wa tōkyō ni arimasu.',
                'example_meaning' => '我的公司在东京。',
                'jlpt_level' => 'N4',
                'tags' => ['工作', '商务', '场所'],
            ],
            [
                'word' => '美味しい',
                'reading' => 'oishii',
                'meaning' => '好吃的，美味的',
                'part_of_speech' => 'い形容词',
                'example_sentence' => 'この料理はとても美味しいです。',
                'example_reading' => 'kono ryōri wa totemo oishii desu.',
                'example_meaning' => '这道菜非常好吃。',
                'jlpt_level' => 'N5',
                'tags' => ['食物', '形容词', '味道'],
            ],
            [
                'word' => '勉強',
                'reading' => 'benkyō',
                'meaning' => '学习',
                'part_of_speech' => '名词/动词',
                'example_sentence' => '毎日日本語を勉強しています。',
                'example_reading' => 'mainichi nihongo wo benkyō shite imasu.',
                'example_meaning' => '我每天都在学习日语。',
                'jlpt_level' => 'N4',
                'tags' => ['学习', '教育', '动作'],
            ],
        ];

        foreach ($vocabularies as $vocabData) {
            Vocabulary::create($vocabData);
        }

        // 为第16-30天创建更多课程（中级难度）
        for ($day = 16; $day <= 30; $day++) {
            $course = Course::create([
                'title' => "第{$day}天：中级日语课程",
                'description' => "第{$day}天的中级日语学习内容",
                'day_number' => $day,
                'difficulty' => 'intermediate',
                'tags' => ['中级', '综合'],
                'is_active' => $day <= 25, // 前25天设为已发布
            ]);

            // 为每个课程创建材料
            LearningMaterial::create([
                'course_id' => $course->id,
                'title' => "第{$day}天 - 综合练习",
                'type' => ['video', 'audio', 'text', 'quiz'][rand(0, 3)],
                'content' => "第{$day}天的学习内容",
                'duration_minutes' => rand(10, 25),
                'metadata' => ['level' => 'intermediate'],
            ]);
        }

        // 为第31-45天创建高级课程
        for ($day = 31; $day <= 45; $day++) {
            $course = Course::create([
                'title' => "第{$day}天：高级日语课程",
                'description' => "第{$day}天的高级日语学习内容",
                'day_number' => $day,
                'difficulty' => 'advanced',
                'tags' => ['高级', '挑战'],
                'is_active' => false, // 设为草稿状态
            ]);
        }
    }
}
