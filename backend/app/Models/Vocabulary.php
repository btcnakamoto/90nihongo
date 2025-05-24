<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vocabulary extends Model
{
    use HasFactory;

    protected $table = 'vocabulary';

    protected $fillable = [
        'word',
        'reading',
        'meaning',
        'part_of_speech',
        'example_sentence',
        'example_reading',
        'example_meaning',
        'jlpt_level',
        'tags'
    ];

    protected $casts = [
        'tags' => 'array'
    ];

    /**
     * 获取用户学习记录
     */
    public function userVocabulary()
    {
        return $this->hasMany(UserVocabulary::class);
    }
} 