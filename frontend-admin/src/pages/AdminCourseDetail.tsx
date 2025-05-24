import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';
import { contentService, type CourseDetail } from '@/services/contentService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  BookOpen,
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  Users,
  Eye,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  Video,
  Volume2,
  FileText,
  Brain,
  Star,
  ChevronRight,
  RefreshCw,
  Download,
  Share2
} from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import TopNavbar from '@/components/admin/TopNavbar';
import StatsCard from '@/components/admin/StatsCard';

const AdminCourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isCollapsed } = useSidebar();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [courseDetail, setCourseDetail] = useState<CourseDetail | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 加载课程详情
  const loadCourseDetail = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await contentService.getCourseDetail(parseInt(id));
      
      if (response.success) {
        setCourseDetail(response.data);
      } else {
        throw new Error('获取课程详情失败');
      }
    } catch (error) {
      console.error('Failed to load course detail:', error);
      toast({
        title: "加载失败",
        description: "无法加载课程详情，请稍后重试",
        variant: "destructive",
      });
      navigate('/admin/content/courses');
    } finally {
      setLoading(false);
    }
  }, [id, toast, navigate]);

  useEffect(() => {
    loadCourseDetail();
  }, [loadCourseDetail]);

  // 难度徽章
  const DifficultyBadge = ({ difficulty }: { difficulty: string }) => {
    const badgeConfig = {
      beginner: { className: 'bg-green-100 text-green-800', label: '初级' },
      intermediate: { className: 'bg-yellow-100 text-yellow-800', label: '中级' },
      advanced: { className: 'bg-red-100 text-red-800', label: '高级' }
    };
    const config = badgeConfig[difficulty as keyof typeof badgeConfig] || { className: 'bg-gray-100 text-gray-800', label: difficulty };
    
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  // 状态徽章
  const StatusBadge = ({ status }: { status: string }) => {
    const badgeConfig = {
      published: { className: 'bg-green-100 text-green-800', label: '已发布' },
      draft: { className: 'bg-gray-100 text-gray-800', label: '草稿' },
      review: { className: 'bg-yellow-100 text-yellow-800', label: '审核中' }
    };
    const config = badgeConfig[status as keyof typeof badgeConfig] || { className: 'bg-gray-100 text-gray-800', label: status };
    
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  // 类型徽章
  const TypeBadge = ({ type }: { type: string }) => {
    const badgeConfig = {
      video: { icon: <Video className="h-3 w-3" />, label: '视频' },
      audio: { icon: <Volume2 className="h-3 w-3" />, label: '音频' },
      text: { icon: <FileText className="h-3 w-3" />, label: '文本' },
      quiz: { icon: <Brain className="h-3 w-3" />, label: '测验' },
      listening: { icon: <Volume2 className="h-3 w-3" />, label: '听力' },
      speaking: { icon: <Target className="h-3 w-3" />, label: '口语' },
      grammar: { icon: <FileText className="h-3 w-3" />, label: '语法' },
      vocabulary: { icon: <Target className="h-3 w-3" />, label: '词汇' }
    };
    const config = badgeConfig[type as keyof typeof badgeConfig] || { icon: <FileText className="h-3 w-3" />, label: type };
    
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  // 格式化时长
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}时${mins}分`;
  };

  // 删除课程
  const handleDeleteCourse = async () => {
    if (!courseDetail) return;
    
    try {
      setDeleting(true);
      // TODO: 实现删除课程API
      // await contentService.deleteCourse(courseDetail.id);
      
      toast({
        title: "删除成功",
        description: "课程已成功删除",
      });
      
      navigate('/admin/content/courses');
    } catch (error) {
      console.error('Delete course failed:', error);
      toast({
        title: "删除失败",
        description: "删除课程失败，请重试",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

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

  if (!courseDetail) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar activePath="/admin/content" />
        <div className={cn(
          "main-content flex-1 flex flex-col transition-all duration-300",
          isCollapsed && "collapsed"
        )}>
          <TopNavbar />
          <main className="flex-1 p-6 overflow-auto">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">课程不存在</h1>
              <Link to="/admin/content/courses">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  返回课程列表
                </Button>
              </Link>
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
          {/* 面包屑导航 */}
          <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
            <Link to="/admin/content" className="hover:text-blue-600">内容管理</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/admin/content/courses" className="hover:text-blue-600">90天课程</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 font-medium">第{courseDetail.day_number}天课程详情</span>
          </nav>

          {/* 课程头部信息 */}
          <div className="mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <Link to="/admin/content/courses">
                    <Button variant="outline" size="sm">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      返回列表
                    </Button>
                  </Link>
                  <div className="flex items-center gap-2">
                    <DifficultyBadge difficulty={courseDetail.difficulty} />
                    <StatusBadge status={courseDetail.status} />
                    {courseDetail.is_active && <Badge className="bg-green-100 text-green-800">启用中</Badge>}
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  第{courseDetail.day_number}天：{courseDetail.title}
                </h1>
                <p className="text-lg text-gray-600 mb-4">
                  {courseDetail.description}
                </p>
                {courseDetail.tags && courseDetail.tags.length > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-gray-500">标签：</span>
                    {courseDetail.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  分享
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  导出
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  编辑
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  删除
                </Button>
              </div>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <StatsCard
              title="学习材料"
              value={courseDetail.materials_count.toString()}
              icon={<BookOpen className="h-5 w-5" />}
              trend={{ value: 0, isPositive: true }}
            />
            <StatsCard
              title="练习题目"
              value={courseDetail.exercises_count.toString()}
              icon={<Brain className="h-5 w-5" />}
              trend={{ value: 0, isPositive: true }}
            />
            <StatsCard
              title="完成率"
              value={`${courseDetail.completion_rate}%`}
              icon={<TrendingUp className="h-5 w-5" />}
              trend={{ value: courseDetail.completion_rate, isPositive: true }}
            />
            <StatsCard
              title="用户反馈"
              value={courseDetail.user_feedback.toString()}
              icon={<Star className="h-5 w-5" />}
              trend={{ value: courseDetail.user_feedback, isPositive: true }}
            />
          </div>

          {/* 课程详细信息标签页 */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">概览</TabsTrigger>
              <TabsTrigger value="materials">学习材料</TabsTrigger>
              <TabsTrigger value="exercises">练习题目</TabsTrigger>
              <TabsTrigger value="analytics">数据分析</TabsTrigger>
              <TabsTrigger value="users">学习进度</TabsTrigger>
            </TabsList>

            {/* 概览标签页 */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* 基本信息 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      基本信息
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">创建时间</label>
                        <p className="text-sm">{courseDetail.created_at}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">最后更新</label>
                        <p className="text-sm">{courseDetail.updated_at}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">课程天数</label>
                        <p className="text-sm">第 {courseDetail.day_number} 天</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">难度等级</label>
                        <div className="mt-1">
                          <DifficultyBadge difficulty={courseDetail.difficulty} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 学习进度统计 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      学习进度统计
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">总用户数</span>
                        <span className="font-semibold">{courseDetail.user_progress.total_users}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">已完成</span>
                        <span className="font-semibold text-green-600">{courseDetail.user_progress.completed_users}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">学习中</span>
                        <span className="font-semibold text-blue-600">{courseDetail.user_progress.in_progress_users}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">未开始</span>
                        <span className="font-semibold text-gray-500">{courseDetail.user_progress.not_started_users}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 学习材料标签页 */}
            <TabsContent value="materials" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      学习材料 ({courseDetail.materials.length})
                    </CardTitle>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      添加材料
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>标题</TableHead>
                        <TableHead>类型</TableHead>
                        <TableHead>时长</TableHead>
                        <TableHead>文件大小</TableHead>
                        <TableHead>浏览量</TableHead>
                        <TableHead>评分</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courseDetail.materials.map((material) => (
                        <TableRow key={material.id}>
                          <TableCell className="font-medium">{material.title}</TableCell>
                          <TableCell>
                            <TypeBadge type={material.type} />
                          </TableCell>
                          <TableCell>{formatDuration(material.duration)}</TableCell>
                          <TableCell>{material.size}</TableCell>
                          <TableCell>{material.views}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-400" />
                              <span>{material.rating}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600">
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

            {/* 练习题目标签页 */}
            <TabsContent value="exercises" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      练习题目 ({courseDetail.exercises.length})
                    </CardTitle>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      添加练习题
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>题目标题</TableHead>
                        <TableHead>类型</TableHead>
                        <TableHead>难度</TableHead>
                        <TableHead>完成率</TableHead>
                        <TableHead>平均分</TableHead>
                        <TableHead>创建时间</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courseDetail.exercises.map((exercise) => (
                        <TableRow key={exercise.id}>
                          <TableCell className="font-medium">{exercise.title}</TableCell>
                          <TableCell>
                            <TypeBadge type={exercise.type} />
                          </TableCell>
                          <TableCell>
                            <DifficultyBadge difficulty={exercise.difficulty} />
                          </TableCell>
                          <TableCell>{exercise.completion_rate}%</TableCell>
                          <TableCell>{exercise.average_score}</TableCell>
                          <TableCell>{exercise.created_at}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600">
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

            {/* 数据分析标签页 */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      访问统计
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">日访问量</span>
                      <span className="font-semibold">{courseDetail.analytics.daily_views}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">周访问量</span>
                      <span className="font-semibold">{courseDetail.analytics.weekly_views}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">月访问量</span>
                      <span className="font-semibold">{courseDetail.analytics.monthly_views}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      学习统计
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">平均学习时长</span>
                      <span className="font-semibold">{formatDuration(courseDetail.analytics.avg_time_spent)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">跳出率</span>
                      <span className="font-semibold">{courseDetail.analytics.bounce_rate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">完成率</span>
                      <span className="font-semibold text-green-600">{courseDetail.completion_rate}%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 学习进度标签页 */}
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    用户学习进度
                  </CardTitle>
                  <CardDescription>
                    查看用户对本课程的学习进度和完成情况
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">暂无用户学习数据</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* 删除确认对话框 */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>确认删除课程</DialogTitle>
                <DialogDescription>
                  您确定要删除第{courseDetail.day_number}天的课程吗？此操作无法撤销，相关的学习材料和练习题也将被删除。
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                  取消
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteCourse}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      删除中...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      确认删除
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

export default AdminCourseDetail; 