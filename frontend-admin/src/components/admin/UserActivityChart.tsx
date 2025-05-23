import React from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from "recharts";

// Sample data - in a real application, this would come from an API
const data = [
  { date: "5/14", activeUsers: 400, completedLessons: 240 },
  { date: "5/15", activeUsers: 430, completedLessons: 250 },
  { date: "5/16", activeUsers: 450, completedLessons: 270 },
  { date: "5/17", activeUsers: 470, completedLessons: 280 },
  { date: "5/18", activeUsers: 540, completedLessons: 310 },
  { date: "5/19", activeUsers: 580, completedLessons: 350 },
  { date: "5/20", activeUsers: 620, completedLessons: 380 },
];

const UserActivityChart = () => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-[380px] hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-nihongo-darkBlue mb-1">用户活动趋势</h3>
          <p className="text-sm text-nihongo-gray">最近7天的用户活跃度和课程完成情况</p>
        </div>
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-nihongo-indigo"></div>
            <span className="text-nihongo-gray">活跃用户</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-nihongo-gray">完成课程</span>
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="colorActiveUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#5B8AC1" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#5B8AC1" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorCompletedLessons" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" opacity={0.6} />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={{ stroke: '#e2e8f0' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={{ stroke: '#e2e8f0' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "0.75rem",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              fontSize: "12px"
            }}
            labelStyle={{ color: '#1e293b', fontWeight: '500' }}
          />
          <Line
            type="monotone"
            dataKey="activeUsers"
            stroke="#5B8AC1"
            strokeWidth={3}
            name="活跃用户"
            dot={{ r: 4, fill: "#5B8AC1", strokeWidth: 2, stroke: "white" }}
            activeDot={{ r: 6, fill: "#5B8AC1", strokeWidth: 2, stroke: "white" }}
            fill="url(#colorActiveUsers)"
          />
          <Line
            type="monotone"
            dataKey="completedLessons"
            stroke="#10B981"
            strokeWidth={3}
            name="完成课程"
            dot={{ r: 4, fill: "#10B981", strokeWidth: 2, stroke: "white" }}
            activeDot={{ r: 6, fill: "#10B981", strokeWidth: 2, stroke: "white" }}
            fill="url(#colorCompletedLessons)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UserActivityChart;
