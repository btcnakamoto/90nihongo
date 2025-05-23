import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// 订阅计划类型定义
export interface SubscriptionPlan {
  id: number;
  name: string;
  code: string;
  description: string;
  price: number;
  original_price?: number;
  duration_days?: number;
  features: string[];
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
  discount_percentage?: number;
  daily_price?: number;
}

// 订阅统计类型定义
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

// 推荐统计类型
export interface ReferralStats {
  total_programs: number;
  pending_programs: number;
  approved_programs: number;
  paid_programs: number;
  total_commission: number;
  pending_commission: number;
  paid_commission: number;
  top_referrers: Array<{
    id: number;
    name: string;
    email: string;
    successful_referrals: number;
    total_commission: number;
  }>;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
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
      const response = await axios.get(`${API_BASE}/admin/subscriptions/plans`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: '获取订阅计划失败' };
    }
  }

  /**
   * 获取订阅统计信息
   */
  static async getStats(): Promise<ApiResponse<SubscriptionStats>> {
    try {
      const response = await axios.get(`${API_BASE}/admin/subscriptions/stats`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: '获取订阅统计失败' };
    }
  }

  /**
   * 更新用户订阅
   */
  static async updateUserSubscription(
    userId: number, 
    subscriptionType: string, 
    durationDays?: number
  ): Promise<ApiResponse> {
    try {
      const response = await axios.put(
        `${API_BASE}/admin/subscriptions/users/${userId}/subscription`,
        {
          subscription_type: subscriptionType,
          duration_days: durationDays,
        },
        {
          headers: getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: '更新用户订阅失败' };
    }
  }

  /**
   * 批量更新用户订阅
   */
  static async batchUpdateSubscription(
    userIds: number[], 
    subscriptionType: string, 
    durationDays?: number
  ): Promise<ApiResponse> {
    try {
      const response = await axios.post(
        `${API_BASE}/admin/subscriptions/users/batch-update`,
        {
          user_ids: userIds,
          subscription_type: subscriptionType,
          duration_days: durationDays,
        },
        {
          headers: getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: '批量更新订阅失败' };
    }
  }

  /**
   * 获取即将到期的订阅
   */
  static async getExpiringSubscriptions(days: number = 7): Promise<ApiResponse> {
    try {
      const response = await axios.get(`${API_BASE}/admin/subscriptions/expiring`, {
        params: { days },
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: '获取即将到期订阅失败' };
    }
  }

  /**
   * 获取推荐统计
   */
  static async getReferralStats(): Promise<ApiResponse<ReferralStats>> {
    try {
      const response = await axios.get(`${API_BASE}/admin/subscriptions/referrals/stats`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: '获取推荐统计失败' };
    }
  }
}

export default SubscriptionService; 