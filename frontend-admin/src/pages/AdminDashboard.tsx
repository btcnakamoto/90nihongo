import React, { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import SidebarToggle from "@/components/admin/SidebarToggle";
import StatsCard from "@/components/admin/StatsCard";
import UserActivityChart from "@/components/admin/UserActivityChart";
import ContentStatusChart from "@/components/admin/ContentStatusChart";
import RecentUsersList from "@/components/admin/RecentUsersList";
import NotificationsPanel from "@/components/admin/NotificationsPanel";
import TopCoursesTable from "@/components/admin/TopCoursesTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  BookOpen, 
  MessageSquare, 
  CheckCircle, 
  Bell, 
  LogOut, 
  ChevronDown,
  TrendingUp,
  BarChart3,
  Calendar,
  Database,
  Plus,
  Settings,
  Activity,
  Award,
  Target,
  Clock
} from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";

const AdminDashboard = () => {
  const { admin, logout, isLoading } = useAdminAuth();
  const { isCollapsed } = useSidebar();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 更新当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 每分钟更新一次

    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    if (window.confirm('确定要登出吗？')) {
      await logout();
    }
  };

  // 获取时间问候语
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "早上好";
    if (hour < 18) return "下午好";
    return "晚上好";
  };

  // 获取今天是星期几
  const getWeekday = () => {
    const weekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    return weekdays[currentTime.getDay()];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminSidebar activePath="/admin" />
      
      <div className={cn(
        "main-content overflow-auto",
        isCollapsed && "collapsed"
      )}>
        {/* 顶部导航栏 */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <SidebarToggle />
              <div>
                <h1 className="text-2xl font-bold text-nihongo-darkBlue">管理仪表盘</h1>
                <p className="text-sm text-nihongo-gray flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {currentTime.toLocaleDateString('zh-CN')} {getWeekday()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-nihongo-red text-white text-xs">
                  3
                </Badge>
              </Button>
              
              {/* 用户下拉菜单 */}
              <div className="relative">
                <button 
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-3 text-nihongo-gray hover:text-nihongo-darkBlue transition-colors p-2 rounded-lg hover:bg-gray-100"
                  disabled={isLoading}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-nihongo-indigo to-nihongo-blue flex items-center justify-center text-white font-medium shadow-lg">
                    {admin?.username?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-medium text-nihongo-darkBlue">
                      {admin?.username || '管理员'}
                    </p>
                    <p className="text-xs text-nihongo-gray">
                      {admin?.is_super_admin ? '超级管理员' : '管理员'}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {/* 下拉菜单 */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-20 animate-in slide-in-from-top-2">
                    <div className="py-2">
                      {/* 用户信息 */}
                      <div className="px-4 py-4 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-nihongo-indigo to-nihongo-blue flex items-center justify-center text-white font-medium">
                            {admin?.username?.charAt(0).toUpperCase() || 'A'}
                          </div>
                          <div>
                            <p className="font-medium text-nihongo-darkBlue">
                              {admin?.username || '管理员'}
                            </p>
                            <p className="text-xs text-nihongo-gray">
                              {admin?.email || 'admin@90nihongo.com'}
                            </p>
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {admin?.is_super_admin ? '超级管理员' : '管理员'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      {/* 菜单项 */}
                      <div className="px-2 py-2 space-y-1">
                        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-nihongo-gray hover:bg-gray-50 rounded-lg transition-colors">
                          <Settings className="h-4 w-4" />
                          个人设置
                        </button>
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            handleLogout();
                          }}
                          disabled={isLoading}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <LogOut className="h-4 w-4" />
                          {isLoading ? '登出中...' : '登出'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        
        <main className="px-6 py-6 space-y-8">
          {/* 欢迎区域 */}
          <div className="bg-gradient-to-r from-nihongo-indigo via-nihongo-blue to-nihongo-lightBlue rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    {getGreeting()}，{admin?.username || '管理员'}！
                  </h2>
                  <p className="text-white/80 text-lg mb-4">
                    欢迎回到90日语学习平台管理中心
                  </p>
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4" />
                      <span>系统运行正常</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>8,492 活跃用户</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4" />
                      <span>本周新增 128 用户</span>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <div className="flex space-x-3">
                    <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                      <Plus className="h-4 w-4 mr-2" />
                      添加内容
                    </Button>
                    <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      查看报告
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 装饰性元素 */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full"></div>
            <div className="absolute bottom-0 right-8 -mb-8 w-16 h-16 bg-white/5 rounded-full"></div>
          </div>

          {/* 增强的统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="用户总数"
              value="8,492"
              icon={<Users className="h-6 w-6" />}
              trend={{ value: 12, isPositive: true }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            />
            <StatsCard
              title="活跃课程"
              value="42"
              icon={<BookOpen className="h-6 w-6" />}
              trend={{ value: 5, isPositive: true }}
              className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            />
            <StatsCard
              title="社区帖子"
              value="1,254"
              icon={<MessageSquare className="h-6 w-6" />}
              trend={{ value: 8, isPositive: true }}
              className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            />
            <StatsCard
              title="今日完成课程"
              value="386"
              icon={<CheckCircle className="h-6 w-6" />}
              trend={{ value: 3, isPositive: false }}
              className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            />
          </div>

          {/* 快捷操作卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-nihongo-darkBlue">快捷操作</h3>
                <TrendingUp className="h-5 w-5 text-nihongo-indigo" />
              </div>
              <div className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  添加新课程
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  用户管理
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Database className="h-4 w-4 mr-2" />
                  数据库备份
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-nihongo-darkBlue">今日目标</h3>
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-nihongo-gray">用户注册</span>
                    <span className="text-sm font-medium">85/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-nihongo-gray">课程完成</span>
                    <span className="text-sm font-medium">120/150</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-nihongo-darkBlue">系统状态</h3>
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-nihongo-gray">服务器状态</span>
                  <Badge className="bg-green-100 text-green-800">正常</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-nihongo-gray">数据库</span>
                  <Badge className="bg-green-100 text-green-800">连接正常</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-nihongo-gray">备份状态</span>
                  <Badge className="bg-blue-100 text-blue-800">已完成</Badge>
                </div>
              </div>
            </div>
          </div>
          
          {/* 图表区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <UserActivityChart />
            </div>
            <div>
              <ContentStatusChart />
            </div>
          </div>
          
          {/* 列表区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RecentUsersList />
            </div>
            <div>
              <NotificationsPanel />
            </div>
          </div>
          
          {/* 表格区域 */}
          <div>
            <TopCoursesTable />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
