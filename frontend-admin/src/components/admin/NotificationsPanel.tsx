
import React from "react";
import { Bell, Users, FileText, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Sample notifications - in a real application, these would come from an API
const notifications = [
  {
    id: 1,
    type: "user",
    message: "5名新注册用户等待审批",
    time: "10分钟前",
    isNew: true,
  },
  {
    id: 2,
    type: "content",
    message: "课程「自我介绍大师」已在草稿状态3天",
    time: "2小时前",
    isNew: true,
  },
  {
    id: 3,
    type: "alert",
    message: "系统需要备份",
    time: "1天前",
    isNew: false,
  },
  {
    id: 4,
    type: "user",
    message: "用户「张三」请求支持",
    time: "2天前",
    isNew: false,
  },
];

const getIcon = (type: string) => {
  switch (type) {
    case "user":
      return <Users className="w-4 h-4" />;
    case "content":
      return <FileText className="w-4 h-4" />;
    case "alert":
      return <AlertCircle className="w-4 h-4" />;
    default:
      return <Bell className="w-4 h-4" />;
  }
};

const getIconColor = (type: string) => {
  switch (type) {
    case "user":
      return "bg-nihongo-indigo text-white";
    case "content":
      return "bg-nihongo-green text-white";
    case "alert":
      return "bg-nihongo-red text-white";
    default:
      return "bg-nihongo-gray text-white";
  }
};

const NotificationsPanel = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-medium text-nihongo-darkBlue">最新通知</h3>
        <span className="text-xs bg-nihongo-red text-white rounded-full px-2 py-1">
          {notifications.filter(n => n.isNew).length} 新通知
        </span>
      </div>
      <div className="divide-y divide-gray-200">
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className={cn(
              "p-4 hover:bg-gray-50",
              notification.isNew && "bg-nihongo-lightBlue bg-opacity-30"
            )}
          >
            <div className="flex items-start">
              <div className={cn("p-2 rounded-full mr-3", getIconColor(notification.type))}>
                {getIcon(notification.type)}
              </div>
              <div className="flex-1">
                <p className="text-sm text-nihongo-darkBlue">{notification.message}</p>
                <p className="text-xs text-nihongo-gray mt-1">{notification.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-gray-200">
        <button className="text-sm text-nihongo-indigo font-medium hover:text-nihongo-red transition-colors">
          查看所有通知 →
        </button>
      </div>
    </div>
  );
};

export default NotificationsPanel;
