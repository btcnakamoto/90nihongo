import React, { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import StatsCard from "@/components/admin/StatsCard";
import UserActivityChart from "@/components/admin/UserActivityChart";
import ContentStatusChart from "@/components/admin/ContentStatusChart";
import RecentUsersList from "@/components/admin/RecentUsersList";
import NotificationsPanel from "@/components/admin/NotificationsPanel";
import TopCoursesTable from "@/components/admin/TopCoursesTable";
import { Users, BookOpen, MessageSquare, CheckCircle, Bell, LogOut, ChevronDown } from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

const AdminDashboard = () => {
  const { admin, logout, isLoading } = useAdminAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const handleLogout = async () => {
    if (window.confirm('确定要登出吗？')) {
      await logout();
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar activePath="/admin" />
      
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-nihongo-darkBlue">管理仪表盘</h1>
            <div className="flex items-center space-x-4">
              <button className="text-nihongo-gray hover:text-nihongo-darkBlue p-2 rounded-full hover:bg-gray-100 transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              
              {/* 用户下拉菜单 */}
              <div className="relative">
                <button 
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-2 text-nihongo-gray hover:text-nihongo-darkBlue transition-colors"
                  disabled={isLoading}
                >
                  <div className="w-10 h-10 rounded-full bg-nihongo-indigo flex items-center justify-center text-white font-medium">
                    {admin?.username?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {/* 下拉菜单 */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <div className="py-2">
                      {/* 用户信息 */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-nihongo-darkBlue">
                          {admin?.username || '管理员'}
                        </p>
                        <p className="text-xs text-nihongo-gray">
                          {admin?.email || 'admin@90nihongo.com'}
                        </p>
                        <p className="text-xs text-nihongo-gray mt-1">
                          {admin?.is_super_admin ? '超级管理员' : '管理员'}
                        </p>
                      </div>
                      
                      {/* 登出按钮 */}
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          handleLogout();
                        }}
                        disabled={isLoading}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
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
        </header>
        
        <main className="px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="用户总数"
              value="8,492"
              icon={<Users className="h-5 w-5" />}
              trend={{ value: 12, isPositive: true }}
            />
            <StatsCard
              title="活跃课程"
              value="42"
              icon={<BookOpen className="h-5 w-5" />}
              trend={{ value: 5, isPositive: true }}
            />
            <StatsCard
              title="社区帖子"
              value="1,254"
              icon={<MessageSquare className="h-5 w-5" />}
              trend={{ value: 8, isPositive: true }}
            />
            <StatsCard
              title="今日已完成课程"
              value="386"
              icon={<CheckCircle className="h-5 w-5" />}
              trend={{ value: 3, isPositive: false }}
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <UserActivityChart />
            </div>
            <div>
              <ContentStatusChart />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <RecentUsersList />
            </div>
            <div>
              <NotificationsPanel />
            </div>
          </div>
          
          <div className="mb-8">
            <TopCoursesTable />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
