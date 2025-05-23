import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  Settings,
  BarChart,
  MessageSquare,
  Bell,
  LogOut,
  ChevronDown,
  ChevronUp,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

interface SidebarItemProps {
  icon: React.ElementType;
  text: string;
  href: string;
  isActive?: boolean;
}

const SidebarItem = ({ icon: Icon, text, href, isActive }: SidebarItemProps) => {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-nihongo-lightBlue",
        isActive ? "bg-nihongo-lightBlue text-nihongo-darkBlue font-medium" : "text-nihongo-gray"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{text}</span>
    </Link>
  );
};

interface AdminSidebarProps {
  activePath: string;
}

const AdminSidebar = ({ activePath }: AdminSidebarProps) => {
  const { admin, logout, logoutAll, isLoading } = useAdminAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    if (window.confirm('确定要登出吗？')) {
      await logout();
    }
  };

  const handleLogoutAll = async () => {
    if (window.confirm('确定要从所有设备登出吗？这将结束您在所有设备上的登录状态。')) {
      await logoutAll();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-64">
      <div className="p-6">
        <h2 className="text-xl font-bold text-nihongo-darkBlue flex items-center gap-2">
          <span className="text-nihongo-red">90</span>天日语管理系统
        </h2>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        <SidebarItem 
          icon={LayoutDashboard} 
          text="仪表盘" 
          href="/admin" 
          isActive={activePath === "/admin"} 
        />
        <SidebarItem 
          icon={Users} 
          text="用户管理" 
          href="/admin/users" 
          isActive={activePath === "/admin/users"} 
        />
        <SidebarItem 
          icon={BookOpen} 
          text="内容管理" 
          href="/admin/content" 
          isActive={activePath === "/admin/content"} 
        />
        <SidebarItem 
          icon={BarChart} 
          text="数据分析" 
          href="/admin/analytics" 
          isActive={activePath === "/admin/analytics"} 
        />
        <SidebarItem 
          icon={MessageSquare} 
          text="社区管理" 
          href="/admin/community" 
          isActive={activePath === "/admin/community"} 
        />
        <SidebarItem 
          icon={Bell} 
          text="通知设置" 
          href="/admin/notifications" 
          isActive={activePath === "/admin/notifications"} 
        />
        <SidebarItem 
          icon={FileText} 
          text="报告" 
          href="/admin/reports" 
          isActive={activePath === "/admin/reports"} 
        />
        <SidebarItem 
          icon={Settings} 
          text="系统设置" 
          href="/admin/settings" 
          isActive={activePath === "/admin/settings"} 
        />
      </nav>
      
      {/* 用户信息和登出区域 */}
      <div className="p-4 border-t border-gray-200">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            <div className="w-8 h-8 rounded-full bg-nihongo-indigo flex items-center justify-center text-white font-medium">
              {admin?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-nihongo-darkBlue">
                {admin?.username || '管理员'}
              </p>
              <p className="text-xs text-nihongo-gray">
                {admin?.email || 'admin@90nihongo.com'}
              </p>
            </div>
            {showUserMenu ? (
              <ChevronUp className="h-4 w-4 text-nihongo-gray" />
            ) : (
              <ChevronDown className="h-4 w-4 text-nihongo-gray" />
            )}
          </button>

          {/* 下拉菜单 */}
          {showUserMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <div className="py-1">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-xs text-nihongo-gray">
                    角色: {admin?.is_super_admin ? '超级管理员' : '管理员'}
                  </p>
                  <p className="text-xs text-nihongo-gray">
                    状态: {admin?.status ? '活跃' : '禁用'}
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    // 可以添加个人资料页面导航
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-nihongo-gray hover:bg-gray-50 transition-colors"
                >
                  <User className="h-4 w-4" />
                  个人资料
                </button>
                
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    handleLogoutAll();
                  }}
                  disabled={isLoading}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 transition-colors disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />
                  全部登出
                </button>
                
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    handleLogout();
                  }}
                  disabled={isLoading}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />
                  {isLoading ? '登出中...' : '登出'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
