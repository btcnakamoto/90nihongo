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
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100); // 月会员、季度会员等
            $table->string('code', 50)->unique(); // monthly, quarterly, yearly, lifetime
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2); // 价格
            $table->decimal('original_price', 10, 2)->nullable(); // 原价
            $table->integer('duration_days')->nullable(); // 时长天数，null表示终身
            $table->json('features')->nullable(); // 包含的功能列表
            $table->boolean('is_popular')->default(false); // 是否推荐
            $table->boolean('is_active')->default(true); // 是否启用
            $table->integer('sort_order')->default(0); // 排序
            $table->timestamps();
            
            $table->index(['is_active', 'sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_plans');
    }
};
