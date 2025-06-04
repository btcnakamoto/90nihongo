<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DialogueLine extends Model
{
    use HasFactory;

    protected $fillable = [
        'dialogue_id',
        'speaker',
        'line_order',
        'japanese_text',
        'chinese_text',
        'audio_url'
    ];

    protected $casts = [
        'line_order' => 'integer'
    ];

    /**
     * 所属对话
     */
    public function dialogue()
    {
        return $this->belongsTo(Dialogue::class);
    }

    /**
     * 获取字符数（日语）
     */
    public function getJapaneseCharacterCount()
    {
        return mb_strlen($this->japanese_text, 'UTF-8');
    }

    /**
     * 获取字符数（中文）
     */
    public function getChineseCharacterCount()
    {
        return mb_strlen($this->chinese_text, 'UTF-8');
    }

    /**
     * 检查是否有音频
     */
    public function hasAudio()
    {
        return !empty($this->audio_url);
    }

    /**
     * 获取音频文件扩展名
     */
    public function getAudioExtension()
    {
        if (!$this->hasAudio()) {
            return null;
        }
        
        return pathinfo($this->audio_url, PATHINFO_EXTENSION);
    }

    /**
     * 生成音频文件名
     */
    public function generateAudioFileName($extension = 'mp3')
    {
        $dialogue = $this->dialogue;
        $material = $dialogue->learningMaterial;
        
        return sprintf(
            'dialogue_%s_line_%s_%s.%s',
            $material->source_id ?? $dialogue->id,
            $this->line_order,
            $this->speaker,
            $extension
        );
    }

    /**
     * 作用域：按说话人筛选
     */
    public function scopeBySpeaker($query, $speaker)
    {
        return $query->where('speaker', $speaker);
    }

    /**
     * 作用域：按对话ID筛选
     */
    public function scopeByDialogue($query, $dialogueId)
    {
        return $query->where('dialogue_id', $dialogueId);
    }

    /**
     * 作用域：有音频的对话行
     */
    public function scopeWithAudio($query)
    {
        return $query->whereNotNull('audio_url');
    }

    /**
     * 作用域：无音频的对话行
     */
    public function scopeWithoutAudio($query)
    {
        return $query->whereNull('audio_url');
    }

    /**
     * 获取下一行对话
     */
    public function getNextLine()
    {
        return static::where('dialogue_id', $this->dialogue_id)
                    ->where('line_order', '>', $this->line_order)
                    ->orderBy('line_order')
                    ->first();
    }

    /**
     * 获取上一行对话
     */
    public function getPreviousLine()
    {
        return static::where('dialogue_id', $this->dialogue_id)
                    ->where('line_order', '<', $this->line_order)
                    ->orderBy('line_order', 'desc')
                    ->first();
    }

    /**
     * 批量创建对话行
     */
    public static function createBatch($dialogueId, array $linesData)
    {
        $lines = [];
        
        foreach ($linesData as $index => $lineData) {
            $lineData['dialogue_id'] = $dialogueId;
            $lineData['line_order'] = $lineData['line_order'] ?? ($index + 1);
            
            $lines[] = static::create($lineData);
        }
        
        return collect($lines);
    }
} 