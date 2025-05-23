
import React from "react";

// Sample course data - in a real application, this would come from an API
const courses = [
  {
    id: 1,
    name: "日常会话精通",
    users: 1245,
    completion: 76,
    ratings: 4.8,
  },
  {
    id: 2,
    name: "商务日语入门",
    users: 987,
    completion: 82,
    ratings: 4.6,
  },
  {
    id: 3,
    name: "日本文化与语言",
    users: 820,
    completion: 68,
    ratings: 4.9,
  },
  {
    id: 4,
    name: "JLPT N3备考课程",
    users: 1130,
    completion: 73,
    ratings: 4.7,
  },
  {
    id: 5,
    name: "动漫日语学习",
    users: 1540,
    completion: 85,
    ratings: 4.9,
  },
];

const TopCoursesTable = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-sm font-medium text-nihongo-darkBlue">热门课程</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-xs font-medium text-nihongo-gray bg-gray-50">
              <th className="px-6 py-3 text-left">课程名称</th>
              <th className="px-6 py-3 text-right">用户数</th>
              <th className="px-6 py-3 text-right">完成率</th>
              <th className="px-6 py-3 text-right">评分</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-nihongo-darkBlue">{course.name}</p>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm text-nihongo-gray">{course.users.toLocaleString()}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm text-nihongo-gray">{course.completion}%</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end">
                    <span className="text-sm font-medium text-nihongo-green">{course.ratings}</span>
                    <span className="ml-1 text-nihongo-green">★</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-gray-200">
        <button className="text-sm text-nihongo-indigo font-medium hover:text-nihongo-red transition-colors">
          查看所有课程 →
        </button>
      </div>
    </div>
  );
};

export default TopCoursesTable;
