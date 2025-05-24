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
        Schema::create('import_tasks', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // web-scraping, file-upload, api-import, batch-process
            $table->string('name');
            $table->string('status')->default('pending'); // pending, running, completed, failed, paused, cancelled
            $table->decimal('progress', 5, 2)->default(0); // 0-100
            $table->integer('total_items')->default(0);
            $table->integer('items_processed')->default(0);
            $table->json('config')->nullable(); // 任务配置
            $table->json('logs')->nullable(); // 日志记录
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();
            
            $table->index(['status', 'created_at']);
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('import_tasks');
    }
}; 