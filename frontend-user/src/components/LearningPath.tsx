import { useState } from 'react';
import { Link } from 'react-router-dom';

// Define types for our learning stages and milestones
interface Milestone {
  day: number;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
}

interface LearningStage {
  title: string;
  subtitle: string;
  color: string;
  startDay: number;
  endDay: number;
  milestones: Milestone[];
}

interface LearningPathProps {
  currentDay: number;
}

const LearningPath = ({ currentDay }: LearningPathProps) => {
  // Predefined stages for the 90-day learning path
  const stages: LearningStage[] = [
    {
      title: "生活必需品",
      subtitle: "日常必备表达",
      color: "#293B97", // indigo
      startDay: 1,
      endDay: 20,
      milestones: [
        { 
          day: 5, 
          title: "基础问候语掌握", 
          description: "掌握常用的日常问候语",
          isCompleted: currentDay > 5,
          isActive: currentDay === 5
        },
        { 
          day: 10, 
          title: "日常会话入门", 
          description: "学会简单的日常交流",
          isCompleted: currentDay > 10,
          isActive: currentDay === 10
        },
        { 
          day: 20, 
          title: "购物场景会话", 
          description: "掌握购物相关表达",
          isCompleted: currentDay > 20,
          isActive: currentDay === 20
        }
      ]
    },
    {
      title: "职场交流",
      subtitle: "工作场所沟通",
      color: "#EA698B", // pink
      startDay: 21,
      endDay: 45,
      milestones: [
        { 
          day: 25, 
          title: "工作基本用语", 
          description: "掌握职场常用表达",
          isCompleted: currentDay > 25,
          isActive: currentDay === 25
        },
        { 
          day: 35, 
          title: "电话应答", 
          description: "学会电话沟通技巧",
          isCompleted: currentDay > 35,
          isActive: currentDay === 35
        },
        { 
          day: 45, 
          title: "简单演讲", 
          description: "能进行简短的职场演讲",
          isCompleted: currentDay > 45,
          isActive: currentDay === 45
        }
      ]
    },
    {
      title: "表达能力提升",
      subtitle: "表达更丰富",
      color: "#D64045", // red
      startDay: 46,
      endDay: 70,
      milestones: [
        { 
          day: 50, 
          title: "情感表达", 
          description: "学会表达情绪和感受",
          isCompleted: currentDay > 50,
          isActive: currentDay === 50
        },
        { 
          day: 60, 
          title: "讨论基础", 
          description: "掌握讨论和交流的基本技巧",
          isCompleted: currentDay > 60,
          isActive: currentDay === 60
        },
        { 
          day: 70, 
          title: "表达个人观点", 
          description: "能够清晰表达自己的意见",
          isCompleted: currentDay > 70,
          isActive: currentDay === 70
        }
      ]
    },
    {
      title: "流利沟通",
      subtitle: "高级交流能力",
      color: "#1D1A39", // navy
      startDay: 71,
      endDay: 90,
      milestones: [
        { 
          day: 75, 
          title: "复杂对话", 
          description: "能参与更复杂的交流",
          isCompleted: currentDay > 75,
          isActive: currentDay === 75
        },
        { 
          day: 85, 
          title: "自然表达", 
          description: "表达更地道自然",
          isCompleted: currentDay > 85,
          isActive: currentDay === 85
        },
        { 
          day: 90, 
          title: "实用会话能力", 
          description: "具备实际生活中的会话能力",
          isCompleted: currentDay > 90,
          isActive: currentDay === 90
        }
      ]
    }
  ];

  // Determine the current stage based on the current day
  const getCurrentStage = () => {
    return stages.find(stage => 
      currentDay >= stage.startDay && currentDay <= stage.endDay
    ) || stages[0];
  };

  const [expandedStage, setExpandedStage] = useState<number | null>(
    stages.findIndex(stage => 
      currentDay >= stage.startDay && currentDay <= stage.endDay
    )
  );

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-5" style={{ fontFamily: 'Zen Maru Gothic, sans-serif' }}>
      <h2 className="text-xl font-display font-medium text-japan-navy mb-4 flex items-center" style={{ fontFamily: 'Zen Maru Gothic, sans-serif' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        学习路径
      </h2>

      <div className="space-y-4">
        {stages.map((stage, index) => {
          const isCurrentStage = currentDay >= stage.startDay && currentDay <= stage.endDay;
          const isCompleted = currentDay > stage.endDay;
          const isFuture = currentDay < stage.startDay;
          
          return (
            <div 
              key={index}
              className={`
                border rounded-lg transition-all duration-300 overflow-hidden
                ${isCurrentStage ? 'border-2 border-' + stage.color : 'border-gray-200'}
                ${isCompleted ? 'bg-gray-50' : ''}
                ${isFuture ? 'opacity-70' : ''}
              `}
            >
              {/* Stage Header */}
              <div 
                className={`p-3 cursor-pointer flex justify-between items-center`}
                onClick={() => setExpandedStage(expandedStage === index ? null : index)}
                style={{ 
                  borderLeft: `4px solid ${stage.color}`,
                  backgroundColor: isCurrentStage ? `${stage.color}10` : ''
                }}
              >
                <div>
                  <h3 className="font-display font-medium zh-font" style={{ fontFamily: 'Zen Maru Gothic, sans-serif' }}>
                    {stage.title}
                  </h3>
                  <p className="text-xs text-japan-stone">
                    Day {stage.startDay} - {stage.endDay}
                  </p>
                </div>
                <div className="flex items-center">
                  {isCompleted && (
                    <span className="mr-2 text-green-500 bg-green-50 px-2 py-1 rounded-full text-xs font-medium">
                      完成
                    </span>
                  )}
                  {isCurrentStage && (
                    <span className="mr-2 text-blue-500 bg-blue-50 px-2 py-1 rounded-full text-xs font-medium">
                      进行中
                    </span>
                  )}
                  <svg 
                    xmlns="http://www.w3.org/2000/svg"
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className={`transition-transform ${expandedStage === index ? 'transform rotate-180' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>
              
              {/* Expanded Content with Milestones */}
              {expandedStage === index && (
                <div className="p-3 border-t border-gray-100 bg-gray-50">
                  <div className="relative pt-2">
                    {/* Vertical timeline line */}
                    <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200"></div>
                    
                    {/* Milestones */}
                    <div className="space-y-4">
                      {stage.milestones.map((milestone, mIndex) => (
                        <div key={mIndex} className="relative pl-12">
                          {/* Milestone dot */}
                          <div 
                            className={`
                              absolute left-3.5 top-1.5 h-3 w-3 rounded-full 
                              transform -translate-x-1/2
                              ${milestone.isCompleted ? 'bg-green-500' : (milestone.isActive ? 'bg-blue-500' : 'bg-gray-300')}
                            `}
                          ></div>
                          
                          {/* Milestone content */}
                          <div 
                            className={`
                              p-3 rounded-lg
                              ${milestone.isActive ? 'bg-white border border-blue-200 shadow-sm' : 'bg-white border border-gray-100'}
                            `}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-display font-medium" style={{ fontFamily: 'Zen Maru Gothic, sans-serif' }}>
                                  {milestone.title}
                                </h4>
                                <p className="text-xs text-japan-stone" style={{ fontFamily: 'Zen Maru Gothic, sans-serif' }}>
                                  {milestone.description}
                                </p>
                              </div>
                              <div className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100">
                                Day {milestone.day}
                              </div>
                            </div>
                            
                            {milestone.isActive && (
                              <div className="mt-2 pt-2 border-t border-gray-100">
                                <Link 
                                  to="/daily" 
                                  className="text-xs font-medium text-japan-indigo hover:underline"
                                >
                                  今日的课程 →
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LearningPath;
