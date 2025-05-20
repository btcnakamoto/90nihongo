
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface StudyCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  color?: 'indigo' | 'pink' | 'red' | 'navy' | 'cream';
  progress?: number;
  link: string;
  description?: string;
  completed?: boolean;
  className?: string;
}

const StudyCard = ({
  title,
  subtitle,
  icon,
  color = 'indigo',
  progress,
  link,
  description,
  completed = false,
  className
}: StudyCardProps) => {
  
  const colorClasses = {
    indigo: 'from-japan-indigo to-blue-400',
    pink: 'from-japan-pink to-pink-400',
    red: 'from-japan-red to-red-400',
    navy: 'from-japan-navy to-blue-800',
    cream: 'from-japan-cream to-yellow-100'
  };
  
  const borderClasses = {
    indigo: 'border-japan-indigo/20',
    pink: 'border-japan-pink/20',
    red: 'border-japan-red/20',
    navy: 'border-japan-navy/20',
    cream: 'border-gray-200'
  };
  
  return (
    <Link 
      to={link}
      className={cn(
        "paper-card group relative flex flex-col h-full",
        borderClasses[color],
        completed ? 'opacity-75' : '',
        className
      )}
    >
      {/* Header with gradient background */}
      <div className={`p-4 bg-gradient-to-br ${colorClasses[color]} text-white rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <h3 className="font-display font-medium text-lg">{title}</h3>
          {icon && <div className="text-white/90">{icon}</div>}
        </div>
        {subtitle && <p className="text-sm opacity-90">{subtitle}</p>}
      </div>
      
      {/* Body content */}
      <div className="p-4 flex-grow">
        {description && <p className="text-sm text-gray-600">{description}</p>}
        
        {/* Progress indicator */}
        {typeof progress === 'number' && (
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-japan-stone">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${colorClasses[color]}`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Status indicator */}
      {completed && (
        <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
      )}
      
      {/* Hover effect */}
      <div className="absolute inset-0 rounded-lg border-2 border-transparent transition-colors group-hover:border-japan-pink/30 pointer-events-none"></div>
    </Link>
  );
};

export default StudyCard;
