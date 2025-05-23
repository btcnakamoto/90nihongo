<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Models\ReferralProgram;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class SubscriptionController extends Controller
{
    /**
     * 获取订阅计划列表
     */
    public function getPlans(): JsonResponse
    {
        try {
            $plans = SubscriptionPlan::where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('price')
                ->get();

            return response()->json([
                'success' => true,
                'message' => '获取订阅计划成功',
                'data' => $plans,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '获取订阅计划失败: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 获取订阅统计信息
     */
    public function getStats(): JsonResponse
    {
        try {
            $stats = [
                // 基础统计
                'total_users' => User::count(),
                'free_users' => User::where('subscription_type', 'free')->count(),
                'premium_users' => User::where('subscription_type', '!=', 'free')->count(),
                
                // 按订阅类型统计
                'monthly_users' => User::where('subscription_type', 'monthly')->count(),
                'quarterly_users' => User::where('subscription_type', 'quarterly')->count(),
                'yearly_users' => User::where('subscription_type', 'yearly')->count(),
                'lifetime_users' => User::where('subscription_type', 'lifetime')->count(),
                
                // 收入统计
                'total_revenue' => User::sum('total_spent'),
                'monthly_revenue' => User::where('subscription_type', 'monthly')
                    ->where('subscription_expires_at', '>', now())
                    ->sum('total_spent'),
                'quarterly_revenue' => User::where('subscription_type', 'quarterly')
                    ->where('subscription_expires_at', '>', now())
                    ->sum('total_spent'),
                'yearly_revenue' => User::where('subscription_type', 'yearly')
                    ->where('subscription_expires_at', '>', now())
                    ->sum('total_spent'),
                'lifetime_revenue' => User::where('subscription_type', 'lifetime')
                    ->sum('total_spent'),
                
                // 转化率统计
                'conversion_rate' => User::count() > 0 
                    ? round((User::where('subscription_type', '!=', 'free')->count() / User::count()) * 100, 2)
                    : 0,
                
                // 即将到期的订阅
                'expiring_soon' => User::where('subscription_type', '!=', 'free')
                    ->where('subscription_type', '!=', 'lifetime')
                    ->whereBetween('subscription_expires_at', [now(), now()->addDays(7)])
                    ->count(),
                
                // 推荐统计
                'total_referrals' => 0, // ReferralProgram::count(),
                'successful_referrals' => 0, // ReferralProgram::where('status', 'approved')->count(),
                'pending_commission' => 0, // ReferralProgram::where('status', 'approved')->whereNull('paid_at')->sum('commission_amount'),
            ];

            // 每日新增付费用户（最近30天）
            $dailyStats = User::where('subscription_type', '!=', 'free')
                ->where('created_at', '>=', now()->subDays(30))
                ->select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('COUNT(*) as count'),
                    DB::raw('SUM(total_spent) as revenue')
                )
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            $stats['daily_stats'] = $dailyStats;

            return response()->json([
                'success' => true,
                'message' => '获取订阅统计成功',
                'data' => $stats,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '获取订阅统计失败: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 更新用户订阅
     */
    public function updateUserSubscription(Request $request, $userId): JsonResponse
    {
        try {
            $request->validate([
                'subscription_type' => 'required|in:free,monthly,quarterly,yearly,lifetime',
                'duration_days' => 'nullable|integer|min:1',
            ]);

            $user = User::findOrFail($userId);
            
            $subscriptionType = $request->subscription_type;
            
            if ($subscriptionType === 'free') {
                $user->update([
                    'subscription_type' => 'free',
                    'subscription_expires_at' => null,
                ]);
            } elseif ($subscriptionType === 'lifetime') {
                $user->update([
                    'subscription_type' => 'lifetime',
                    'subscription_expires_at' => null,
                ]);
            } else {
                $durationDays = $request->duration_days;
                if (!$durationDays) {
                    // 从计划中获取默认时长
                    $plan = SubscriptionPlan::where('code', $subscriptionType)->first();
                    $durationDays = $plan ? $plan->duration_days : 30;
                }
                
                $user->update([
                    'subscription_type' => $subscriptionType,
                    'subscription_expires_at' => now()->addDays($durationDays),
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => '用户订阅更新成功',
                'data' => [
                    'id' => $user->id,
                    'subscription_type' => $user->subscription_type,
                    'subscription_expires_at' => $user->subscription_expires_at,
                    'is_premium' => $user->isPremium(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '更新用户订阅失败: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 批量更新用户订阅
     */
    public function batchUpdateSubscription(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'user_ids' => 'required|array|min:1',
                'user_ids.*' => 'integer|exists:users,id',
                'subscription_type' => 'required|in:free,monthly,quarterly,yearly,lifetime',
                'duration_days' => 'nullable|integer|min:1',
            ]);

            $userIds = $request->user_ids;
            $subscriptionType = $request->subscription_type;

            if ($subscriptionType === 'free') {
                User::whereIn('id', $userIds)->update([
                    'subscription_type' => 'free',
                    'subscription_expires_at' => null,
                ]);
            } elseif ($subscriptionType === 'lifetime') {
                User::whereIn('id', $userIds)->update([
                    'subscription_type' => 'lifetime',
                    'subscription_expires_at' => null,
                ]);
            } else {
                $durationDays = $request->duration_days;
                if (!$durationDays) {
                    $plan = SubscriptionPlan::where('code', $subscriptionType)->first();
                    $durationDays = $plan ? $plan->duration_days : 30;
                }
                
                User::whereIn('id', $userIds)->update([
                    'subscription_type' => $subscriptionType,
                    'subscription_expires_at' => now()->addDays($durationDays),
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => "成功更新 " . count($userIds) . " 个用户的订阅",
                'affected_count' => count($userIds),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '批量更新订阅失败: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 获取即将到期的订阅用户
     */
    public function getExpiringSubscriptions(Request $request): JsonResponse
    {
        try {
            $days = $request->input('days', 7); // 默认7天内到期
            
            $users = User::where('subscription_type', '!=', 'free')
                ->where('subscription_type', '!=', 'lifetime')
                ->whereBetween('subscription_expires_at', [now(), now()->addDays($days)])
                ->with('learningProgress')
                ->select([
                    'id', 'name', 'email', 'subscription_type', 
                    'subscription_expires_at', 'total_spent', 'created_at'
                ])
                ->orderBy('subscription_expires_at')
                ->paginate(50);

            return response()->json([
                'success' => true,
                'message' => '获取即将到期订阅成功',
                'data' => $users,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '获取即将到期订阅失败: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 获取推荐计划统计
     */
    public function getReferralStats(): JsonResponse
    {
        try {
            $stats = [
                'total_programs' => 0,
                'pending_programs' => 0,
                'approved_programs' => 0,
                'paid_programs' => 0,
                'total_commission' => 0,
                'pending_commission' => 0,
                'paid_commission' => 0,
                'top_referrers' => [],
            ];

            return response()->json([
                'success' => true,
                'message' => '获取推荐统计成功',
                'data' => $stats,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '获取推荐统计失败: ' . $e->getMessage(),
            ], 500);
        }
    }
}
