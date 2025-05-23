<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // 课程内容表
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->integer('day_number'); // 90天中的第几天
            $table->enum('difficulty', ['beginner', 'intermediate', 'advanced']);
            $table->json('tags')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 学习材料表
        Schema::create('learning_materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->enum('type', ['video', 'audio', 'text', 'quiz']);
            $table->text('content');
            $table->string('media_url')->nullable();
            $table->integer('duration_minutes')->nullable();
            $table->json('metadata')->nullable(); // 额外的媒体信息
            $table->timestamps();
        });

        // 词汇表
        Schema::create('vocabulary', function (Blueprint $table) {
            $table->id();
            $table->string('word');
            $table->string('reading');
            $table->text('meaning');
            $table->string('part_of_speech');
            $table->text('example_sentence')->nullable();
            $table->string('example_reading')->nullable();
            $table->text('example_meaning')->nullable();
            $table->enum('jlpt_level', ['N5', 'N4', 'N3', 'N2', 'N1']);
            $table->json('tags')->nullable();
            $table->timestamps();
        });

        // 用户词汇学习记录
        Schema::create('user_vocabulary', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('vocabulary_id')->constrained('vocabulary')->onDelete('cascade');
            $table->enum('status', ['new', 'learning', 'mastered'])->default('new');
            $table->integer('review_count')->default(0);
            $table->timestamp('next_review_at')->nullable();
            $table->timestamps();
        });

        // 练习题表
        Schema::create('exercises', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->enum('type', ['listening', 'speaking', 'grammar', 'vocabulary']);
            $table->text('question');
            $table->json('options')->nullable(); // 选项（如果是选择题）
            $table->string('correct_answer');
            $table->text('explanation')->nullable();
            $table->integer('points')->default(10);
            $table->timestamps();
        });

        // 用户练习记录
        Schema::create('user_exercises', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('exercise_id')->constrained()->onDelete('cascade');
            $table->string('user_answer');
            $table->boolean('is_correct');
            $table->integer('points_earned');
            $table->timestamp('completed_at');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('user_exercises');
        Schema::dropIfExists('exercises');
        Schema::dropIfExists('user_vocabulary');
        Schema::dropIfExists('vocabulary');
        Schema::dropIfExists('learning_materials');
        Schema::dropIfExists('courses');
    }
}; 