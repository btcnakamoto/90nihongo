<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // 学习路径模板表
        Schema::create('learning_paths', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->enum('target_level', ['N5', 'N4', 'N3', 'N2', 'N1']);
            $table->integer('duration_days');
            $table->json('milestones'); // 学习路径中的关键节点
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 用户学习路径配置表
        Schema::create('user_learning_paths', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('learning_path_id')->constrained()->onDelete('cascade');
            $table->json('customizations')->nullable(); // 用户对学习路径的自定义设置
            $table->json('completed_milestones')->nullable();
            $table->timestamp('started_at');
            $table->timestamp('target_completion_date')->nullable();
            $table->timestamps();
        });

        // 用户学习时间偏好表
        Schema::create('user_study_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->time('preferred_start_time')->nullable();
            $table->time('preferred_end_time')->nullable();
            $table->json('study_reminders'); // 学习提醒时间配置
            $table->boolean('enable_sleep_mode')->default(true);
            $table->json('weekend_preferences')->nullable();
            $table->timestamps();
        });

        // 每日复习清单表
        Schema::create('daily_review_lists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->date('review_date');
            $table->json('vocabulary_ids'); // 需要复习的词汇ID列表
            $table->json('grammar_points'); // 需要复习的语法点
            $table->json('listening_materials'); // 需要复习的听力材料
            $table->boolean('is_completed')->default(false);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('daily_review_lists');
        Schema::dropIfExists('user_study_preferences');
        Schema::dropIfExists('user_learning_paths');
        Schema::dropIfExists('learning_paths');
    }
}; 