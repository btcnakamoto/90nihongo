import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* 英雄区域 */}
      <section className="pt-20 pb-16 px-6 md:pt-32 md:pb-24 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-japan-navy leading-tight">
                <span className="text-japan-indigo">90</span>天掌握
                <span className="text-japan-pink">日语</span>
                <br />实用沟通能力
              </h1>
              
              <p className="text-lg text-gray-700 max-w-xl">
                通过结构化学习计划，每天仅需30分钟，从零基础到能够自信交流，90天改变你的日语水平。
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/daily">
                  <Button size="lg" className="bg-japan-indigo hover:bg-japan-indigo/90 text-white">
                    立即开始学习
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button size="lg" variant="outline" className="border-japan-indigo text-japan-indigo hover:bg-japan-indigo/10">
                    了解课程设置
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center gap-3 pt-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-japan-pink/85`}></div>
                  ))}
                </div>
                <span className="text-sm text-gray-600">已有1000+学员加入学习</span>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 lg:w-80 lg:h-80 bg-japan-indigo/20 rounded-full blur-3xl"></div>
              <div className="paper-card p-6 md:p-8 relative">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-japan-indigo text-white flex items-center justify-center">
                      <span className="font-display font-bold text-xl">日</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xl font-display font-bold text-japan-navy">90エコーかな</span>
                      <span className="text-xs text-japan-stone">90天日语学习</span>
                    </div>
                  </div>
                  <div className="bg-japan-cream py-1 px-3 rounded-full text-sm font-medium">
                    第5天 / 90天
                  </div>
                </div>
                
                <div className="space-y-5">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <h3 className="font-display text-lg mb-1 text-japan-navy">
                      今日学习：餐厅点餐对话
                    </h3>
                    <div className="flex justify-between text-sm">
                      <span className="text-japan-stone">预计学习时间: 30分钟</span>
                      <span className="text-japan-indigo font-medium">50%已完成</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2">
                      <div className="h-full bg-gradient-to-r from-japan-indigo to-japan-pink rounded-full" style={{width: "50%"}}></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-japan-indigo/10 rounded-lg">
                      <div className="flex gap-2 items-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-japan-indigo">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        </svg>
                        <h4 className="font-medium">听力训练</h4>
                      </div>
                      <div className="text-xs text-japan-stone">8个音频片段</div>
                    </div>
                    
                    <div className="p-4 bg-japan-pink/10 rounded-lg">
                      <div className="flex gap-2 items-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-japan-pink">
                          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                          <line x1="12" y1="19" x2="12" y2="23"></line>
                          <line x1="8" y1="23" x2="16" y2="23"></line>
                        </svg>
                        <h4 className="font-medium">口语练习</h4>
                      </div>
                      <div className="text-xs text-japan-stone">5个会话场景</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-japan-red/10 rounded-lg">
                      <div className="flex gap-2 items-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-japan-red">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                        </svg>
                        <h4 className="font-medium">词汇学习</h4>
                      </div>
                      <div className="text-xs text-japan-stone">12个新词汇</div>
                    </div>
                    
                    <div className="p-4 bg-japan-navy/10 rounded-lg">
                      <div className="flex gap-2 items-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-japan-navy">
                          <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                          <polyline points="2 17 12 22 22 17"></polyline>
                          <polyline points="2 12 12 17 22 12"></polyline>
                        </svg>
                        <h4 className="font-medium">语法点</h4>
                      </div>
                      <div className="text-xs text-japan-stone">3个关键语法</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-japan-indigo/5 rounded-full blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-japan-pink/5 rounded-full blur-3xl"></div>
      </section>
      
      {/* 特点部分 */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-japan-navy mb-4">
              科学高效的学习体系
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              90天日语学习平台采用科学的学习方法，针对中文母语者设计专属的日语学习路径
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-6 border-gray-200">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-japan-indigo/10 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-japan-indigo">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                  </svg>
                </div>
                <h3 className="font-display font-medium text-lg mb-2">系统化课程</h3>
                <p className="text-gray-600 text-sm">
                  按照科学规律设计的90天进阶课程，每天掌握一个核心场景
                </p>
              </div>
            </Card>
            
            <Card className="p-6 border-gray-200">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-japan-pink/10 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-japan-pink">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                    <line x1="8" y1="23" x2="16" y2="23"></line>
                  </svg>
                </div>
                <h3 className="font-display font-medium text-lg mb-2">AI互动练习</h3>
                <p className="text-gray-600 text-sm">
                  智能对话伙伴进行真实场景对话练习，提高口语表达能力
                </p>
              </div>
            </Card>
            
            <Card className="p-6 border-gray-200">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-japan-red/10 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-japan-red">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <h3 className="font-display font-medium text-lg mb-2">智能进度追踪</h3>
                <p className="text-gray-600 text-sm">
                  个性化学习数据分析，精准识别学习弱点，优化学习路径
                </p>
              </div>
            </Card>
            
            <Card className="p-6 border-gray-200">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-japan-navy/10 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-japan-navy">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <h3 className="font-display font-medium text-lg mb-2">学习社区</h3>
                <p className="text-gray-600 text-sm">
                  结交志同道合的学习伙伴，共同激励，持续进步
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>
      
      {/* 学习路径 */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-japan-navy mb-4">
              清晰的学习路径
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              从基础到进阶，四个阶段循序渐进，轻松提升日语沟通能力
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <div className="space-y-6">
              <div className="p-5 paper-card">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-japan-indigo flex items-center justify-center text-white font-bold text-xl">
                    1
                  </div>
                  <div>
                    <h3 className="font-display font-medium text-lg text-japan-navy mb-1">日常生活会话（1-25天）</h3>
                    <p className="text-gray-600 text-sm">掌握基础日常用语，学习购物、点餐、问路等生活场景对话</p>
                  </div>
                </div>
              </div>
              
              <div className="p-5 paper-card">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-japan-pink flex items-center justify-center text-white font-bold text-xl">
                    2
                  </div>
                  <div>
                    <h3 className="font-display font-medium text-lg text-japan-navy mb-1">社交沟通（26-45天）</h3>
                    <p className="text-gray-600 text-sm">提升社交表达能力，学习交友、约会、聚会等场景的地道表达</p>
                  </div>
                </div>
              </div>
              
              <div className="p-5 paper-card">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-japan-red flex items-center justify-center text-white font-bold text-xl">
                    3
                  </div>
                  <div>
                    <h3 className="font-display font-medium text-lg text-japan-navy mb-1">职场日语（46-70天）</h3>
                    <p className="text-gray-600 text-sm">掌握商务日语基础，学习自我介绍、面试、会议发言等职场必备技能</p>
                  </div>
                </div>
              </div>
              
              <div className="p-5 paper-card">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-japan-navy flex items-center justify-center text-white font-bold text-xl">
                    4
                  </div>
                  <div>
                    <h3 className="font-display font-medium text-lg text-japan-navy mb-1">深度交流（71-90天）</h3>
                    <p className="text-gray-600 text-sm">能够进行深入交流，表达观点、讨论话题、辩论等高级沟通能力</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="p-6 paper-card w-full">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-display font-medium text-lg text-japan-navy">学习进度示例</h3>
                  <span className="bg-japan-cream py-1 px-3 rounded-full text-sm font-medium">第30天</span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-japan-indigo/10 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-japan-indigo">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                      </div>
                      <span className="font-medium">对话完成度</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">82%</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                        <polyline points="18 15 12 9 6 15"></polyline>
                      </svg>
                    </div>
                  </div>
                  
                  <div className="w-full h-2 bg-gray-100 rounded-full">
                    <div className="h-full bg-japan-indigo rounded-full" style={{width: "82%"}}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-japan-pink/10 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-japan-pink">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                        </svg>
                      </div>
                      <span className="font-medium">词汇掌握</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">412词</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                        <polyline points="18 15 12 9 6 15"></polyline>
                      </svg>
                    </div>
                  </div>
                  
                  <div className="w-full h-2 bg-gray-100 rounded-full">
                    <div className="h-full bg-japan-pink rounded-full" style={{width: "75%"}}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-japan-red/10 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-japan-red">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                      </div>
                      <span className="font-medium">学习时长</span>
                    </div>
                    <span className="font-bold">45小时</span>
                  </div>
                  
                  <div className="w-full h-2 bg-gray-100 rounded-full">
                    <div className="h-full bg-japan-red rounded-full" style={{width: "60%"}}></div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                  <Link to="/daily" className="text-sm text-japan-indigo flex items-center justify-center gap-1 font-medium hover:underline">
                    查看我的学习计划
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA部分 */}
      <section className="py-16 px-6 bg-japan-indigo/5">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-japan-navy mb-5">
            开始您的90天日语学习之旅
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            即刻加入数千名学员的行列，开启科学高效的日语学习之旅，只需90天，让您的日语沟通能力脱胎换骨
          </p>
          
          <Link to="/daily">
            <Button size="lg" className="bg-japan-indigo hover:bg-japan-indigo/90 text-white px-8 py-6 text-lg">
              立即开始免费学习
            </Button>
          </Link>
          
          <div className="mt-8 flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-japan-indigo">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>科学学习方法</span>
            </div>
            
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-japan-indigo">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>90天学习保障</span>
            </div>
            
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-japan-indigo">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>专业教师指导</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* 页脚 */}
      <footer className="py-8 px-6 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="h-8 w-8 rounded-full bg-japan-indigo text-white flex items-center justify-center">
                <span className="font-display font-bold text-sm">日</span>
              </div>
              <span className="font-display font-medium">90天日语学习平台</span>
            </div>
            
            <div className="flex gap-6">
              <Link to="/about" className="text-gray-600 hover:text-japan-indigo text-sm">关于我们</Link>
              <Link to="/blog" className="text-gray-600 hover:text-japan-indigo text-sm">学习博客</Link>
              <Link to="/help" className="text-gray-600 hover:text-japan-indigo text-sm">帮助中心</Link>
              <Link to="/contact" className="text-gray-600 hover:text-japan-indigo text-sm">联系我们</Link>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">© 2025 90天日语学习平台. 保留所有权利</p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-japan-indigo">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-japan-indigo">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-japan-indigo">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-japan-indigo">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
