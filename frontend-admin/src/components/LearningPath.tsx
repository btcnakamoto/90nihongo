
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
      subtitle: "Daily Essentials",
      color: "#293B97", // indigo
      startDay: 1,
      endDay: 20,
      milestones: [
        { 
          day: 5, 
          title: "基本挨拶マスター", 
          description: "Master basic greetings",
          isCompleted: currentDay > 5,
          isActive: currentDay === 5
        },
        { 
          day: 10, 
          title: "日常会話入門", 
          description: "Introduction to daily conversations",
          isCompleted: currentDay > 10,
          isActive: currentDay === 10
        },
        { 
          day: 20, 
          title: "ショッピング会話", 
          description: "Shopping conversations",
          isCompleted: currentDay > 20,
          isActive: currentDay === 20
        }
      ]
    },
    {
      title: "職場コミュニケーション",
      subtitle: "Workplace Communication",
      color: "#EA698B", // pink
      startDay: 21,
      endDay: 45,
      milestones: [
        { 
          day: 25, 
          title: "仕事の基本フレーズ", 
          description: "Basic workplace phrases",
          isCompleted: currentDay > 25,
          isActive: currentDay === 25
        },
        { 
          day: 35, 
          title: "電話対応", 
          description: "Phone call responses",
          isCompleted: currentDay > 35,
          isActive: currentDay === 35
        },
        { 
          day: 45, 
          title: "シンプルなプレゼン", 
          description: "Simple presentations",
          isCompleted: currentDay > 45,
          isActive: currentDay === 45
        }
      ]
    },
    {
      title: "表現力の向上",
      subtitle: "Expressive Communication",
      color: "#D64045", // red
      startDay: 46,
      endDay: 70,
      milestones: [
        { 
          day: 50, 
          title: "感情表現", 
          description: "Expressing emotions",
          isCompleted: currentDay > 50,
          isActive: currentDay === 50
        },
        { 
          day: 60, 
          title: "議論の基本", 
          description: "Basics of discussion",
          isCompleted: currentDay > 60,
          isActive: currentDay === 60
        },
        { 
          day: 70, 
          title: "自分の意見を述べる", 
          description: "Expressing your opinion",
          isCompleted: currentDay > 70,
          isActive: currentDay === 70
        }
      ]
    },
    {
      title: "流暢なコミュニケーション",
      subtitle: "Fluent Communication",
      color: "#1D1A39", // navy
      startDay: 71,
      endDay: 90,
      milestones: [
        { 
          day: 75, 
          title: "複雑な会話", 
          description: "Complex conversations",
          isCompleted: currentDay > 75,
          isActive: currentDay === 75
        },
        { 
          day: 85, 
          title: "自然な表現", 
          description: "Natural expressions",
          isCompleted: currentDay > 85,
          isActive: currentDay === 85
        },
        { 
          day: 90, 
          title: "実践的な会話力", 
          description: "Practical conversation skills",
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
    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-5">
      <h2 className="text-xl font-display font-medium text-japan-navy mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        学習パス
        <span className="text-sm text-japan-stone ml-2">Learning Path</span>
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
                  <h3 className="font-display font-medium">
                    {stage.title}
                    <span className="text-xs text-japan-stone ml-2">({stage.subtitle})</span>
                  </h3>
                  <p className="text-xs text-japan-stone">
                    Day {stage.startDay} - {stage.endDay}
                  </p>
                </div>
                <div className="flex items-center">
                  {isCompleted && (
                    <span className="mr-2 text-green-500 bg-green-50 px-2 py-1 rounded-full text-xs font-medium">
                      完了 (Completed)
                    </span>
                  )}
                  {isCurrentStage && (
                    <span className="mr-2 text-blue-500 bg-blue-50 px-2 py-1 rounded-full text-xs font-medium">
                      進行中 (Current)
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
                                <h4 className="font-display font-medium">
                                  {milestone.title}
                                </h4>
                                <p className="text-xs text-japan-stone">
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
                                  今日の学習を始める (Start today's lesson) →
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
