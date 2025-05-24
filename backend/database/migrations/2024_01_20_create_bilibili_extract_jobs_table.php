<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bilibili_extract_jobs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('admin_id');
            $table->string('video_url');
            $table->string('video_title')->nullable();
            $table->string('start_time');
            $table->string('end_time');
            $table->text('description')->nullable();
            $table->boolean('use_ai_subtitle')->default(true);
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            $table->tinyInteger('progress')->default(0);
            $table->string('audio_path')->nullable();
            $table->string('subtitle_path')->nullable();
            $table->longText('subtitle_text')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            // 索引
            $table->index(['admin_id', 'created_at']);
            $table->index(['status', 'created_at']);
            $table->index('completed_at');

                        // 外键约束            $table->foreign('admin_id')->references('id')->on('admins')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bilibili_extract_jobs');
    }
}; 