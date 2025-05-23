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
  User,
  Database,
  Home,
  Shield,
  Activity,
  Layers,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useSidebar } from "@/contexts/SidebarContext";

interface SidebarItemProps {
  icon: React.ElementType;
  text: string;
  href: string;
  isActive?: boolean;
  count?: number;
}

const SidebarItem = ({ icon: Icon, text, href, isActive, count }: SidebarItemProps) => {
  const { isCollapsed } = useSidebar();

  return (
    <Link
      to={href}
      className={cn(
        "sidebar-item group flex items-center gap-3 rounded-xl px-4 py-3 text-sm relative transition-all duration-200",
        "tooltip-trigger",
        isActive 
          ? "active bg-gradient-to-r from-nihongo-indigo to-nihongo-blue text-white shadow-lg" 
          : "text-gray-600 hover:text-nihongo-darkBlue hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100"
      )}
      data-tooltip={text}
    >
      {/* 激活状态的左侧指示条 */}
      {isActive && !isCollapsed && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
      )}
      
      <Icon className={cn(
        "sidebar-icon h-5 w-5 flex-shrink-0 transition-all duration-200",
        isActive ? "text-white" : "text-gray-500 group-hover:text-nihongo-indigo"
      )} />
      
      {!isCollapsed && (
        <>
          <span className={cn(
            "font-medium transition-all duration-200",
            isActive ? "text-white" : "group-hover:text-nihongo-darkBlue"
          )}>
            {text}
          </span>
          
          {/* 数量徽章 - 展开状态 */}
          {count && count > 0 && (
            <span className={cn(
              "ml-auto px-2 py-1 text-xs font-bold rounded-full transition-all duration-200",
              isActive 
                ? "bg-white/20 text-white" 
                : "bg-nihongo-red text-white"
            )}>
              {count}
            </span>
          )}
          
          {/* 悬停时的右侧箭头 - 展开状态 */}
          {!isActive && (
            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-all duration-200">
              <div className="w-1.5 h-1.5 rounded-full bg-nihongo-indigo"></div>
            </div>
          )}
        </>
      )}

      {/* 收起状态下不显示任何徽章 */}
    </Link>
  );
};

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
}

const SidebarSection = ({ title, children }: SidebarSectionProps) => {
  return (
    <div className="space-y-2">
      <h3 className="section-title px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {title}
      </h3>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
};

interface AdminSidebarProps {
  activePath: string;
}

const AdminSidebar = ({ activePath }: AdminSidebarProps) => {
  const { admin, logout, logoutAll, isLoading } = useAdminAuth();
  const { isCollapsed } = useSidebar();
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
    <div className={cn(
      "admin-sidebar fixed left-0 top-0 h-screen bg-gradient-to-b from-white to-gray-50/50 border-r border-gray-200/50 sidebar-shadow z-30",
      isCollapsed && "collapsed"
    )}>
      <div className="sidebar-content h-full flex flex-col">
        {/* Logo区域 */}
        <div className={cn(
          "logo-area p-6 border-b border-gray-200/50 flex-shrink-0",
          isCollapsed ? "flex justify-center" : "flex items-center gap-3"
        )}>
          {isCollapsed ? (
            <div className="logo-icon">
              90
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-nihongo-indigo to-nihongo-blue flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">90</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-nihongo-darkBlue">
                  日语管理系统
                </h2>
                <p className="text-xs text-gray-500">
                  90天学习计划
                </p>
              </div>
            </>
          )}
        </div>

        {/* 导航区域 - 可滚动 */}
        <nav className={cn(
          "nav-area flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400",
          isCollapsed ? "space-y-2" : "space-y-6"
        )} 
        style={{ height: 'calc(100vh - 200px)' }}>
          {/* 主要功能 */}
          <SidebarSection title="主要功能">
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
              count={128}
            />
            <SidebarItem 
              icon={BookOpen} 
              text="内容管理" 
              href="/admin/content" 
              isActive={activePath === "/admin/content"} 
            />
            <SidebarItem 
              icon={MessageSquare} 
              text="社区管理" 
              href="/admin/community" 
              isActive={activePath === "/admin/community"}
              count={5}
            />
          </SidebarSection>

          {/* 数据分析 */}
          <SidebarSection title="数据分析">
            <SidebarItem 
              icon={BarChart} 
              text="数据分析" 
              href="/admin/analytics" 
              isActive={activePath === "/admin/analytics"} 
            />
            <SidebarItem 
              icon={FileText} 
              text="报告中心" 
              href="/admin/reports" 
              isActive={activePath === "/admin/reports"} 
            />
            <SidebarItem 
              icon={Activity} 
              text="实时监控" 
              href="/admin/monitoring" 
              isActive={activePath === "/admin/monitoring"} 
            />
          </SidebarSection>

          {/* 系统管理 */}
          <SidebarSection title="系统管理">
            <SidebarItem 
              icon={Database} 
              text="数据库备份" 
              href="/admin/database" 
              isActive={activePath === "/admin/database"} 
            />
            <SidebarItem 
              icon={Bell} 
              text="通知设置" 
              href="/admin/notifications" 
              isActive={activePath === "/admin/notifications"}
              count={3}
            />
            <SidebarItem 
              icon={Settings} 
              text="系统设置" 
              href="/admin/settings" 
              isActive={activePath === "/admin/settings"} 
            />
          </SidebarSection>

          {/* 帮助支持 */}
          <SidebarSection title="帮助支持">
            <SidebarItem 
              icon={HelpCircle} 
              text="帮助文档" 
              href="/admin/help" 
              isActive={activePath === "/admin/help"} 
            />
          </SidebarSection>
        </nav>
        
        {/* 用户信息区域 - 固定在底部 */}
        <div className={cn(
          "user-area absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-transparent backdrop-blur-sm",
          isCollapsed && "flex justify-center"
        )}>
          <div className="relative">
            {isCollapsed ? (
              <div 
                className="user-avatar tooltip-trigger"
                data-tooltip={admin?.username || '管理员'}
                onClick={() => !isCollapsed && setShowUserMenu(!showUserMenu)}
              >
                {admin?.username?.charAt(0).toUpperCase() || 'A'}
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/80 transition-all duration-200 group"
                  disabled={isLoading}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-nihongo-indigo to-nihongo-blue flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-xl transition-all duration-200">
                    {admin?.username?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-nihongo-darkBlue">
                      {admin?.username || '管理员'}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {admin?.is_super_admin ? '超级管理员' : '管理员'}
                    </p>
                  </div>
                  <div className="text-gray-400 group-hover:text-nihongo-indigo transition-colors duration-200">
                    {showUserMenu ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </button>

                {/* 用户下拉菜单 */}
                {showUserMenu && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200/50 rounded-xl shadow-xl z-20 overflow-hidden animate-in slide-in-from-bottom-2">
                    <div className="py-2">
                      {/* 用户信息头部 */}
                      <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-nihongo-indigo to-nihongo-blue flex items-center justify-center text-white font-medium text-sm">
                            {admin?.username?.charAt(0).toUpperCase() || 'A'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-nihongo-darkBlue">
                              {admin?.username || '管理员'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {admin?.email || 'admin@90nihongo.com'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* 菜单项 */}
                      <div className="px-2 py-2 space-y-1">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            // 可以添加个人资料页面导航
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-nihongo-darkBlue rounded-lg transition-all duration-200 group"
                        >
                          <User className="h-4 w-4 group-hover:text-nihongo-indigo" />
                          个人资料
                        </button>
                        
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            handleLogoutAll();
                          }}
                          disabled={isLoading}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 disabled:opacity-50 group"
                        >
                          <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
                          全部设备登出
                        </button>
                        
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            handleLogout();
                          }}
                          disabled={isLoading}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50 group"
                        >
                          <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
                          {isLoading ? '登出中...' : '登出'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
