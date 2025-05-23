<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // 学习小组表
        Schema::create('study_groups', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->foreignId('creator_id')->constrained('users')->onDelete('cascade');
            $table->integer('max_members')->default(50);
            $table->boolean('is_private')->default(false);
            $table->string('cover_image')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // 小组成员表
        Schema::create('study_group_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained('study_groups')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('role', ['member', 'moderator', 'admin'])->default('member');
            $table->timestamp('joined_at');
            $table->timestamps();
        });

        // 社区帖子表
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('group_id')->nullable()->constrained('study_groups')->onDelete('cascade');
            $table->string('title');
            $table->text('content');
            $table->json('media_urls')->nullable(); // 图片、视频等媒体URL
            $table->json('tags')->nullable();
            $table->integer('view_count')->default(0);
            $table->integer('like_count')->default(0);
            $table->integer('comment_count')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        // 评论表
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('post_id')->constrained()->onDelete('cascade');
            $table->foreignId('parent_id')->nullable()->constrained('comments')->onDelete('cascade');
            $table->text('content');
            $table->integer('like_count')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        // 点赞表
        Schema::create('likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->morphs('likeable'); // 可以点赞帖子或评论
            $table->timestamps();

            $table->unique(['user_id', 'likeable_type', 'likeable_id']);
        });

        // 学习伙伴关系表
        Schema::create('study_partners', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('partner_id')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['pending', 'accepted', 'rejected'])->default('pending');
            $table->timestamp('paired_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'partner_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('study_partners');
        Schema::dropIfExists('likes');
        Schema::dropIfExists('comments');
        Schema::dropIfExists('posts');
        Schema::dropIfExists('study_group_members');
        Schema::dropIfExists('study_groups');
    }
}; 