
import { useState, useEffect } from 'react';

interface DayProgressProps {
  currentDay: number;
  totalDays: number;
}

const DayProgress = ({ currentDay, totalDays }: DayProgressProps) => {
  const [progress, setProgress] = useState(0);
  
  // 计算进度百分比
  useEffect(() => {
    const calculateProgress = () => {
      const percentage = (currentDay / totalDays) * 100;
      setProgress(percentage);
    };
    
    calculateProgress();
  }, [currentDay, totalDays]);

  // SVG圆环半径和周长计算，用于进度环
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {/* SVG进度环 */}
        <svg width="100" height="100" className="progress-ring">
          {/* 背景圆 */}
          <circle
            stroke="#e6e6e6"
            strokeWidth="8"
            fill="transparent"
            r={radius}
            cx="50"
            cy="50"
          />
          {/* 进度圆 */}
          <circle
            stroke="url(#progressGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            fill="transparent"
            r={radius}
            cx="50"
            cy="50"
          />
          {/* 渐变定义 */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#293B97" />
              <stop offset="100%" stopColor="#EA698B" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* 中间的天数计数 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-japan-navy">{currentDay}</span>
          <span className="text-xs text-japan-stone">/ {totalDays}</span>
        </div>
      </div>
      
      <div className="mt-3 text-center">
        <div className="text-sm font-medium">日目</div>
        <div className="text-xs text-japan-stone">天</div>
      </div>
    </div>
  );
};

export default DayProgress;
