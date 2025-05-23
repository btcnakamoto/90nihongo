<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('subscription_type', ['free', 'monthly', 'quarterly', 'yearly', 'lifetime'])
                  ->default('free')->after('is_active');
            $table->timestamp('subscription_expires_at')->nullable()->after('subscription_type');
            $table->decimal('total_spent', 10, 2)->default(0)->after('subscription_expires_at');
            $table->integer('referral_code')->unique()->nullable()->after('total_spent');
            $table->integer('referred_by')->nullable()->after('referral_code');
            $table->json('premium_features_used')->nullable()->after('referred_by');
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'subscription_type', 
                'subscription_expires_at', 
                'total_spent',
                'referral_code',
                'referred_by',
                'premium_features_used'
            ]);
        });
    }
}; 