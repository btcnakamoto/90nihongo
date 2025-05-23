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

  // 验证token有效性
  useEffect(() => {
    if (token && !admin) {
      // 如果有token但没有管理员信息，尝试获取
      adminAuthApi.getMe()
        .then(response => {
          if (response.success) {
            setAdmin(response.admin);
            localStorage.setItem("admin_info", JSON.stringify(response.admin));
          }
        })
        .catch(error => {
          console.error('Failed to get admin info:', error);
          // Token可能已过期，清除本地状态
          setToken(null);
          setAdmin(null);
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_info");
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
        isLoading
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