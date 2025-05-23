<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // AI对话场景配置表
        Schema::create('ai_conversation_scenarios', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->enum('difficulty', ['beginner', 'intermediate', 'advanced']);
            $table->json('initial_context'); // AI的初始上下文设置
            $table->json('suggested_topics'); // 建议的对话主题
            $table->json('vocabulary_focus'); // 重点词汇
            $table->json('grammar_focus'); // 重点语法
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 用户AI对话历史记录表
        Schema::create('ai_conversation_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('scenario_id')->constrained('ai_conversation_scenarios')->onDelete('cascade');
            $table->json('conversation_log'); // 对话内容记录
            $table->integer('duration_seconds');
            $table->integer('user_messages_count');
            $table->integer('ai_messages_count');
            $table->json('performance_metrics')->nullable(); // 发音准确度、流畅度等指标
            $table->timestamps();
        });

        // 微场景配置表
        Schema::create('micro_scenarios', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->enum('type', ['dialogue', 'role_play', 'situation_response']);
            $table->integer('estimated_duration_minutes');
            $table->json('scenario_content'); // 场景内容，包括对话脚本或情境描述
            $table->json('key_phrases'); // 关键短语
            $table->json('success_criteria'); // 完成标准
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 用户微场景完成记录表
        Schema::create('user_micro_scenario_completions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('micro_scenario_id')->constrained()->onDelete('cascade');
            $table->json('user_responses'); // 用户的回答记录
            $table->integer('score')->nullable();
            $table->json('feedback')->nullable(); // AI评分反馈
            $table->boolean('is_completed')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        // AI评分标准表
        Schema::create('ai_evaluation_criteria', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->enum('type', ['pronunciation', 'grammar', 'vocabulary', 'fluency', 'comprehension']);
            $table->json('scoring_rules'); // 评分规则
            $table->json('feedback_templates'); // 反馈模板
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('ai_evaluation_criteria');
        Schema::dropIfExists('user_micro_scenario_completions');
        Schema::dropIfExists('micro_scenarios');
        Schema::dropIfExists('ai_conversation_histories');
        Schema::dropIfExists('ai_conversation_scenarios');
    }
}; 