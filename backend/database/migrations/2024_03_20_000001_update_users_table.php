<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->unique()->after('id');
            $table->string('avatar')->nullable();
            $table->enum('japanese_level', ['N5', 'N4', 'N3', 'N2', 'N1'])->default('N3');
            $table->json('learning_goals')->nullable(); // 学习目标配置
            $table->integer('daily_study_minutes')->default(60); // 每日学习时间设置
            $table->date('study_start_date')->nullable(); // 90天学习开始日期
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_login_at')->nullable();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'username',
                'avatar',
                'japanese_level',
                'learning_goals',
                'daily_study_minutes',
                'study_start_date',
                'is_active',
                'last_login_at',
                'deleted_at'
            ]);
        });
    }
}; 