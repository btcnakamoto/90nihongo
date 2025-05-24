import { useState, useEffect, useCallback, useMemo, memo, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';
import { 
  contentService, 
  type ContentStats, 
  type CourseProgressData, 
  type ContentTypeData, 
  type RecentActivity, 
  type Course, 
  type LearningMaterial, 
  type Vocabulary, 
  type Exercise,
  type CreateCourseData,
  type CreateMaterialData,
  type CreateVocabularyData,
  type CreateExerciseData
} from '@/services/contentService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import {
  BookOpen,
  Calendar,
  Video,
  Volume2,
  FileText,
  MessageSquare,
  Brain,
  Target,
  TrendingUp,
  Star,
  Search,
  Plus,
  Edit,
  Trash2,
  Upload,
  RefreshCw,
  BarChart3,
  Eye,
  Layers,
  Award
} from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import TopNavbar from '@/components/admin/TopNavbar';
import PageHeader from '@/components/admin/PageHeader';
import StatsCard from '@/components/admin/StatsCard';
import { 
  ContentTypeSelector, 
  CourseForm, 
  MaterialForm, 
  VocabularyForm, 
  ExerciseForm 
} from '@/components/admin/ContentFormComponents';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// 性能优化：使用React.memo包装大的表格组件const OptimizedTable = memo(Table);const OptimizedTableBody = memo(TableBody);

// 优化的徽章组件
const DifficultyBadge = memo(({ difficulty }: { difficulty: string }) => {
  const badgeConfig = useMemo(() => {
    const configs = {
      beginner: { className: 'bg-green-100 text-green-800', label: '初级' },
      intermediate: { className: 'bg-yellow-100 text-yellow-800', label: '中级' },
      advanced: { className: 'bg-red-100 text-red-800', label: '高级' },
      easy: { className: 'bg-green-100 text-green-800', label: '简单' },
      medium: { className: 'bg-yellow-100 text-yellow-800', label: '中等' },
      hard: { className: 'bg-red-100 text-red-800', label: '困难' }
    };
    return configs[difficulty as keyof typeof configs] || { className: 'bg-gray-100 text-gray-800', label: difficulty };
  }, [difficulty]);

  return (
    <Badge className={badgeConfig.className}>
      {badgeConfig.label}
    </Badge>
  );
});

const StatusBadge = memo(({ status }: { status: string }) => {
  const badgeConfig = useMemo(() => {
    const configs = {
      published: { className: 'bg-green-100 text-green-800', label: '已发布' },
      draft: { className: 'bg-gray-100 text-gray-800', label: '草稿' },
      review: { className: 'bg-yellow-100 text-yellow-800', label: '审核中' },
      active: { className: 'bg-green-100 text-green-800', label: '启用' },
      inactive: { className: 'bg-gray-100 text-gray-800', label: '禁用' }
    };
    return configs[status as keyof typeof configs] || { className: 'bg-gray-100 text-gray-800', label: status };
  }, [status]);

  return (
    <Badge className={badgeConfig.className}>
      {badgeConfig.label}
    </Badge>
  );
});

const TypeBadge = memo(({ type }: { type: string }) => {
  const badgeConfig = useMemo(() => {
    const icons = {
      video: <Video className="h-3 w-3" />,
      audio: <Volume2 className="h-3 w-3" />,
      text: <FileText className="h-3 w-3" />,
      quiz: <Brain className="h-3 w-3" />,
      listening: <Volume2 className="h-3 w-3" />,
      speaking: <MessageSquare className="h-3 w-3" />,
      grammar: <BookOpen className="h-3 w-3" />,
      vocabulary: <Target className="h-3 w-3" />
    };

    const labels = {
      video: '视频',
      audio: '音频',
      text: '文本',
      quiz: '测验',
      listening: '听力',
      speaking: '口语',
      grammar: '语法',
      vocabulary: '词汇'
    };

    return {
      icon: icons[type as keyof typeof icons],
      label: labels[type as keyof typeof labels] || type
    };
  }, [type]);

  return (
    <Badge variant="outline" className="flex items-center gap-1">
      {badgeConfig.icon}
      {badgeConfig.label}
    </Badge>
  );
});

// 课程表行组件
const CourseTableRow = memo(({ 
  course, 
  onEdit, 
  onDelete, 
  onView 
}: { 
  course: Course;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onView: (id: number) => void;
}) => {
  const handleEdit = useCallback(() => onEdit(course.id), [onEdit, course.id]);
  const handleDelete = useCallback(() => onDelete(course.id), [onDelete, course.id]);
  const handleView = useCallback(() => onView(course.id), [onView, course.id]);

  return (
    <TableRow>
      <TableCell>
        <Checkbox />
      </TableCell>
      <TableCell className="font-medium">第{course.day_number}天</TableCell>
      <TableCell>
        <div>
          <p className="font-medium">{course.title}</p>
          <p className="text-sm text-gray-500">更新于 {course.last_updated}</p>
        </div>
      </TableCell>
      <TableCell><DifficultyBadge difficulty={course.difficulty} /></TableCell>
      <TableCell><StatusBadge status={course.status} /></TableCell>
      <TableCell>
        <Badge variant="outline">{course.materials_count} 个</Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${course.completion_rate}%` }}
            />
          </div>
          <span className="text-sm">{course.completion_rate}%</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 text-yellow-500" />
          <span>{course.user_feedback}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleView}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-red-600" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

const AdminContentManagement = () => {
  const { isCollapsed } = useSidebar();
  const { toast } = useToast();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  
  // 根据路径确定初始活动标签页
  const getInitialTab = useCallback(() => {
    const path = location.pathname;
    if (path.includes('/courses')) return 'courses';
    if (path.includes('/materials')) return 'materials';
    if (path.includes('/vocabulary')) return 'vocabulary';
    if (path.includes('/exercises')) return 'exercises';
    return 'overview';
  }, [location.pathname]);

  const [activeTab, setActiveTab] = useState(getInitialTab());

  // 监听路径变化，自动切换标签页
  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [getInitialTab]);

  // API数据状态
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [courseProgressData, setCourseProgressData] = useState<CourseProgressData[]>([]);
  const [contentTypeData, setContentTypeData] = useState<ContentTypeData[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  // 搜索和筛选状态  const [searchTerm, setSearchTerm] = useState("");  const [filterType, setFilterType] = useState("all");  const [filterStatus, setFilterStatus] = useState("all");  const [filterLevel, setFilterLevel] = useState("all");  // 分页状态  const [currentPage, setCurrentPage] = useState(1);  const [pageSize, setPageSize] = useState(20);  // 性能优化：防抖搜索  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");    useEffect(() => {    const timer = setTimeout(() => {      setDebouncedSearchTerm(searchTerm);    }, 300);    return () => clearTimeout(timer);  }, [searchTerm]);

  // 对话框状态
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [contentType, setContentType] = useState<'course' | 'material' | 'vocabulary' | 'exercise'>('course');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 表单状态
  const [courseForm, setCourseForm] = useState<CreateCourseData>({
    title: "",
    description: "",
    day_number: 1,
    difficulty: "beginner",
    tags: [],
    is_active: false
  });

  const [materialForm, setMaterialForm] = useState<CreateMaterialData>({
    course_id: 0,
    title: "",
    type: "text",
    content: "",
    media_url: "",
    duration_minutes: 0,
    metadata: {}
  });

  const [vocabularyForm, setVocabularyForm] = useState<CreateVocabularyData>({
    word: "",
    reading: "",
    meaning: "",
    part_of_speech: "",
    example_sentence: "",
    example_reading: "",
    example_meaning: "",
    jlpt_level: "N5",
    tags: []
  });

  const [exerciseForm, setExerciseForm] = useState<CreateExerciseData>({
    course_id: 0,
    title: "",
    type: "vocabulary",
    question: "",
    options: ["", "", "", ""],
    correct_answer: "",
    explanation: "",
    points: 10
  });

  // 加载数据
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [statsResponse, coursesResponse, materialsResponse, vocabularyResponse, exercisesResponse] = await Promise.all([
        contentService.getStats(),
        contentService.getCourses(),
        contentService.getMaterials(),
        contentService.getVocabulary(),
        contentService.getExercises()
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data.stats);
        setCourseProgressData(statsResponse.data.course_progress_data);
        setContentTypeData(statsResponse.data.content_type_data);
        setRecentActivities(statsResponse.data.recent_activities);
      }

      if (coursesResponse.success) {
        setCourses(coursesResponse.data);
      }

      if (materialsResponse.success) {
        setMaterials(materialsResponse.data);
      }

      if (vocabularyResponse.success) {
        setVocabulary(vocabularyResponse.data);
      }

      if (exercisesResponse.success) {
        setExercises(exercisesResponse.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: "加载失败",
        description: "无法加载内容数据，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 工具函数
  const getContentTypeName = useCallback((type: string) => {
    const names = {
      course: '课程',
      material: '学习材料',
      vocabulary: '词汇',
      exercise: '练习题'
    };
    return names[type as keyof typeof names] || type;
  }, []);

  const formatDuration = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // 事件处理函数
  const handleCreateContent = useCallback((type: 'course' | 'material' | 'vocabulary' | 'exercise' = 'course') => {
    setContentType(type);
    setCreateDialogOpen(true);
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return;
    
    try {
      setUploading(true);
      const fileType = file.type.startsWith('video') ? 'video' : 
                      file.type.startsWith('audio') ? 'audio' : 'image';
      
      const result = await contentService.uploadFile(file, fileType);
      
      if (result.success && result.url) {
        setMaterialForm(prev => ({ ...prev, media_url: result.url! }));
        toast({
          title: "上传成功",
          description: "文件已成功上传",
        });
      } else {
        throw new Error(result.message || '上传失败');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "上传失败",
        description: "文件上传失败，请重试",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }, [toast]);

  const handleSaveContent = useCallback(async () => {
    try {
      setSaving(true);
      let result;

      switch (contentType) {
        case 'course':
          if (!courseForm.title || !courseForm.description) {
            throw new Error('请填写必要的课程信息');
          }
          result = await contentService.createCourse(courseForm);
          break;

        case 'material':
          if (!materialForm.title || !materialForm.content || !materialForm.course_id) {
            throw new Error('请填写必要的材料信息');
          }
          result = await contentService.createMaterial(materialForm);
          break;

        case 'vocabulary':
          if (!vocabularyForm.word || !vocabularyForm.reading || !vocabularyForm.meaning) {
            throw new Error('请填写必要的词汇信息');
          }
          result = await contentService.createVocabulary(vocabularyForm);
          break;

        case 'exercise':
          if (!exerciseForm.title || !exerciseForm.question || !exerciseForm.correct_answer) {
            throw new Error('请填写必要的练习题信息');
          }
          result = await contentService.createExercise(exerciseForm);
          break;

        default:
          throw new Error('未知的内容类型');
      }

      if (result && result.success) {
        toast({
          title: "创建成功",
          description: `${getContentTypeName(contentType)}已成功创建`,
        });
        setCreateDialogOpen(false);
        await loadData();
      } else {
        throw new Error(result?.message || '创建失败');
      }
    } catch (error: any) {
      console.error('Save failed:', error);
      toast({
        title: "创建失败",
        description: error.message || "创建内容失败，请重试",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [contentType, courseForm, materialForm, vocabularyForm, exerciseForm, loadData, toast, getContentTypeName]);

  // 表单更新处理函数
  const handleCourseFormChange = useCallback((field: keyof CreateCourseData, value: any) => {
    setCourseForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleMaterialFormChange = useCallback((field: keyof CreateMaterialData, value: any) => {
    setMaterialForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleVocabularyFormChange = useCallback((field: keyof CreateVocabularyData, value: any) => {
    setVocabularyForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleExerciseFormChange = useCallback((field: keyof CreateExerciseData, value: any) => {
    setExerciseForm(prev => ({ ...prev, [field]: value }));
  }, []);

  // 操作处理函数
  const handleEdit = useCallback((id: number) => {
    console.log('Edit:', id);
  }, []);

  const handleDelete = useCallback((id: number) => {
    console.log('Delete:', id);
  }, []);

  const handleView = useCallback((id: number) => {
    console.log('View:', id);
  }, []);

  // 筛选数据
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = searchTerm === "" || course.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || course.status === filterStatus;
      const matchesLevel = filterLevel === "all" || course.difficulty === filterLevel;
      return matchesSearch && matchesStatus && matchesLevel;
    });
  }, [courses, searchTerm, filterStatus, filterLevel]);

  const filteredMaterials = useMemo(() => {
    return materials.filter(material => {
      const matchesSearch = searchTerm === "" || material.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || material.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [materials, searchTerm, filterType]);

  const filteredVocabulary = useMemo(() => {
    return vocabulary.filter(vocab => {
      const matchesSearch = searchTerm === "" || 
        vocab.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vocab.reading.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vocab.meaning.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = filterLevel === "all" || vocab.jlpt_level === filterLevel;
      return matchesSearch && matchesLevel;
    });
  }, [vocabulary, searchTerm, filterLevel]);

  const filteredExercises = useMemo(() => {
    return exercises.filter(exercise => {
      const matchesSearch = searchTerm === "" || exercise.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || exercise.type === filterType;
      const matchesLevel = filterLevel === "all" || exercise.difficulty === filterLevel;
      return matchesSearch && matchesType && matchesLevel;
    });
  }, [exercises, searchTerm, filterType, filterLevel]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar activePath="/admin/content" />
        <div className={cn(
          "main-content flex-1 flex flex-col transition-all duration-300",
          isCollapsed && "collapsed"
        )}>
          <TopNavbar />
          <main className="flex-1 p-6 overflow-auto">
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar activePath="/admin/content" />
      <div className={cn(
        "main-content flex-1 flex flex-col transition-all duration-300",
        isCollapsed && "collapsed"
      )}>
        <TopNavbar />
        
        <main className="flex-1 p-6 overflow-auto">
          <PageHeader 
            title="内容管理" 
            description="管理90天日语学习课程、材料库和练习内容"
          >
            <Button onClick={() => handleCreateContent()} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              创建内容
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              批量导入
            </Button>
          </PageHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">内容概览</TabsTrigger>
              <TabsTrigger value="courses">90天课程</TabsTrigger>
              <TabsTrigger value="materials">学习材料</TabsTrigger>
              <TabsTrigger value="vocabulary">词汇管理</TabsTrigger>
              <TabsTrigger value="exercises">练习题库</TabsTrigger>
            </TabsList>

            {/* 内容概览 */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                  title="总课程数"
                  value={stats?.total_courses?.toString() || "0"}
                  icon={<BookOpen className="h-5 w-5" />}
                  trend={{ value: 8, isPositive: true }}
                />
                <StatsCard
                  title="学习材料"
                  value={stats?.total_materials?.toString() || "0"}
                  icon={<Layers className="h-5 w-5" />}
                  trend={{ value: 12, isPositive: true }}
                />
                <StatsCard
                  title="词汇总数"
                  value={stats?.total_vocabulary?.toString() || "0"}
                  icon={<Target className="h-5 w-5" />}
                  trend={{ value: 5, isPositive: true }}
                />
                <StatsCard
                  title="平均完成率"
                  value={`${stats?.average_completion || 0}%`}
                  icon={<TrendingUp className="h-5 w-5" />}
                  trend={{ value: 3.2, isPositive: true }}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      课程完成度趋势
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={courseProgressData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="completion" stroke="#8884d8" strokeWidth={2} />
                          <Line type="monotone" dataKey="feedback" stroke="#82ca9d" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>内容类型分布</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={contentTypeData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            dataKey="value"
                          >
                            {contentTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>最近内容活动</CardTitle>
                  <CardDescription>最新的内容创建和更新记录</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <BookOpen className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{activity.title}</p>
                            <p className="text-sm text-gray-500">第{activity.day_number}天课程</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={activity.status} />
                          <span className="text-sm text-gray-500">{activity.last_updated}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 90天课程管理 */}
            <TabsContent value="courses" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    90天课程管理
                  </CardTitle>
                  <CardDescription>
                    管理90天学习路径中每天的课程内容
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* 搜索和筛选 */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="搜索课程标题..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="状态" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部状态</SelectItem>
                          <SelectItem value="published">已发布</SelectItem>
                          <SelectItem value="draft">草稿</SelectItem>
                          <SelectItem value="review">审核中</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filterLevel} onValueChange={setFilterLevel}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="难度" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部难度</SelectItem>
                          <SelectItem value="beginner">初级</SelectItem>
                          <SelectItem value="intermediate">中级</SelectItem>
                          <SelectItem value="advanced">高级</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={() => handleCreateContent('course')} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      添加课程
                        </Button>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox />
                        </TableHead>
                        <TableHead>天数</TableHead>
                        <TableHead>课程标题</TableHead>
                        <TableHead>难度</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>材料数</TableHead>
                        <TableHead>完成率</TableHead>
                        <TableHead>评分</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCourses.map((course) => (
                        <CourseTableRow
                          key={course.id}
                          course={course}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onView={handleView}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 学习材料库管理 */}
            <TabsContent value="materials" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    学习材料库
                  </CardTitle>
                  <CardDescription>
                    管理视频、音频、文本和测验等各类学习资源
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* 材料库统计卡片 */}
                  <div className="grid gap-4 md:grid-cols-4 mb-6">
                    <Card>
                      <CardContent className="flex items-center p-6">
                        <Video className="h-8 w-8 text-blue-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">视频材料</p>
                          <p className="text-2xl font-bold">{materials.filter(m => m.type === 'video').length}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="flex items-center p-6">
                        <Volume2 className="h-8 w-8 text-green-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">音频材料</p>
                          <p className="text-2xl font-bold">{materials.filter(m => m.type === 'audio').length}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="flex items-center p-6">
                        <FileText className="h-8 w-8 text-orange-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">文本材料</p>
                          <p className="text-2xl font-bold">{materials.filter(m => m.type === 'text').length}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="flex items-center p-6">
                        <Brain className="h-8 w-8 text-purple-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">测验材料</p>
                          <p className="text-2xl font-bold">{materials.filter(m => m.type === 'quiz').length}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* 搜索和筛选 */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="搜索学习材料..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="类型" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部类型</SelectItem>
                          <SelectItem value="video">视频</SelectItem>
                          <SelectItem value="audio">音频</SelectItem>
                          <SelectItem value="text">文本</SelectItem>
                          <SelectItem value="quiz">测验</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={() => handleCreateContent('material')} className="bg-green-600 hover:bg-green-700">
                        <Plus className="h-4 w-4 mr-2" />
                        添加材料
                      </Button>
                    </div>
                  </div>

                  {/* 材料表格 */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox />
                        </TableHead>
                        <TableHead>材料标题</TableHead>
                        <TableHead>类型</TableHead>
                        <TableHead>所属课程</TableHead>
                        <TableHead>时长</TableHead>
                        <TableHead>文件大小</TableHead>
                        <TableHead>观看/下载</TableHead>
                        <TableHead>评分</TableHead>
                        <TableHead>创建时间</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMaterials.map((material) => (
                        <TableRow key={material.id}>
                          <TableCell>
                            <Checkbox />
                          </TableCell>
                          <TableCell className="font-medium">{material.title}</TableCell>
                          <TableCell>
                            <TypeBadge type={material.type} />
                          </TableCell>
                          <TableCell>第{material.course_day}天</TableCell>
                          <TableCell>{formatDuration(material.duration)}</TableCell>
                          <TableCell>{material.size}</TableCell>
                          <TableCell>{material.views}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-400" />
                              <span>{material.rating}</span>
                            </div>
                          </TableCell>
                          <TableCell>{material.created_at}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleView(material.id)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(material.id)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(material.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 词汇库管理 */}
            <TabsContent value="vocabulary" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    词汇库管理
                  </CardTitle>
                  <CardDescription>
                    管理按JLPT级别分类的日语词汇
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* JLPT级别统计 */}
                  <div className="grid gap-4 md:grid-cols-5 mb-6">
                    {['N5', 'N4', 'N3', 'N2', 'N1'].map((level) => (
                      <Card key={level}>
                        <CardContent className="flex items-center justify-between p-4">
                          <div>
                            <p className="text-sm font-medium text-gray-600">{level} 级词汇</p>
                            <p className="text-2xl font-bold">
                              {vocabulary.filter(v => v.jlpt_level === level).length}
                            </p>
                          </div>
                          <Award className={`h-6 w-6 ${
                            level === 'N1' ? 'text-red-500' :
                            level === 'N2' ? 'text-orange-500' :
                            level === 'N3' ? 'text-yellow-500' :
                            level === 'N4' ? 'text-blue-500' : 'text-green-500'
                          }`} />
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* 搜索和筛选 */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="搜索日语单词、假名或中文..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-80"
                        />
                      </div>
                      <Select value={filterLevel} onValueChange={setFilterLevel}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="JLPT级别" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部级别</SelectItem>
                          <SelectItem value="N5">N5</SelectItem>
                          <SelectItem value="N4">N4</SelectItem>
                          <SelectItem value="N3">N3</SelectItem>
                          <SelectItem value="N2">N2</SelectItem>
                          <SelectItem value="N1">N1</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={() => handleCreateContent('vocabulary')} className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="h-4 w-4 mr-2" />
                        添加词汇
                      </Button>
                    </div>
                  </div>

                  {/* 词汇表格 */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox />
                        </TableHead>
                        <TableHead>单词</TableHead>
                        <TableHead>读音</TableHead>
                        <TableHead>中文意思</TableHead>
                        <TableHead>词性</TableHead>
                        <TableHead>JLPT级别</TableHead>
                        <TableHead>例句</TableHead>
                        <TableHead>掌握度</TableHead>
                        <TableHead>添加时间</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVocabulary.map((vocab) => (
                        <TableRow key={vocab.id}>
                          <TableCell>
                            <Checkbox />
                          </TableCell>
                          <TableCell className="font-bold text-lg">{vocab.word}</TableCell>
                          <TableCell className="text-blue-600">{vocab.reading}</TableCell>
                          <TableCell>{vocab.meaning}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{vocab.part_of_speech}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${
                              vocab.jlpt_level === 'N1' ? 'bg-red-100 text-red-800' :
                              vocab.jlpt_level === 'N2' ? 'bg-orange-100 text-orange-800' :
                              vocab.jlpt_level === 'N3' ? 'bg-yellow-100 text-yellow-800' :
                              vocab.jlpt_level === 'N4' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {vocab.jlpt_level}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate" title={vocab.example_sentence}>
                            {vocab.example_sentence}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 w-16">
                                <div 
                                  className="bg-green-600 h-2 rounded-full" 
                                  style={{ width: `${vocab.mastery_rate}%` }}
                                />
                              </div>
                              <span className="text-sm">{vocab.mastery_rate}%</span>
                            </div>
                          </TableCell>
                          <TableCell>{vocab.created_at}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleView(vocab.id)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(vocab.id)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(vocab.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 练习题库管理 */}
            <TabsContent value="exercises" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    练习题库管理
                  </CardTitle>
                  <CardDescription>
                    管理听力、口语、语法和词汇练习题
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* 练习题类型统计 */}
                  <div className="grid gap-4 md:grid-cols-4 mb-6">
                    <Card>
                      <CardContent className="flex items-center p-6">
                        <Volume2 className="h-8 w-8 text-blue-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">听力练习</p>
                          <p className="text-2xl font-bold">{exercises.filter(e => e.type === 'listening').length}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="flex items-center p-6">
                        <MessageSquare className="h-8 w-8 text-green-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">口语练习</p>
                          <p className="text-2xl font-bold">{exercises.filter(e => e.type === 'speaking').length}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="flex items-center p-6">
                        <BookOpen className="h-8 w-8 text-orange-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">语法练习</p>
                          <p className="text-2xl font-bold">{exercises.filter(e => e.type === 'grammar').length}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="flex items-center p-6">
                        <Target className="h-8 w-8 text-purple-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">词汇练习</p>
                          <p className="text-2xl font-bold">{exercises.filter(e => e.type === 'vocabulary').length}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* 搜索和筛选 */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="搜索练习题..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="类型" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部类型</SelectItem>
                          <SelectItem value="listening">听力</SelectItem>
                          <SelectItem value="speaking">口语</SelectItem>
                          <SelectItem value="grammar">语法</SelectItem>
                          <SelectItem value="vocabulary">词汇</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filterLevel} onValueChange={setFilterLevel}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="难度" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部难度</SelectItem>
                          <SelectItem value="easy">简单</SelectItem>
                          <SelectItem value="medium">中等</SelectItem>
                          <SelectItem value="hard">困难</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={() => handleCreateContent('exercise')} className="bg-red-600 hover:bg-red-700">
                        <Plus className="h-4 w-4 mr-2" />
                        添加练习题
                      </Button>
                    </div>
                  </div>

                  {/* 练习题表格 */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox />
                        </TableHead>
                        <TableHead>题目标题</TableHead>
                        <TableHead>类型</TableHead>
                        <TableHead>所属课程</TableHead>
                        <TableHead>难度</TableHead>
                        <TableHead>完成率</TableHead>
                        <TableHead>平均得分</TableHead>
                        <TableHead>创建时间</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExercises.map((exercise) => (
                        <TableRow key={exercise.id}>
                          <TableCell>
                            <Checkbox />
                          </TableCell>
                          <TableCell className="font-medium">{exercise.title}</TableCell>
                          <TableCell>
                            <TypeBadge type={exercise.type} />
                          </TableCell>
                          <TableCell>第{exercise.course_day}天</TableCell>
                          <TableCell>
                            <DifficultyBadge difficulty={exercise.difficulty} />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 w-16">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${exercise.completion_rate}%` }}
                                />
                              </div>
                              <span className="text-sm">{exercise.completion_rate}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <BarChart3 className="h-4 w-4 text-green-500" />
                              <span>{exercise.average_score}分</span>
                            </div>
                          </TableCell>
                          <TableCell>{exercise.created_at}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleView(exercise.id)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(exercise.id)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(exercise.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* 创建内容对话框 */}
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>创建新{getContentTypeName(contentType)}</DialogTitle>
                <DialogDescription>
                  填写{getContentTypeName(contentType)}的相关信息
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <ContentTypeSelector 
                  contentType={contentType} 
                  onTypeChange={setContentType} 
                />

                {contentType === 'course' && (
                  <CourseForm 
                    form={courseForm}
                    onChange={handleCourseFormChange}
                  />
                )}

                {contentType === 'material' && (
                  <MaterialForm 
                    form={materialForm}
                    courses={courses}
                    uploading={uploading}
                    onChange={handleMaterialFormChange}
                    onFileUpload={handleFileUpload}
                  />
                )}

                {contentType === 'vocabulary' && (
                  <VocabularyForm 
                    form={vocabularyForm}
                    onChange={handleVocabularyFormChange}
                  />
                )}

                {contentType === 'exercise' && (
                  <ExerciseForm 
                    form={exerciseForm}
                    courses={courses}
                    onChange={handleExerciseFormChange}
                  />
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleSaveContent} disabled={saving}>
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      创建中...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      创建{getContentTypeName(contentType)}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default AdminContentManagement; 