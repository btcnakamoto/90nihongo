<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('learning_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('current_day')->default(1); // 90天中的第几天
            $table->json('completed_modules')->nullable(); // 已完成的模块
            $table->integer('total_study_minutes')->default(0);
            $table->integer('listening_score')->default(0);
            $table->integer('speaking_score')->default(0);
            $table->integer('vocabulary_score')->default(0);
            $table->integer('grammar_score')->default(0);
            $table->date('last_study_date')->nullable();
            $table->integer('consecutive_days')->default(0); // 连续学习天数
            $table->timestamps();
        });

        // 成就表
        Schema::create('achievements', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('description');
            $table->string('icon')->nullable();
            $table->enum('type', ['study_time', 'skill_level', 'consecutive_days', 'special']);
            $table->json('requirements'); // 解锁要求
            $table->timestamps();
        });

        // 用户成就关联表
        Schema::create('user_achievements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('achievement_id')->constrained()->onDelete('cascade');
            $table->timestamp('unlocked_at');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('user_achievements');
        Schema::dropIfExists('achievements');
        Schema::dropIfExists('learning_progress');
    }
}; 