
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', label: 'ダッシュボード', english: 'Dashboard' },
    { path: '/daily', label: '今日の学習', english: 'Today\'s Lesson' },
    { path: '/vocabulary', label: '語彙', english: 'Vocabulary' },
    { path: '/listening', label: '聴解', english: 'Listening' },
    { path: '/speaking', label: '会話', english: 'Speaking' },
    { path: '/landing', label: '登录页面', english: 'Landing Page' }
  ];

  return (
    <nav className="bg-white border-b border-gray-200 py-4 px-6 shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-japan-indigo text-white flex items-center justify-center">
            <span className="font-display font-bold text-lg">日</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-display font-bold text-japan-navy">90エコーかな</span>
            <span className="text-xs text-japan-stone">90-Day Japanese</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "group flex flex-col items-center",
                isActive(item.path) ? "text-japan-indigo" : "text-gray-600 hover:text-japan-pink"
              )}
            >
              <span className="japanese-text text-sm">{item.label}</span>
              <span className="text-xs opacity-70">{item.english}</span>
              {isActive(item.path) && (
                <div className="h-1 w-1/2 bg-japan-indigo rounded-full mt-1"></div>
              )}
            </Link>
          ))}
        </div>

        {/* User Menu */}
        <div className="flex items-center space-x-3">
          <button className="bg-japan-cream hover:bg-gray-100 rounded-full p-2 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-japan-navy">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </button>
          
          <button className="hidden md:block bg-japan-pink hover:bg-japan-pink/90 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center transition-colors">
            <span className="font-medium">A</span>
          </button>
          
          {/* Mobile menu button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden bg-japan-cream hover:bg-gray-100 rounded-full p-2 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-japan-navy">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 py-2 bg-white border-t border-gray-100">
          <div className="container mx-auto flex flex-col space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-4 py-2 rounded-md",
                  isActive(item.path) 
                    ? "bg-japan-cream text-japan-indigo" 
                    : "text-gray-600 hover:bg-gray-50"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <span className="japanese-text">{item.label}</span>
                  <span className="text-xs ml-2 opacity-70">({item.english})</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
