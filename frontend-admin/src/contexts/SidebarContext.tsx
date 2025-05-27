import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  toggle: () => void;
  expandedMenus: Set<string>;
  toggleMenu: (menuKey: string) => void;
  isMenuExpanded: (menuKey: string) => boolean;
  scrollPosition: number;
  setScrollPosition: (position: number) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

interface SidebarProviderProps {
  children: React.ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  // 从localStorage读取用户偏好，默认展开
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('admin-sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // 管理展开的菜单项
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('admin-sidebar-expanded-menus');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // 管理侧边栏滚动位置
  const [scrollPosition, setScrollPosition] = useState<number>(() => {
    const saved = localStorage.getItem('admin-sidebar-scroll-position');
    return saved ? JSON.parse(saved) : 0;
  });

  // 保存用户偏好到localStorage
  useEffect(() => {
    localStorage.setItem('admin-sidebar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  // 保存展开菜单状态到localStorage
  useEffect(() => {
    localStorage.setItem('admin-sidebar-expanded-menus', JSON.stringify(Array.from(expandedMenus)));
  }, [expandedMenus]);

  // 防抖保存滚动位置到localStorage
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('admin-sidebar-scroll-position', JSON.stringify(scrollPosition));
    }, 300); // 300ms 防抖延迟

    return () => clearTimeout(timeoutId);
  }, [scrollPosition]);

  const toggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMenu = (menuKey: string) => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(menuKey)) {
        newSet.delete(menuKey);
      } else {
        newSet.add(menuKey);
      }
      return newSet;
    });
  };

  const isMenuExpanded = (menuKey: string) => {
    return expandedMenus.has(menuKey);
  };

  return (
    <SidebarContext.Provider value={{ 
      isCollapsed, 
      setIsCollapsed, 
      toggle, 
      expandedMenus, 
      toggleMenu, 
      isMenuExpanded,
      scrollPosition,
      setScrollPosition
    }}>
      {children}
    </SidebarContext.Provider>
  );
}; 