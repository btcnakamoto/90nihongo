import React from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import StatsCard from "@/components/admin/StatsCard";
import { Bell, Users, BookOpen, BarChart, CheckCircle } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart as RechartsBarChart, Bar } from "recharts";
import { useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";

// 模拟用户活跃度数据
const userActivityData = [
  { date: "周一", activeUsers: 120, completedLessons: 85 },
  { date: "周二", activeUsers: 132, completedLessons: 94 },
  { date: "周三", activeUsers: 145, completedLessons: 103 },
  { date: "周四", activeUsers: 150, completedLessons: 110 },
  { date: "周五", activeUsers: 170, completedLessons: 125 },
  { date: "周六", activeUsers: 190, completedLessons: 140 },
  { date: "周日", activeUsers: 185, completedLessons: 135 },
];

// 模拟内容参与度数据
const contentEngagementData = [
  { category: "听力训练", engagement: 85 },
  { category: "口语练习", engagement: 65 },
  { category: "词汇学习", engagement: 78 },
  { category: "语法练习", engagement: 62 },
  { category: "阅读理解", engagement: 70 },
  { category: "写作练习", engagement: 45 },
];

// 模拟用户留存率数据
const retentionData = [
  { month: "1月", retention: 95 },
  { month: "2月", retention: 85 },
  { month: "3月", retention: 78 },
  { month: "4月", retention: 74 },
  { month: "5月", retention: 72 },
  { month: "6月", retention: 70 },
];

const AdminAnalytics = () => {
  const { isCollapsed } = useSidebar();
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar activePath="/admin/analytics" />
      
      <div className={cn("main-content flex-1 overflow-auto", isCollapsed && "collapsed")}>
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-nihongo-darkBlue">数据分析</h1>
            <div className="flex items-center space-x-4">
              <button className="text-nihongo-gray hover:text-nihongo-darkBlue p-2 rounded-full hover:bg-gray-100 transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <div className="w-10 h-10 rounded-full bg-nihongo-indigo flex items-center justify-center text-white font-medium">
                A
              </div>
            </div>
          </div>
        </header>
        
        <main className="px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="活跃用户数"
              value="8,492"
              icon={<Users className="h-5 w-5" />}
              trend={{ value: 12, isPositive: true }}
            />
            <StatsCard
              title="内容总量"
              value="256"
              icon={<BookOpen className="h-5 w-5" />}
              trend={{ value: 5, isPositive: true }}
            />
            <StatsCard
              title="本周完成课程数"
              value="1,254"
              icon={<CheckCircle className="h-5 w-5" />}
              trend={{ value: 8, isPositive: true }}
            />
            <StatsCard
              title="平均学习时长"
              value="28分钟/天"
              icon={<BarChart className="h-5 w-5" />}
              trend={{ value: 3, isPositive: true }}
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* 用户活跃度趋势图 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-medium text-nihongo-gray">本周用户活跃度</h3>
                <div className="text-xs text-nihongo-gray">过去7天</div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "0.375rem" }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="activeUsers" name="活跃用户" stroke="#5B8AC1" strokeWidth={2} />
                  <Line type="monotone" dataKey="completedLessons" name="完成课程" stroke="#7BA696" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* 内容参与度统计图 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-medium text-nihongo-gray">内容参与度分析</h3>
                <div className="text-xs text-nihongo-gray">按内容类型</div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={contentEngagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "0.375rem" }}
                    formatter={(value) => [`${value}%`, "参与度"]}
                  />
                  <Legend />
                  <Bar dataKey="engagement" name="参与度" fill="#5B8AC1" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* 用户留存率图 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-medium text-nihongo-gray">用户留存率</h3>
                <div className="text-xs text-nihongo-gray">过去6个月</div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={retentionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "0.375rem" }}
                    formatter={(value) => [`${value}%`, "留存率"]}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="retention" name="留存率" stroke="#7BA696" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* 内容状态图表 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-medium text-nihongo-gray">学习进度分布</h3>
                <div className="text-xs text-nihongo-gray">全部用户</div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-nihongo-indigo">65%</div>
                  <div className="text-xs text-nihongo-gray mt-1">按计划学习</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-amber-500">22%</div>
                  <div className="text-xs text-nihongo-gray mt-1">学习延迟</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-500">13%</div>
                  <div className="text-xs text-nihongo-gray mt-1">提前学习</div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs text-nihongo-gray">JLPT水平提升</div>
                  <div className="text-xs font-medium">+28%</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-nihongo-indigo h-1.5 rounded-full" style={{ width: "28%" }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-medium text-nihongo-gray">学习瓶颈分析</h3>
              <div className="text-xs text-nihongo-gray">过去30天</div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-nihongo-gray">学习难点</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-nihongo-gray">影响用户数</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-nihongo-gray">平均学习时间</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-nihongo-gray">完成率</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-nihongo-gray">趋势</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-4 text-sm">助词 "は" 与 "が" 的区别</td>
                    <td className="px-4 py-4 text-sm">3,245</td>
                    <td className="px-4 py-4 text-sm">15分钟</td>
                    <td className="px-4 py-4 text-sm">68%</td>
                    <td className="px-4 py-4 text-sm text-red-500">↑ 5%</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-4 text-sm">动词て形变形规则</td>
                    <td className="px-4 py-4 text-sm">2,876</td>
                    <td className="px-4 py-4 text-sm">22分钟</td>
                    <td className="px-4 py-4 text-sm">72%</td>
                    <td className="px-4 py-4 text-sm text-green-500">↓ 3%</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-4 text-sm">敬语表达方式</td>
                    <td className="px-4 py-4 text-sm">2,154</td>
                    <td className="px-4 py-4 text-sm">30分钟</td>
                    <td className="px-4 py-4 text-sm">55%</td>
                    <td className="px-4 py-4 text-sm text-red-500">↑ 8%</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-4 text-sm">商务场景词汇</td>
                    <td className="px-4 py-4 text-sm">1,932</td>
                    <td className="px-4 py-4 text-sm">25分钟</td>
                    <td className="px-4 py-4 text-sm">63%</td>
                    <td className="px-4 py-4 text-sm text-green-500">↓ 2%</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-4 text-sm">日语语调与节奏</td>
                    <td className="px-4 py-4 text-sm">1,845</td>
                    <td className="px-4 py-4 text-sm">18分钟</td>
                    <td className="px-4 py-4 text-sm">70%</td>
                    <td className="px-4 py-4 text-sm text-red-500">↑ 4%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminAnalytics;
