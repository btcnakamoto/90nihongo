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
        Schema::create('resource_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->nullable()->constrained('import_tasks')->onDelete('cascade');
            $table->string('name');
            $table->string('type'); // course, material, vocabulary, audio, video
            $table->string('source'); // web-scraping, file-upload, api-import
            $table->string('status')->default('pending'); // pending, downloading, processing, completed, error
            $table->decimal('progress', 5, 2)->default(0); // 0-100
            $table->string('file_path')->nullable();
            $table->bigInteger('file_size')->nullable(); // 文件大小（字节）
            $table->longText('content')->nullable(); // 文本内容
            $table->json('metadata')->nullable(); // 元数据
            $table->integer('count')->nullable(); // 项目数量（如词汇数量）
            $table->text('error_message')->nullable();
            $table->timestamps();
            
            $table->index(['type', 'status']);
            $table->index(['source', 'created_at']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resource_items');
    }
}; 