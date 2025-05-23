import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';

interface SidebarToggleProps {
  className?: string;
}

const SidebarToggle: React.FC<SidebarToggleProps> = ({ className }) => {
  const { isCollapsed, toggle } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      className={cn(
        "h-9 w-9 p-0 hover:bg-gray-100 transition-colors duration-200",
        className
      )}
      title={isCollapsed ? "展开侧边栏" : "收起侧边栏"}
    >
      <div className="relative">
        <Menu 
          className={cn(
            "h-4 w-4 transition-all duration-200",
            isCollapsed ? "opacity-100 rotate-0" : "opacity-0 rotate-90"
          )} 
        />
        <X 
          className={cn(
            "h-4 w-4 absolute inset-0 transition-all duration-200",
            isCollapsed ? "opacity-0 rotate-90" : "opacity-100 rotate-0"
          )} 
        />
      </div>
    </Button>
  );
};

export default SidebarToggle; 