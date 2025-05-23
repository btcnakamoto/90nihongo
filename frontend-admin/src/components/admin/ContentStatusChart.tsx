
import React from "react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip 
} from "recharts";

// Sample data - in a real application, this would come from an API
const data = [
  { name: "已发布", value: 65 },
  { name: "审核中", value: 15 },
  { name: "草稿", value: 20 },
];

const COLORS = ["#7BA696", "#5B8AC1", "#D6CFC7"];

const ContentStatusChart = () => {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-[350px]">
      <h3 className="text-sm font-medium text-nihongo-gray mb-4">内容状态</h3>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${value}个`, undefined]}
            contentStyle={{ 
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "0.375rem"
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => <span className="text-sm text-nihongo-darkBlue">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ContentStatusChart;
