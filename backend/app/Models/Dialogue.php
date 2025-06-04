<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Dialogue extends Model
{
    use HasFactory;

    protected $fillable = [
        'learning_material_id',
        'title',
        'scenario',
        'participant_count',
        'difficulty_level'
    ];

    protected $casts = [
        'participant_count' => 'integer'
    ];

    /**
     * 所属学习材料
     */
    public function learningMaterial()
    {
        return $this->belongsTo(LearningMaterial::class);
    }

    /**
     * 对话行（按顺序）
     */
    public function lines()
    {
        return $this->hasMany(DialogueLine::class)->orderBy('line_order');
    }

    /**
     * 获取对话的完整文本（日语）
     */
    public function getJapaneseTextAttribute()
    {
        return $this->lines->map(function ($line) {
            return $line->speaker . ': ' . $line->japanese_text;
        })->implode(' ');
    }

    /**
     * 获取对话的完整文本（中文）
     */
    public function getChineseTextAttribute()
    {
        return $this->lines->map(function ($line) {
            return $line->speaker . '：' . $line->chinese_text;
        })->implode(' ');
    }

    /**
     * 计算对话总字符数
     */
    public function getTotalCharacterCount()
    {
        return $this->lines->sum(function ($line) {
            return mb_strlen($line->japanese_text, 'UTF-8') + mb_strlen($line->chinese_text, 'UTF-8');
        });
    }

    /**
     * 获取参与者列表
     */
    public function getParticipants()
    {
        return $this->lines->pluck('speaker')->unique()->values();
    }

    /**
     * 检查是否有音频文件
     */
    public function hasAudio()
    {
        return $this->lines->whereNotNull('audio_url')->count() > 0;
    }

    /**
     * 获取音频文件列表
     */
    public function getAudioFiles()
    {
        return $this->lines->whereNotNull('audio_url')->pluck('audio_url', 'line_order');
    }

    /**
     * 作用域：按难度筛选
     */
    public function scopeByDifficulty($query, $difficulty)
    {
        return $query->where('difficulty_level', $difficulty);
    }

    /**
     * 作用域：按场景筛选
     */
    public function scopeByScenario($query, $scenario)
    {
        return $query->where('scenario', 'like', '%' . $scenario . '%');
    }

    /**
     * 作用域：按参与人数筛选
     */
    public function scopeByParticipantCount($query, $count)
    {
        return $query->where('participant_count', $count);
    }

    /**
     * 创建对话及其对话行
     */
    public static function createWithLines($dialogueData, $linesData)
    {
        $dialogue = static::create($dialogueData);
        
        foreach ($linesData as $lineData) {
            $lineData['dialogue_id'] = $dialogue->id;
            DialogueLine::create($lineData);
        }
        
        return $dialogue->load('lines');
    }

    /**
     * 从文本解析对话内容
     */
    public static function parseDialogueText($japaneseText, $chineseText)
    {
        $lines = [];
        
        // 解析日语对话
        preg_match_all('/([A-Z]):\s*([^A-Z:]+)/', $japaneseText, $japaneseMatches, PREG_SET_ORDER);
        
        // 解析中文对话
        preg_match_all('/([A-Z])：\s*([^A-Z：]+)/', $chineseText, $chineseMatches, PREG_SET_ORDER);
        
        // 合并对话行
        $maxCount = max(count($japaneseMatches), count($chineseMatches));
        
        for ($i = 0; $i < $maxCount; $i++) {
            $speaker = $japaneseMatches[$i][1] ?? $chineseMatches[$i][1] ?? 'A';
            $japanese = trim($japaneseMatches[$i][2] ?? '');
            $chinese = trim($chineseMatches[$i][2] ?? '');
            
            if (!empty($japanese) || !empty($chinese)) {
                $lines[] = [
                    'speaker' => $speaker,
                    'line_order' => $i + 1,
                    'japanese_text' => $japanese,
                    'chinese_text' => $chinese
                ];
            }
        }
        
        return $lines;
    }
} 