
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
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-[350px]">
      <h3 className="text-sm font-medium text-nihongo-gray mb-4">ユーザーアクティビティ</h3>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "0.375rem"
            }} 
          />
          <Legend verticalAlign="top" height={36} />
          <Line
            type="monotone"
            dataKey="activeUsers"
            stroke="#5B8AC1"
            strokeWidth={2}
            name="アクティブユーザー"
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="completedLessons"
            stroke="#7BA696"
            strokeWidth={2}
            name="完了レッスン"
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UserActivityChart;
