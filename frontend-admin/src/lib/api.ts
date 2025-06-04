import axios from 'axios';

// API基础配置 - 使用相对路径，通过vite代理转发到后端
const API_BASE_URL = '';

// 开发环境下打印配置信息
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', {
    baseURL: API_BASE_URL || '相对路径（通过vite代理）',
    environment: import.meta.env.MODE,
  });
}

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 添加超时配置
});

// 请求拦截器：自动添加token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 开发环境下记录请求
    if (import.meta.env.DEV) {
      console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器：处理401错误和通用错误处理
apiClient.interceptors.response.use(
  (response) => {
    // 开发环境下记录响应
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', response.config.url, response.status);
    }
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.response?.data);
    
    // 检查是否是网络错误
    if (!error.response) {
      console.warn('🌐 网络连接错误，请检查后端服务器是否运行');
      error.code = 'NETWORK_ERROR';
    } else if (error.response?.status === 401) {
      console.log('🔒 收到401错误，token可能已过期');
      
      // 只有在特定API端点收到401时才自动跳转
      const isAuthEndpoint = error.config?.url?.includes('/api/admin/me') || 
                            error.config?.url?.includes('/api/admin/login');
      
      if (isAuthEndpoint) {
        // Token过期或无效，清除本地存储并跳转到登录页
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_info');
        
        // 避免在登录页面重复跳转
        if (!window.location.pathname.includes('/login')) {
          console.log('🔄 跳转到登录页面');
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// 管理端认证API
export const adminAuthApi = {
  // 登录
  login: async (account: string, password: string) => {
    const response = await apiClient.post('/api/admin/login', {
      account,
      password,
    });
    return response.data;
  },

  // 登出（当前设备）
  logout: async () => {
    const response = await apiClient.post('/api/admin/logout');
    return response.data;
  },

  // 全部登出（所有设备）
  logoutAll: async () => {
    const response = await apiClient.post('/api/admin/logout-all');
    return response.data;
  },

  // 获取当前管理员信息
  getMe: async () => {
    const response = await apiClient.get('/api/admin/me');
    return response.data;
  },

  // 刷新Token
  refresh: async () => {
    const response = await apiClient.post('/api/admin/refresh');
    return response.data;
  },
};

// 其他API（示例）
export const adminApi = {
  // 获取统计数据
  getStats: async () => {
    const response = await apiClient.get('/api/admin/stats');
    return response.data;
  },

  // 用户管理
  getUsers: async () => {
    const response = await apiClient.get('/api/admin/users');
    return response.data;
  },

  // 内容管理
  getContent: async () => {
    const response = await apiClient.get('/api/admin/content');
    return response.data;
  },
};

// 导出配置信息（用于调试）
export const apiConfig = {
  baseURL: API_BASE_URL || '相对路径（通过vite代理）',
  environment: import.meta.env.MODE,
  isDev: import.meta.env.DEV,
};

export default apiClient; 