import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  Clock,
  Users,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Settings,
  Edit3,
  Trash2,
  Eye,
  Download,
  Upload
} from 'lucide-react';

interface Course {
  id: number;
  title: string;
  day_number: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: 'published' | 'draft';
  materials_count: number;
  completion_rate: number;
  user_feedback: number;
  last_updated: string;
}

const AdminCourseManagement = () => {
  const { isCollapsed } = useSidebar();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, statusFilter, difficultyFilter]);

  const fetchCourses = async () => {
    setIsLoading(true);
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
      console.error('获取课程失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    if (searchTerm) {
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.day_number.toString().includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(course => course.status === statusFilter);
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(course => course.difficulty === difficultyFilter);
    }

    setFilteredCourses(filtered);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '初级';
      case 'intermediate': return '中级';
      case 'advanced': return '高级';
      default: return difficulty;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return '已发布';
      case 'draft': return '草稿';
      default: return status;
    }
  };

  const stats = {
    total: courses.length,
    published: courses.filter(c => c.status === 'published').length,
    draft: courses.filter(c => c.status === 'draft').length,
    avgCompletion: courses.length > 0 ? Math.round(courses.reduce((sum, c) => sum + c.completion_rate, 0) / courses.length) : 0
  };

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
              <BookOpen className="h-6 w-6 text-nihongo-indigo" />
              90天课程管理
            </h1>
            <p className="text-gray-600 mt-1">管理和编辑90天日语学习课程</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              导出课程
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              导入课程
            </Button>
            <Button size="sm" className="bg-nihongo-indigo hover:bg-nihongo-indigo/90">
              <Plus className="h-4 w-4 mr-2" />
              新建课程
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">总课程数</p>
                  <p className="text-2xl font-bold text-nihongo-darkBlue">{stats.total}</p>
                </div>
                <BookOpen className="h-8 w-8 text-nihongo-indigo" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">已发布</p>
                  <p className="text-2xl font-bold text-green-600">{stats.published}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">草稿</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.draft}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">平均完成率</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.avgCompletion}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选和搜索 */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="搜索课程标题或天数..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="状态筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="published">已发布</SelectItem>
                  <SelectItem value="draft">草稿</SelectItem>
                </SelectContent>
              </Select>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="难度筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部难度</SelectItem>
                  <SelectItem value="beginner">初级</SelectItem>
                  <SelectItem value="intermediate">中级</SelectItem>
                  <SelectItem value="advanced">高级</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 课程列表 */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>课程列表</span>
              <Badge variant="secondary">{filteredCourses.length} 个课程</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nihongo-indigo mx-auto"></div>
                <p className="text-gray-500 mt-2">加载中...</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">暂无课程数据</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredCourses.map((course) => (
                  <Card key={course.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-nihongo-darkBlue mb-1">{course.title}</h3>
                          <p className="text-sm text-gray-500">第 {course.day_number} 天</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge className={getStatusColor(course.status)}>
                            {getStatusText(course.status)}
                          </Badge>
                          <Badge className={getDifficultyColor(course.difficulty)}>
                            {getDifficultyText(course.difficulty)}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">学习材料</span>
                          <span className="font-medium">{course.materials_count} 个</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">完成率</span>
                          <span className="font-medium">{course.completion_rate}%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">用户评分</span>
                          <span className="font-medium">{course.user_feedback.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">更新时间</span>
                          <span className="font-medium">{course.last_updated}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="h-3 w-3 mr-1" />
                          查看
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Edit3 className="h-3 w-3 mr-1" />
                          编辑
                        </Button>
                        <Button size="sm" variant="outline" className="px-2">
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminCourseManagement; 