
import React from "react";
import { cn } from "@/lib/utils";

// Sample user data - in a real application, this would come from an API
const users = [
  {
    id: 1,
    name: "张伟",
    email: "zhangwei@example.com",
    progress: 78,
    lastActive: "1小时前",
    level: "N3→N2",
  },
  {
    id: 2,
    name: "李娜",
    email: "lina@example.com",
    progress: 65,
    lastActive: "3小时前",
    level: "N4→N3",
  },
  {
    id: 3,
    name: "王强",
    email: "wangqiang@example.com",
    progress: 92,
    lastActive: "30分钟前",
    level: "N2→N1",
  },
  {
    id: 4,
    name: "刘洋",
    email: "liuyang@example.com",
    progress: 45,
    lastActive: "2天前",
    level: "N3→N2",
  },
  {
    id: 5,
    name: "赵敏",
    email: "zhaomin@example.com",
    progress: 84,
    lastActive: "45分钟前",
    level: "N3→N2",
  },
];

const RecentUsersList = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-sm font-medium text-nihongo-darkBlue">最近活跃用户</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-xs font-medium text-nihongo-gray bg-gray-50">
              <th className="px-6 py-3 text-left">用户</th>
              <th className="px-6 py-3 text-left">等级</th>
              <th className="px-6 py-3 text-left">进度</th>
              <th className="px-6 py-3 text-left">最后活跃</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-nihongo-beige flex items-center justify-center text-nihongo-darkBlue font-medium">
                      {user.name.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-nihongo-darkBlue">{user.name}</p>
                      <p className="text-xs text-nihongo-gray">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-nihongo-indigo font-medium">{user.level}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className={cn(
                          "h-2 rounded-full",
                          user.progress >= 80 ? "bg-nihongo-green" :
                          user.progress >= 60 ? "bg-nihongo-indigo" : "bg-nihongo-red"
                        )}
                        style={{ width: `${user.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-nihongo-gray">{user.progress}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-nihongo-gray">{user.lastActive}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-gray-200">
        <button className="text-sm text-nihongo-indigo font-medium hover:text-nihongo-red transition-colors">
          查看所有用户 →
        </button>
      </div>
    </div>
  );
};

export default RecentUsersList;
