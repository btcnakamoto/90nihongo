import React from "react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const StatsCard = ({
  title,
  value,
  icon,
  description,
  trend,
  className,
}: StatsCardProps) => {
  return (
    <div className={cn(
      "bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group",
      "transition-all duration-300 ease-in-out",
      "hover:shadow-xl hover:-translate-y-1",
      className
    )}>
      {/* 背景装饰 */}
      <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 bg-gradient-to-br from-white/20 to-transparent rounded-full opacity-60"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-nihongo-gray group-hover:text-nihongo-darkBlue transition-colors">
            {title}
          </h3>
          <div className="p-2 rounded-lg bg-white/50 text-nihongo-indigo group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        </div>
        
        <div>
          <p className="text-3xl font-bold text-nihongo-darkBlue mb-2 group-hover:text-nihongo-indigo transition-colors">
            {value}
          </p>
          
          {description && (
            <p className="text-sm text-nihongo-gray mb-2">{description}</p>
          )}
          
          {trend && (
            <div className="flex items-center">
              <span
                className={cn(
                  "text-sm font-medium inline-flex items-center px-2 py-1 rounded-full",
                  trend.isPositive 
                    ? "text-green-700 bg-green-100" 
                    : "text-red-700 bg-red-100"
                )}
              >
                <span className="mr-1 text-xs">
                  {trend.isPositive ? "↗" : "↘"}
                </span>
                {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-nihongo-gray ml-2">较上周</span>
            </div>
          )}
        </div>
      </div>
      
      {/* 底部装饰线 */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-nihongo-indigo/20 via-nihongo-blue/20 to-nihongo-lightBlue/20 group-hover:from-nihongo-indigo group-hover:via-nihongo-blue group-hover:to-nihongo-lightBlue transition-all duration-300"></div>
    </div>
  );
};

export default StatsCard;
