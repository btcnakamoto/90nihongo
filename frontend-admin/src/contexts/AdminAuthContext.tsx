import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { adminAuthApi } from "@/lib/api";

interface AdminInfo {
  id: number;
  username: string;
  email: string;
  role: string;
  status: boolean;
  is_super_admin: boolean;
}

interface AdminAuthContextType {
  isAuthenticated: boolean;
  admin: AdminInfo | null;
  login: (token: string, adminInfo: AdminInfo) => void;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  token: string | null;
  isLoading: boolean;
  getAuthHeaders: () => Record<string, string>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("admin_token");
  });
  
  const [admin, setAdmin] = useState<AdminInfo | null>(() => {
    const adminInfo = localStorage.getItem("admin_info");
    return adminInfo ? JSON.parse(adminInfo) : null;
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const login = (newToken: string, adminInfo: AdminInfo) => {
    setToken(newToken);
    setAdmin(adminInfo);
    localStorage.setItem("admin_token", newToken);
    localStorage.setItem("admin_info", JSON.stringify(adminInfo));
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // 调用API登出
      await adminAuthApi.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
      // 即使API调用失败，也要清除本地状态
    } finally {
      // 清除本地状态
      setToken(null);
      setAdmin(null);
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_info");
      setIsLoading(false);
      
      // 跳转到登录页
      window.location.href = '/login';
    }
  };

  const logoutAll = async () => {
    setIsLoading(true);
    try {
      // 调用API全部登出
      await adminAuthApi.logoutAll();
    } catch (error) {
      console.error('Logout all API call failed:', error);
      // 即使API调用失败，也要清除本地状态
    } finally {
      // 清除本地状态
      setToken(null);
      setAdmin(null);
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_info");
      setIsLoading(false);
      
      // 跳转到登录页
      window.location.href = '/login';
    }
  };

  const getAuthHeaders = () => {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  };

  // 验证token有效性
  useEffect(() => {
    if (token && !admin) {
      console.log('🔍 验证token有效性...');
      setIsLoading(true);
      
      // 如果有token但没有管理员信息，尝试获取
      adminAuthApi.getMe()
        .then(response => {
          console.log('✅ Token验证成功:', response);
          if (response.success) {
            setAdmin(response.admin);
            localStorage.setItem("admin_info", JSON.stringify(response.admin));
          } else {
            console.warn('⚠️ Token验证响应异常:', response);
            // 清除无效的token
            setToken(null);
            localStorage.removeItem("admin_token");
            localStorage.removeItem("admin_info");
          }
        })
        .catch(error => {
          console.error('❌ Token验证失败:', error);
          
          // 检查错误类型
          if (error.response?.status === 401) {
            console.log('🔒 Token已过期或无效，清除认证状态');
            // Token过期或无效，清除本地状态
            setToken(null);
            setAdmin(null);
            localStorage.removeItem("admin_token");
            localStorage.removeItem("admin_info");
          } else if (error.code === 'NETWORK_ERROR' || !error.response) {
            console.warn('🌐 网络错误，保持当前认证状态');
            // 网络错误，不清除认证状态，使用缓存的admin信息
            const cachedAdmin = localStorage.getItem("admin_info");
            if (cachedAdmin) {
              try {
                setAdmin(JSON.parse(cachedAdmin));
                console.log('📦 使用缓存的管理员信息');
              } catch (e) {
                console.error('❌ 缓存的管理员信息格式错误:', e);
                setToken(null);
                localStorage.removeItem("admin_token");
                localStorage.removeItem("admin_info");
              }
            }
          } else {
            console.error('❌ 其他错误，清除认证状态:', error);
            // 其他错误，清除认证状态
            setToken(null);
            setAdmin(null);
            localStorage.removeItem("admin_token");
            localStorage.removeItem("admin_info");
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [token, admin]);

  return (
    <AdminAuthContext.Provider 
      value={{ 
        isAuthenticated: !!token, 
        admin,
        login, 
        logout, 
        logoutAll,
        token,
        isLoading,
        getAuthHeaders
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}; 