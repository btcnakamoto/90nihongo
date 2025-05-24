import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import TopNavbar from '@/components/admin/TopNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ClipboardList,
  Play,
  Pause,
  Square,
  RefreshCw,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  TrendingUp,
  Calendar,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';

interface Task {
  id: number;
  name: string;
  type: 'scraping' | 'upload' | 'api_import' | 'processing';
  status: 'running' | 'paused' | 'completed' | 'failed' | 'queued';
  priority: 'low' | 'medium' | 'high';
  progress: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  items_total: number;
  items_processed: number;
  resource_type: string;
}

const AdminTaskManagement: React.FC = () => {
  const { toast } = useToast();
  const { isCollapsed } = useSidebar();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'running' | 'completed' | 'failed'>('all');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      // 模拟数据
      const mockTasks: Task[] = [
        {
          id: 1,
          name: "NHK新闻内容抓取",
          type: "scraping",
          status: "running",
          priority: "high",
          progress: 75,
          created_at: "2024-01-20 14:00",
          started_at: "2024-01-20 14:05",
          items_total: 200,
          items_processed: 150,
          resource_type: "文章"
        },
        {
          id: 2,
          name: "音频文件处理",
          type: "processing",
          status: "completed",
          priority: "medium",
          progress: 100,
          created_at: "2024-01-20 10:00",
          started_at: "2024-01-20 10:02",
          completed_at: "2024-01-20 12:30",
          items_total: 50,
          items_processed: 50,
          resource_type: "音频"
        },
        {
          id: 3,
          name: "词典API数据导入",
          type: "api_import",
          status: "paused",
          priority: "medium",
          progress: 40,
          created_at: "2024-01-20 09:00",
          started_at: "2024-01-20 09:15",
          items_total: 10000,
          items_processed: 4000,
          resource_type: "词汇"
        },
        {
          id: 4,
          name: "批量文件上传",
          type: "upload",
          status: "failed",
          priority: "low",
          progress: 25,
          created_at: "2024-01-19 16:00",
          started_at: "2024-01-19 16:05",
          error_message: "网络连接超时",
          items_total: 100,
          items_processed: 25,
          resource_type: "文档"
        },
        {
          id: 5,
          name: "视频转码任务",
          type: "processing",
          status: "queued",
          priority: "high",
          progress: 0,
          created_at: "2024-01-20 15:00",
          items_total: 20,
          items_processed: 0,
          resource_type: "视频"
        }
      ];
      setTasks(mockTasks);
    } catch (error) {
      console.error('获取任务失败:', error);
      toast({
        title: "错误",
        description: "无法加载任务列表",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'queued': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running': return '运行中';
      case 'paused': return '已暂停';
      case 'completed': return '已完成';
      case 'failed': return '失败';
      case 'queued': return '队列中';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
      default: return priority;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'scraping': return <Activity className="w-4 h-4 text-blue-500" />;
      case 'upload': return <RefreshCw className="w-4 h-4 text-green-500" />;
      case 'api_import': return <TrendingUp className="w-4 h-4 text-yellow-500" />;
      case 'processing': return <Clock className="w-4 h-4 text-purple-500" />;
      default: return <ClipboardList className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'scraping': return '网页抓取';
      case 'upload': return '文件上传';
      case 'api_import': return 'API导入';
      case 'processing': return '数据处理';
      default: return type;
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const stats = {
    total: tasks.length,
    running: tasks.filter(t => t.status === 'running').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    failed: tasks.filter(t => t.status === 'failed').length,
    queued: tasks.filter(t => t.status === 'queued').length,
    paused: tasks.filter(t => t.status === 'paused').length
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar activePath="/admin/resources/tasks" />
      <div className={cn("flex-1 transition-all duration-300 main-content", isCollapsed ? "collapsed" : "")}>
        <TopNavbar />
        
        <div className="p-6">
          {/* 页面标题 */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <ClipboardList className="w-8 h-8 text-indigo-500" />
                任务管理
              </h1>
              <p className="text-gray-600 mt-1">
                监控和管理所有后台处理任务
              </p>
            </div>
            <Button className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              刷新状态
            </Button>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">总任务数</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <ClipboardList className="w-8 h-8 text-gray-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">运行中</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.running}</p>
                  </div>
                  <Play className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">队列中</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.queued}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">已暂停</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.paused}</p>
                  </div>
                  <Pause className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">已完成</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">失败</p>
                    <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 任务列表 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>任务列表</CardTitle>
                  <CardDescription>
                    查看和管理所有后台处理任务
                  </CardDescription>
                </div>
                <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
                  <TabsList>
                    <TabsTrigger value="all">全部</TabsTrigger>
                    <TabsTrigger value="running">运行中</TabsTrigger>
                    <TabsTrigger value="completed">已完成</TabsTrigger>
                    <TabsTrigger value="failed">失败</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">正在加载任务...</p>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-8">
                  <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">暂无任务</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTasks.map((task) => (
                    <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            {getTypeIcon(task.type)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{task.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>{getTypeText(task.type)}</span>
                              <span>•</span>
                              <span>{task.resource_type}</span>
                              <span>•</span>
                              <span>任务 #{task.id}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(task.priority)}>
                            优先级: {getPriorityText(task.priority)}
                          </Badge>
                          <Badge className={getStatusColor(task.status)}>
                            {getStatusText(task.status)}
                          </Badge>
                        </div>
                      </div>

                      {/* 进度条 */}
                      {(task.status === 'running' || task.status === 'paused') && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                            <span>进度</span>
                            <span>{task.items_processed} / {task.items_total} ({task.progress}%)</span>
                          </div>
                          <Progress value={task.progress} className="h-2" />
                        </div>
                      )}

                      {/* 错误信息 */}
                      {task.status === 'failed' && task.error_message && (
                        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          <AlertCircle className="w-4 h-4 inline mr-1" />
                          {task.error_message}
                        </div>
                      )}

                      {/* 时间信息和操作按钮 */}
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500 space-y-1">
                          <div className="flex items-center gap-4">
                            <span>创建: {task.created_at}</span>
                            {task.started_at && <span>开始: {task.started_at}</span>}
                            {task.completed_at && <span>完成: {task.completed_at}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {task.status === 'running' && (
                            <Button size="sm" variant="outline">
                              <Pause className="w-3 h-3 mr-1" />
                              暂停
                            </Button>
                          )}
                          {task.status === 'paused' && (
                            <Button size="sm" variant="outline">
                              <Play className="w-3 h-3 mr-1" />
                              继续
                            </Button>
                          )}
                          {(task.status === 'failed' || task.status === 'paused') && (
                            <Button size="sm" variant="outline">
                              <RefreshCw className="w-3 h-3 mr-1" />
                              重试
                            </Button>
                          )}
                          {task.status === 'queued' && (
                            <Button size="sm" variant="outline">
                              <Square className="w-3 h-3 mr-1" />
                              取消
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3 mr-1" />
                            详情
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-3 h-3 mr-1" />
                            删除
                          </Button>
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
    </div>
  );
};

export default AdminTaskManagement; 