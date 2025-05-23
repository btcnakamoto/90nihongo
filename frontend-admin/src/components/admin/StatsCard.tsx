
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
    <div className={cn("bg-white p-6 rounded-lg border border-gray-200 shadow-sm", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-nihongo-gray">{title}</h3>
        <div className="text-nihongo-indigo">{icon}</div>
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold text-nihongo-darkBlue">{value}</p>
        {description && (
          <p className="text-sm text-nihongo-gray mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <span
              className={cn(
                "text-xs font-medium inline-flex items-center",
                trend.isPositive ? "text-green-600" : "text-nihongo-red"
              )}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-nihongo-gray ml-2">前週比</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
