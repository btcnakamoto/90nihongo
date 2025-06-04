import { apiClient } from './apiClient';

// 订阅相关数据类型定义
export interface SubscriptionPlan {
  id: number;
  name: string;
  code: string;
  description?: string;
  price: number;
  original_price?: number;
  duration_days?: number;
  features?: string[];
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  subscription_type: 'free' | 'monthly' | 'quarterly' | 'yearly' | 'lifetime';
  subscription_expires_at?: string;
  total_spent: number;
  created_at: string;
  learning_progress?: {
    current_day: number;
    total_study_minutes: number;
    consecutive_days: number;
  };
}

export interface SubscriptionStats {
  total_users: number;
  free_users: number;
  premium_users: number;
  monthly_users: number;
  quarterly_users: number;
  yearly_users: number;
  lifetime_users: number;
  total_revenue: number;
  monthly_revenue: number;
  quarterly_revenue: number;
  yearly_revenue: number;
  lifetime_revenue: number;
  conversion_rate: number;
  expiring_soon: number;
  total_referrals: number;
  successful_referrals: number;
  pending_commission: number;
  daily_stats: Array<{
    date: string;
    count: number;
    revenue: number;
  }>;
}

export interface UpdateSubscriptionData {
  subscription_type: 'free' | 'monthly' | 'quarterly' | 'yearly' | 'lifetime';
  duration_days?: number;
}

export interface BatchUpdateSubscriptionData {
  user_ids: number[];
  subscription_type: 'free' | 'monthly' | 'quarterly' | 'yearly' | 'lifetime';
  duration_days?: number;
}

export interface ExpiringSubscriptionsParams {
  days?: number;
  page?: number;
  per_page?: number;
}

export interface ReferralStats {  total_programs: number;  total_referrals: number;  pending_programs: number;  approved_programs: number;  paid_programs: number;  total_commission: number;  pending_commission: number;  paid_commission: number;  top_referrers: Array<{    id: number;    name: string;    email: string;    successful_referrals: number;    referral_count: number;    total_commission: number;  }>;}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

// 获取认证头部
const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// 订阅管理API服务
export class SubscriptionService {
  /**
   * 获取订阅计划列表
   */
  static async getPlans(): Promise<ApiResponse<SubscriptionPlan[]>> {
    try {
      const response = await apiClient.get('/api/admin/subscriptions/plans');
      return response.data;
    } catch (error: any) {
      console.error('获取订阅计划失败:', error);
      throw new Error(error.response?.data?.message || '获取订阅计划失败');
    }
  }

  /**
   * 获取订阅统计信息
   */
  static async getStats(): Promise<ApiResponse<SubscriptionStats>> {
    try {
      const response = await apiClient.get('/api/admin/subscriptions/stats');
      return response.data;
    } catch (error: any) {
      console.error('获取订阅统计失败:', error);
      throw new Error(error.response?.data?.message || '获取订阅统计失败');
    }
  }

  /**
   * 获取推荐计划统计
   */
  static async getReferralStats(): Promise<ApiResponse<ReferralStats>> {
    try {
      const response = await apiClient.get('/api/admin/subscriptions/referrals/stats');
      return response.data;
    } catch (error: any) {
      console.error('获取推荐统计失败:', error);
      throw new Error(error.response?.data?.message || '获取推荐统计失败');
    }
  }

  /**
   * 更新用户订阅
   */
  static async updateUserSubscription(
    userId: number,
    subscriptionType: string,
    durationDays?: number
  ): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.put(`/api/admin/subscriptions/users/${userId}/subscription`, {
        subscription_type: subscriptionType,
        duration_days: durationDays,
      });
      return response.data;
    } catch (error: any) {
      console.error('更新用户订阅失败:', error);
      throw new Error(error.response?.data?.message || '更新用户订阅失败');
    }
  }

  /**
   * 批量更新用户订阅
   */
  static async batchUpdateSubscription(
    userIds: number[],
    subscriptionType: string,
    durationDays?: number
  ): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post('/api/admin/subscriptions/users/batch-update', {
        user_ids: userIds,
        subscription_type: subscriptionType,
        duration_days: durationDays,
      });
      return response.data;
    } catch (error: any) {
      console.error('批量更新订阅失败:', error);
      throw new Error(error.response?.data?.message || '批量更新订阅失败');
    }
  }

  /**
   * 获取即将到期的订阅用户
   */
  static async getExpiringSubscriptions(days: number = 7): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/api/admin/subscriptions/expiring', {
        params: { days }
      });
      return response.data;
    } catch (error: any) {
      console.error('获取即将到期订阅失败:', error);
      throw new Error(error.response?.data?.message || '获取即将到期订阅失败');
    }
  }
} 