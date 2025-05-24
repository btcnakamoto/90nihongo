import React, { useEffect, useState, useCallback } from 'react';import AdminSidebar from '@/components/admin/AdminSidebar';import { useSidebar } from '@/contexts/SidebarContext';import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { 
  FileText, 
  Plus, 
  Search, 
  Download,
  Upload,
  Eye,
  Edit3,
  Trash2,
  Play,
  Volume2,
  Video,
  BookOpen,
  HelpCircle,
  Star,
  MoreHorizontal
} from 'lucide-react';

interface LearningMaterial {
  id: number;
  title: string;
  type: 'video' | 'audio' | 'text' | 'quiz';
  course_id: number;
  course_title: string;
  course_day: number;
  duration: number;
  duration_formatted: string;
  size: string;
  status: string;
  views: number;
  rating: number;
  downloads: number;
  created_at: string;
  updated_at: string;
}

interface Course {
  id: number;
  title: string;
  day_number: number;
}

const AdminMaterialManagement = () => {
  const { isCollapsed } = useSidebar();
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMaterials, setSelectedMaterials] = useState<number[]>([]);
  
  // 筛选状态
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    Promise.all([
      fetchMaterials(),
      fetchCourses()
    ]);
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [searchTerm, typeFilter, courseFilter, statusFilter]);

  const fetchMaterials = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const params = new URLSearchParams({
        search: searchTerm,
        type: typeFilter,
        course_id: courseFilter,
        status: statusFilter
      });

      const response = await fetch(`/api/admin/content/materials?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMaterials(data.data || []);
      } else {
        toast({
          title: "错误",
          description: "获取学习材料失败",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('获取学习材料失败:', error);
      toast({
        title: "错误",
        description: "网络错误，请重试",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, typeFilter, courseFilter, statusFilter]);

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
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Volume2 className="h-4 w-4" />;
      case 'text': return <FileText className="h-4 w-4" />;
      case 'quiz': return <HelpCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-100 text-red-800';
      case 'audio': return 'bg-green-100 text-green-800';
      case 'text': return 'bg-blue-100 text-blue-800';
      case 'quiz': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'video': return '视频';
      case 'audio': return '音频';
      case 'text': return '文本';
      case 'quiz': return '测验';
      default: return type;
    }
  };

  // 统计数据
  const stats = {
    total: materials.length,
    video: materials.filter(m => m.type === 'video').length,
    audio: materials.filter(m => m.type === 'audio').length,
    text: materials.filter(m => m.type === 'text').length,
    quiz: materials.filter(m => m.type === 'quiz').length
  };

  // 过滤材料
  const filteredMaterials = materials.filter(material => {
    if (searchTerm && !material.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (typeFilter !== 'all' && material.type !== typeFilter) {
      return false;
    }
    if (courseFilter !== 'all' && material.course_id.toString() !== courseFilter) {
      return false;
    }
    return true;
  });

    return (    <div className="min-h-screen bg-gray-50 flex">      <AdminSidebar activePath="/admin/content/materials" />      <div className={cn(        "flex-1 bg-gradient-to-br from-gray-50 to-gray-100 transition-all duration-300 main-content",        isCollapsed ? "collapsed" : ""      )}>        {/* 页面头部 */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-nihongo-darkBlue flex items-center gap-2">
              <FileText className="h-6 w-6 text-nihongo-indigo" />
              学习材料管理
            </h1>
            <p className="text-gray-600 mt-1">管理和组织所有学习材料资源</p>
          </div>
          <div className="flex items-center gap-3">
            {selectedMaterials.length > 0 && (
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                批量删除 ({selectedMaterials.length})
              </Button>
            )}
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              导出材料
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              导入材料
            </Button>
            <Button size="sm" className="bg-nihongo-indigo hover:bg-nihongo-indigo/90">
              <Plus className="h-4 w-4 mr-2" />
              新建材料
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 统计概览 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">总材料数</p>
                  <p className="text-2xl font-bold text-nihongo-darkBlue">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-nihongo-indigo" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-red-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">视频材料</p>
                  <p className="text-2xl font-bold text-red-600">{stats.video}</p>
                </div>
                <Video className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">音频材料</p>
                  <p className="text-2xl font-bold text-green-600">{stats.audio}</p>
                </div>
                <Volume2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">文本材料</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.text}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-violet-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">测验题库</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.quiz}</p>
                </div>
                <HelpCircle className="h-8 w-8 text-purple-500" />
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
                  placeholder="搜索材料标题..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="材料类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="video">视频</SelectItem>
                  <SelectItem value="audio">音频</SelectItem>
                  <SelectItem value="text">文本</SelectItem>
                  <SelectItem value="quiz">测验</SelectItem>
                </SelectContent>
              </Select>

              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="所属课程" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部课程</SelectItem>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      第{course.day_number}天 - {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="状态筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="active">已激活</SelectItem>
                  <SelectItem value="inactive">未激活</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 材料列表 */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              材料列表
              <Badge variant="secondary">{filteredMaterials.length} 个材料</Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedMaterials.length === filteredMaterials.length && filteredMaterials.length > 0}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedMaterials(filteredMaterials.map(m => m.id));
                  } else {
                    setSelectedMaterials([]);
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
            ) : filteredMaterials.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">暂无学习材料</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMaterials.map((material) => (
                  <div key={material.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={selectedMaterials.includes(material.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedMaterials([...selectedMaterials, material.id]);
                          } else {
                            setSelectedMaterials(selectedMaterials.filter(id => id !== material.id));
                          }
                        }}
                      />
                      
                      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4">
                        <div className="lg:col-span-5">
                          <div className="flex items-center gap-2 mb-2">
                            {getTypeIcon(material.type)}
                            <Badge className={getTypeColor(material.type)}>
                              {getTypeText(material.type)}
                            </Badge>
                            <span className="text-sm text-gray-500">#{material.id}</span>
                          </div>
                          <h3 className="font-semibold text-nihongo-darkBlue mb-1">{material.title}</h3>
                          <p className="text-sm text-gray-600">
                            {material.course_title} (第{material.course_day}天)
                          </p>
                        </div>

                        <div className="lg:col-span-4 space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">时长:</span>
                            <span>{material.duration_formatted}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">大小:</span>
                            <span>{material.size}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">观看:</span>
                            <span>{material.views}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">评分:</span>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span>{material.rating.toFixed(1)}</span>
                            </div>
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
                    </CardContent>        </Card>      </div>    </div>  </div>  );};

export default AdminMaterialManagement; 