import React, { useEffect, useState, useCallback } from 'react';
import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { 
  HelpCircle, 
  Plus, 
  Search, 
  Download,
  Upload,
  Eye,
  Edit3,
  Trash2,
  Target,
  TrendingUp,
  MoreHorizontal,
  Headphones,
  Mic,
  BookOpen,
  Languages,
  BarChart3,
  Clock
} from 'lucide-react';

interface Exercise {
  id: number;
  title: string;
  type: 'listening' | 'speaking' | 'grammar' | 'vocabulary';
  course_day: number;
  difficulty: 'easy' | 'medium' | 'hard';
  completion_rate: number;
  average_score: number;
  created_at: string;
}

interface Course {
  id: number;
  title: string;
  day_number: number;
}

const AdminExerciseManagement = () => {
  const { isCollapsed } = useSidebar();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExercises, setSelectedExercises] = useState<number[]>([]);
  
  // 筛选状态
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');

  useEffect(() => {
    Promise.all([
      fetchExercises(),
      fetchCourses()
    ]);
  }, []);

  useEffect(() => {
    fetchExercises();
  }, [searchTerm, typeFilter, difficultyFilter, courseFilter]);

  const fetchExercises = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const params = new URLSearchParams({
        search: searchTerm,
        type: typeFilter,
        difficulty: difficultyFilter,
        course: courseFilter
      });

      const response = await fetch(`/api/admin/content/exercises?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setExercises(data.data || []);
      } else {
        toast({
          title: "错误",
          description: "获取练习题数据失败",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('获取练习题数据失败:', error);
      toast({
        title: "错误",
        description: "网络错误，请重试",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, typeFilter, difficultyFilter, courseFilter]);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/content/courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCourses(data.data || []);
      }
    } catch (error) {
      console.error('获取课程列表失败:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'listening': return <Headphones className="h-4 w-4" />;
      case 'speaking': return <Mic className="h-4 w-4" />;
      case 'grammar': return <BookOpen className="h-4 w-4" />;
      case 'vocabulary': return <Languages className="h-4 w-4" />;
      default: return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'listening': return 'bg-blue-100 text-blue-800';
      case 'speaking': return 'bg-green-100 text-green-800';
      case 'grammar': return 'bg-purple-100 text-purple-800';
      case 'vocabulary': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'listening': return '听力';
      case 'speaking': return '口语';
      case 'grammar': return '语法';
      case 'vocabulary': return '词汇';
      default: return type;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '简单';
      case 'medium': return '中等';
      case 'hard': return '困难';
      default: return difficulty;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // 统计数据
  const stats = {
    total: exercises.length,
    listening: exercises.filter(e => e.type === 'listening').length,
    speaking: exercises.filter(e => e.type === 'speaking').length,
    grammar: exercises.filter(e => e.type === 'grammar').length,
    vocabulary: exercises.filter(e => e.type === 'vocabulary').length,
    avgCompletion: exercises.length > 0 ? Math.round(exercises.reduce((sum, e) => sum + e.completion_rate, 0) / exercises.length) : 0,
    avgScore: exercises.length > 0 ? Math.round(exercises.reduce((sum, e) => sum + e.average_score, 0) / exercises.length) : 0
  };

  // 过滤练习题
  const filteredExercises = exercises.filter(exercise => {
    if (searchTerm && !exercise.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (typeFilter !== 'all' && exercise.type !== typeFilter) {
      return false;
    }
    if (difficultyFilter !== 'all' && exercise.difficulty !== difficultyFilter) {
      return false;
    }
    if (courseFilter !== 'all') {
      const courseDay = parseInt(courseFilter);
      if (exercise.course_day !== courseDay) return false;
    }
    return true;
  });

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 transition-all duration-300",
      isCollapsed ? "ml-16" : "ml-72"
    )}>
      {/* 页面头部 */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-nihongo-darkBlue flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-nihongo-indigo" />
              练习题库管理
            </h1>
            <p className="text-gray-600 mt-1">管理和组织所有练习题目</p>
          </div>
          <div className="flex items-center gap-3">
            {selectedExercises.length > 0 && (
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                批量删除 ({selectedExercises.length})
              </Button>
            )}
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              导出题库
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              导入题库
            </Button>
            <Button size="sm" className="bg-nihongo-indigo hover:bg-nihongo-indigo/90">
              <Plus className="h-4 w-4 mr-2" />
              新建练习题
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 统计概览 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6">
          <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">总题目数</p>
                  <p className="text-2xl font-bold text-nihongo-darkBlue">{stats.total}</p>
                </div>
                <HelpCircle className="h-8 w-8 text-nihongo-indigo" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">听力题</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.listening}</p>
                </div>
                <Headphones className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">口语题</p>
                  <p className="text-2xl font-bold text-green-600">{stats.speaking}</p>
                </div>
                <Mic className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-violet-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">语法题</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.grammar}</p>
                </div>
                <BookOpen className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-orange-50 to-red-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">词汇题</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.vocabulary}</p>
                </div>
                <Languages className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">平均完成率</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.avgCompletion}%</p>
                </div>
                <Target className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-green-50 to-teal-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">平均得分</p>
                  <p className="text-2xl font-bold text-teal-600">{stats.avgScore}分</p>
                </div>
                <BarChart3 className="h-8 w-8 text-teal-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选控制面板 */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索练习题标题..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="题目类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="listening">听力</SelectItem>
                  <SelectItem value="speaking">口语</SelectItem>
                  <SelectItem value="grammar">语法</SelectItem>
                  <SelectItem value="vocabulary">词汇</SelectItem>
                </SelectContent>
              </Select>

              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="难度级别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部难度</SelectItem>
                  <SelectItem value="easy">简单</SelectItem>
                  <SelectItem value="medium">中等</SelectItem>
                  <SelectItem value="hard">困难</SelectItem>
                </SelectContent>
              </Select>

              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="所属课程" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部课程</SelectItem>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.day_number.toString()}>
                      第{course.day_number}天 - {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 练习题列表 */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              练习题列表
              <Badge variant="secondary">{filteredExercises.length} 道题目</Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedExercises.length === filteredExercises.length && filteredExercises.length > 0}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedExercises(filteredExercises.map(e => e.id));
                  } else {
                    setSelectedExercises([]);
                  }
                }}
              />
              <span className="text-sm text-gray-500">全选</span>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nihongo-indigo mx-auto"></div>
                <p className="text-gray-500 mt-2">加载中...</p>
              </div>
            ) : filteredExercises.length === 0 ? (
              <div className="text-center py-8">
                <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">暂无练习题数据</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredExercises.map((exercise) => (
                  <div key={exercise.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={selectedExercises.includes(exercise.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedExercises([...selectedExercises, exercise.id]);
                          } else {
                            setSelectedExercises(selectedExercises.filter(id => id !== exercise.id));
                          }
                        }}
                      />
                      
                      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4">
                        <div className="lg:col-span-5">
                          <div className="flex items-center gap-2 mb-2">
                            {getTypeIcon(exercise.type)}
                            <Badge className={getTypeColor(exercise.type)}>
                              {getTypeText(exercise.type)}
                            </Badge>
                            <Badge className={getDifficultyColor(exercise.difficulty)}>
                              {getDifficultyText(exercise.difficulty)}
                            </Badge>
                            <span className="text-sm text-gray-500">#{exercise.id}</span>
                          </div>
                          <h3 className="font-semibold text-nihongo-darkBlue mb-1">{exercise.title}</h3>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            第{exercise.course_day}天课程
                          </p>
                        </div>

                        <div className="lg:col-span-4 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">完成率:</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${exercise.completion_rate}%` }}
                                ></div>
                              </div>
                              <span className="font-medium">{exercise.completion_rate}%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">平均得分:</span>
                            <span className={cn("font-medium", getScoreColor(exercise.average_score))}>
                              {exercise.average_score}分
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">创建时间:</span>
                            <span className="font-medium">{exercise.created_at}</span>
                          </div>
                        </div>

                        <div className="lg:col-span-3 flex items-center gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="h-3 w-3 mr-1" />
                            预览
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Edit3 className="h-3 w-3 mr-1" />
                            编辑
                          </Button>
                          <Button size="sm" variant="outline" className="px-2">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminExerciseManagement; 