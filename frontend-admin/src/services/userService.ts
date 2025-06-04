import axios from 'axios';

// 使用相对路径，通过vite代理转发到后端
const API_BASE = '';

// 用户数据类型定义
export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  japanese_level: 'N1' | 'N2' | 'N3' | 'N4' | 'N5';
  is_active: boolean;
  email_verified_at?: string;
  created_at: string;
  last_login_at?: string;
  study_start_date?: string;
  daily_study_minutes: number;
  learning_goals?: string[];
  learning_progress: {
    current_day: number;
    total_study_minutes: number;
    consecutive_days: number;
    listening_score: number;
    speaking_score: number;
    vocabulary_score: number;
    grammar_score: number;
    last_study_date?: string;
  };
  achievements?: Achievement[];
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon?: string;
  type: string;
  unlocked_at: string;
}

export interface UserListParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: 'active' | 'inactive' | 'deleted';
  japanese_level?: 'N1' | 'N2' | 'N3' | 'N4' | 'N5';
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface UserCreateData {
  name: string;
  username: string;
  email: string;
  password: string;
  japanese_level: 'N1' | 'N2' | 'N3' | 'N4' | 'N5';
  daily_study_minutes?: number;
}

export interface UserUpdateData {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  japanese_level?: 'N1' | 'N2' | 'N3' | 'N4' | 'N5';
  daily_study_minutes?: number;
  is_active?: boolean;
  learning_goals?: string[];
}

export interface BatchActionData {
  action: 'activate' | 'deactivate' | 'delete';
  user_ids: number[];
}

export interface UserStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  deleted_users: number;
  new_users_today: number;
  new_users_this_week: number;
  new_users_this_month: number;
  users_by_level: Record<string, number>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
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

// 用户管理API服务
export class UserService {
  /**
   * 获取用户列表
   */
  static async getUsers(params: UserListParams = {}): Promise<ApiResponse<PaginatedResponse<User>>> {
    try {
      const response = await axios.get(`${API_BASE}/api/admin/users`, {
        params,
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: '获取用户列表失败' };
    }
  }

  /**
   * 获取用户详情
   */
  static async getUser(id: number): Promise<ApiResponse<User>> {
    try {
      const response = await axios.get(`${API_BASE}/api/admin/users/${id}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: '获取用户详情失败' };
    }
  }

  /**
   * 创建用户
   */
  static async createUser(data: UserCreateData): Promise<ApiResponse<User>> {
    try {
      const response = await axios.post(`${API_BASE}/api/admin/users`, data, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: '创建用户失败' };
    }
  }

  /**
   * 更新用户
   */
  static async updateUser(id: number, data: UserUpdateData): Promise<ApiResponse<User>> {
    try {
      const response = await axios.put(`${API_BASE}/api/admin/users/${id}`, data, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: '更新用户失败' };
    }
  }

  /**
   * 删除用户
   */
  static async deleteUser(id: number): Promise<ApiResponse> {
    try {
      const response = await axios.delete(`${API_BASE}/api/admin/users/${id}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: '删除用户失败' };
    }
  }

  /**
   * 批量操作
   */
  static async batchAction(data: BatchActionData): Promise<ApiResponse> {
    try {
      const response = await axios.post(`${API_BASE}/api/admin/users/batch-action`, data, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: '批量操作失败' };
    }
  }

  /**
   * 获取用户统计信息
   */
  static async getUserStats(): Promise<ApiResponse<UserStats>> {
    try {
      const response = await axios.get(`${API_BASE}/api/admin/users-stats`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: '获取统计信息失败' };
    }
  }

  /**
   * 导出用户数据
   */
  static async exportUsers(params: UserListParams = {}): Promise<Blob> {
    try {
      const response = await axios.get(`${API_BASE}/api/admin/users/export`, {
        params,
        headers: getAuthHeaders(),
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: '导出用户数据失败' };
    }
  }
}

export default UserService; 