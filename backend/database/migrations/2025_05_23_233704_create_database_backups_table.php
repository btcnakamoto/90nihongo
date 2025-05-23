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
        Schema::create('database_backups', function (Blueprint $table) {
            $table->id();
            $table->string('filename')->unique()->comment('备份文件名');
            $table->string('filepath')->comment('备份文件路径');
            $table->text('description')->nullable()->comment('备份描述');
            $table->unsignedBigInteger('file_size')->comment('文件大小(字节)');
            $table->string('file_size_human')->comment('文件大小(可读格式)');
            $table->unsignedInteger('tables_count')->comment('备份的表数量');
            $table->string('database_name')->comment('数据库名称');
            $table->string('database_driver')->comment('数据库类型');
            $table->enum('status', ['creating', 'completed', 'failed'])->default('creating')->comment('备份状态');
            $table->timestamp('backup_started_at')->nullable()->comment('备份开始时间');
            $table->timestamp('backup_completed_at')->nullable()->comment('备份完成时间');
            $table->timestamps();
            
            $table->index(['created_at']);
            $table->index(['status']);
            $table->index(['database_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('database_backups');
    }
};
