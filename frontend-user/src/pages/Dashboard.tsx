import { useState } from 'react';
import { Link } from 'react-router-dom';
import DayProgress from '@/components/DayProgress';
import LearningPath from '@/components/LearningPath';
import StudyCard from '@/components/StudyCard';

const Dashboard = () => {
  // In a real app, these would come from API/user data
  const [currentDay, setCurrentDay] = useState(5);
  const totalDays = 90;
  
  // Today's study stats
  const todayCompleted = 2;
  const todayTotal = 4;
  const todayPercentage = (todayCompleted / todayTotal) * 100;
  
  // Study modules
  const studyModules = [
    {
      title: "听力练习",
      subtitle: "听力训练",
      description: "通过餐厅场景对话训练日语听力理解能力。",
      progress: 50,
      link: "/listening",
      color: "indigo" as const,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
      )
    },
    {
      title: "口语练习",
      subtitle: "口语训练",
      description: "与AI对话伙伴练习餐厅点餐相关口语表达。",
      progress: 25,
      link: "/speaking",
      color: "pink" as const,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
      )
    },
    {
      title: "词汇学习",
      subtitle: "词汇卡片",
      description: "通过卡片记忆餐饮相关的高频词汇。",
      progress: 75,
      link: "/vocabulary",
      color: "red" as const,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
      )
    },
    {
      title: "语法要点",
      subtitle: "语法讲解",
      description: "学习点餐和描述食物常用的语法句型。",
      progress: 0,
      link: "/grammar",
      color: "navy" as const,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
          <polyline points="2 17 12 22 22 17"></polyline>
          <polyline points="2 12 12 17 22 12"></polyline>
        </svg>
      )
    }
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section with Welcome and Day Progress */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-japan-navy">你好，学员！</h1>
            <p className="text-japan-stone mt-1">欢迎回到你的日语学习之旅。</p>
          </div>
          <DayProgress currentDay={currentDay} totalDays={totalDays} />
        </div>
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Learning */}
        <div className="col-span-2">
          {/* Today's Learning Card */}
          <div className="paper-card p-5 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-display font-medium text-japan-navy flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
                今日的学习
                <span className="text-sm text-japan-stone ml-2">今日进度</span>
              </h2>
              <div className="text-sm">
                <span className="font-medium">{todayCompleted}/{todayTotal}</span> 
                <span className="text-japan-stone ml-1">已完成</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-100 rounded-full mb-5">
              <div 
                className="h-full bg-gradient-to-r from-japan-indigo to-japan-pink rounded-full"
                style={{ width: `${todayPercentage}%` }}
              ></div>
            </div>
            
            {/* Main Action Button */}
            <Link 
              to="/daily" 
              className="block w-full bg-japan-indigo hover:bg-japan-indigo/90 text-white font-medium py-3 px-4 rounded-lg text-center mb-6 transition-colors"
            >
              <span className="font-display">继续今日学习</span>
              <span className="block text-sm opacity-90 mt-1">点击进入今日学习内容</span>
            </Link>
            
            {/* Topic Overview */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <h3 className="font-display text-lg mb-2 text-japan-navy">
                第5天：餐厅点餐
              </h3>
              <p className="text-sm text-japan-stone mb-2">
                Day 5：餐厅点餐
              </p>
              <p className="text-sm text-gray-600">
                今天你将学习如何在餐厅点餐、理解菜单内容，以及应对基础的餐厅对话。
              </p>
            </div>
          </div>
          
          {/* Study Modules Grid */}
          <h2 className="text-xl font-display font-medium text-japan-navy mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
            学习模块
            <span className="text-sm text-japan-stone ml-2">模块列表</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            {studyModules.map((module, index) => (
              <StudyCard
                key={index}
                title={module.title}
                subtitle={module.subtitle}
                description={module.description}
                progress={module.progress}
                icon={module.icon}
                color={module.color}
                link={module.link}
              />
            ))}
          </div>
          
          {/* Quick Practice Section */}
          <h2 className="text-xl font-display font-medium text-japan-navy mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            快速练习
            <span className="text-sm text-japan-stone ml-2">随时巩固</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Link to="/quick-practice/phrases" className="paper-card p-4 flex flex-col items-center text-center hover:border-japan-pink/30 transition-colors group">
              <div className="w-12 h-12 rounded-full bg-japan-indigo/10 flex items-center justify-center mb-3 group-hover:bg-japan-indigo/20 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-japan-indigo">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <h3 className="font-display font-medium mb-1">短语复习</h3>
              <p className="text-xs text-japan-stone">5分钟巩固常用表达</p>
            </Link>
            
            <Link to="/quick-practice/flashcards" className="paper-card p-4 flex flex-col items-center text-center hover:border-japan-pink/30 transition-colors group">
              <div className="w-12 h-12 rounded-full bg-japan-pink/10 flex items-center justify-center mb-3 group-hover:bg-japan-pink/20 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-japan-pink">
                  <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                  <path d="M12 8v8"></path>
                  <path d="M18 12H6"></path>
                </svg>
              </div>
              <h3 className="font-display font-medium mb-1">单词卡片</h3>
              <p className="text-xs text-japan-stone">3分钟记忆词汇</p>
            </Link>
            
            <Link to="/quick-practice/quiz" className="paper-card p-4 flex flex-col items-center text-center hover:border-japan-pink/30 transition-colors group">
              <div className="w-12 h-12 rounded-full bg-japan-red/10 flex items-center justify-center mb-3 group-hover:bg-japan-red/20 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-japan-red">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <h3 className="font-display font-medium mb-1">快速测试</h3>
              <p className="text-xs text-japan-stone">快速测试（2分钟）</p>
            </Link>
          </div>
        </div>
        
        {/* Right Column: Learning Path & Stats */}
        <div className="col-span-1">
          {/* Learning Path */}
          <LearningPath currentDay={currentDay} />
          
          {/* Stats Summary */}
          <div className="paper-card p-5 mt-6">
            <h2 className="text-xl font-display font-medium text-japan-navy mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M12 20V10"></path>
                <path d="M18 20V4"></path>
                <path d="M6 20v-4"></path>
              </svg>
              学习统计
            </h2>
            
            <div className="space-y-4">
              {/* Study Streak */}
              <div className="flex justify-between items-center p-3 bg-japan-indigo/10 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-japan-indigo flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">学习连续天数</h3>
                  </div>
                </div>
                <div className="text-lg font-bold text-japan-indigo">5天</div>
              </div>
              
              {/* Vocabulary Mastered */}
              <div className="flex justify-between items-center p-3 bg-japan-pink/10 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-japan-pink flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">习得单词数</h3>
                  </div>
                </div>
                <div className="text-lg font-bold text-japan-pink">42</div>
              </div>
              
              {/* Practice Minutes */}
              <div className="flex justify-between items-center p-3 bg-japan-navy/10 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-japan-navy flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">总练习时间</h3>
                  </div>
                </div>
                <div className="text-lg font-bold text-japan-navy">187分钟</div>
              </div>
            </div>
            
            {/* Weekly Summary Link */}
            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
              <Link 
                to="/stats" 
                className="text-sm font-medium text-japan-indigo hover:underline inline-flex items-center"
              >
                周总结报告
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
