import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import SidebarToggle from "./SidebarToggle";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { cn } from "@/lib/utils";
import {
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Shield,
  ChevronRight,
  Home,
  Users,
  BookOpen,
  BarChart,
  MessageSquare,
    Database,  HelpCircle,  Activity,  FileText,  Download,  type LucideIcon
} from "lucide-react";

// 路由配置，用于生成面包屑
const routeConfig: Record<string, { title: string; icon: LucideIcon }> = {
  "/admin": { title: "仪表盘", icon: Home },
  "/admin/users": { title: "用户管理", icon: Users },
    "/admin/content": { title: "内容管理", icon: BookOpen },  "/admin/analytics": { title: "数据分析", icon: BarChart },  "/admin/community": { title: "社区管理", icon: MessageSquare },  "/admin/resources": { title: "资源管理", icon: Download },
  "/admin/reports": { title: "报告中心", icon: FileText },
  "/admin/monitoring": { title: "实时监控", icon: Activity },
  "/admin/database": { title: "数据库备份", icon: Database },
  "/admin/notifications": { title: "通知设置", icon: Bell },
  "/admin/settings": { title: "系统设置", icon: Settings },
  "/admin/help": { title: "帮助文档", icon: HelpCircle },
};

// 模拟通知数据
const mockNotifications = [
  {
    id: 1,
    title: "新用户注册",
    message: "张三刚刚注册了账户",
    time: "2分钟前",
    isRead: false,
    type: "user"
  },
  {
    id: 2,
    title: "系统更新",
    message: "系统将在今晚23:00进行维护更新",
    time: "1小时前",
    isRead: false,
    type: "system"
  },
  {
    id: 3,
    title: "数据备份完成",
    message: "今日数据备份已成功完成",
    time: "3小时前",
    isRead: true,
    type: "backup"
  },
  {
    id: 4,
    title: "用户反馈",
    message: "收到了5条新的用户反馈",
    time: "5小时前",
    isRead: true,
    type: "feedback"
  }
];

const TopNavbar = () => {
  const location = useLocation();
  const { admin, logout, logoutAll, isLoading } = useAdminAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  // 生成面包屑导航
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ path: '/admin', title: '首页', icon: Home }];
    
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const config = routeConfig[currentPath];
      if (config && currentPath !== '/admin') {
        breadcrumbs.push({
          path: currentPath,
          title: config.title,
          icon: config.icon
        });
      }
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();
  const unreadCount = mockNotifications.filter(n => !n.isRead).length;

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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="h-4 w-4 text-blue-500" />;
      case 'system': return <Settings className="h-4 w-4 text-orange-500" />;
      case 'backup': return <Database className="h-4 w-4 text-green-500" />;
      case 'feedback': return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-16 items-center justify-between px-6">
        {/* 左侧：侧边栏切换 + Logo + 面包屑 */}
        <div className="flex items-center gap-4">
          <SidebarToggle />
          
          {/* Logo */}
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-nihongo-indigo to-nihongo-blue flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">90</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-nihongo-darkBlue">90日语管理系统</h1>
            </div>
          </Link>

          {/* 面包屑导航 */}
          <nav className="hidden md:flex items-center gap-2 ml-4">
            {breadcrumbs.map((crumb, index) => {
              const Icon = crumb.icon;
              const isLast = index === breadcrumbs.length - 1;
              
              return (
                <div key={crumb.path} className="flex items-center gap-2">
                  {index > 0 && (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                  <Link
                    to={crumb.path}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-md text-sm transition-colors",
                      isLast 
                        ? "text-nihongo-indigo font-medium bg-nihongo-indigo/10" 
                        : "text-gray-600 hover:text-nihongo-darkBlue hover:bg-gray-100"
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    {crumb.title}
                  </Link>
                </div>
              );
            })}
          </nav>
        </div>

        {/* 中间：全局搜索 (隐藏在小屏幕) */}
        <div className="hidden lg:flex items-center gap-4 flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="全局搜索用户、内容..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
        </div>

        {/* 右侧：通知 + 用户菜单 */}
        <div className="flex items-center gap-3">
          {/* 通知 */}
          <Popover open={showNotifications} onOpenChange={setShowNotifications}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">通知中心</h3>
                  <Badge variant="secondary" className="text-xs">
                    {unreadCount} 条未读
                  </Badge>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {mockNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors",
                      !notification.isRead && "bg-blue-50/50"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {notification.title}
                          </p>
                          <span className="text-xs text-gray-500 ml-2">
                            {notification.time}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t">
                <Button variant="ghost" size="sm" className="w-full text-center">
                  查看全部通知
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* 用户菜单 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-nihongo-indigo to-nihongo-blue flex items-center justify-center text-white font-medium text-sm">
                  {admin?.username?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {admin?.username || '管理员'}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    {admin?.is_super_admin ? '超级管理员' : '管理员'}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-nihongo-indigo to-nihongo-blue flex items-center justify-center text-white font-medium text-sm">
                    {admin?.username?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {admin?.username || '管理员'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {admin?.email || 'admin@90nihongo.com'}
                    </p>
                  </div>
                </div>
              </div>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                个人资料
              </DropdownMenuItem>
              
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                系统设置
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={handleLogoutAll}
                disabled={isLoading}
                className="text-orange-600 focus:text-orange-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                全部设备登出
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={handleLogout}
                disabled={isLoading}
                className="text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isLoading ? '登出中...' : '登出'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar; 