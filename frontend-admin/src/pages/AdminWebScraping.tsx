import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import TopNavbar from '@/components/admin/TopNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Globe,
  Plus,
  Search,
  Play,
  Pause,
  Trash2,
  Settings,
  ExternalLink,
  Calendar,
  Clock,
  Database
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';

interface ScrapingTask {
  id: number;
  name: string;
  url: string;
  status: 'running' | 'paused' | 'completed' | 'failed';
  progress: number;
  items_scraped: number;
  total_items: number;
  created_at: string;
  last_run: string;
}

const AdminWebScraping: React.FC = () => {
  const { toast } = useToast();
  const { isCollapsed } = useSidebar();
  
  const [tasks, setTasks] = useState<ScrapingTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      // 模拟数据
      const mockTasks: ScrapingTask[] = [
        {
          id: 1,
          name: "NHK新闻爬取",
          url: "https://www3.nhk.or.jp/news/",
          status: "running",
          progress: 75,
          items_scraped: 150,
          total_items: 200,
          created_at: "2024-01-15",
          last_run: "2024-01-20 14:30"
        },
        {
          id: 2,
          name: "日语学习网站内容",
          url: "https://example.jp/lessons",
          status: "completed",
          progress: 100,
          items_scraped: 500,
          total_items: 500,
          created_at: "2024-01-10",
          last_run: "2024-01-19 09:15"
        }
      ];
      setTasks(mockTasks);
    } catch (error) {
      console.error('获取抓取任务失败:', error);
      toast({
        title: "错误",
        description: "无法加载抓取任务",
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
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running': return '运行中';
      case 'paused': return '已暂停';
      case 'completed': return '已完成';
      case 'failed': return '失败';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar activePath="/admin/resources/scraping" />
      <div className={cn("flex-1 transition-all duration-300 main-content", isCollapsed ? "collapsed" : "")}>
        <TopNavbar />
        
        <div className="p-6">
          {/* 页面标题和操作按钮 */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Globe className="w-8 h-8 text-blue-500" />
                网页抓取管理
              </h1>
              <p className="text-gray-600 mt-1">
                管理和监控网页内容抓取任务
              </p>
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              新建抓取任务
            </Button>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">总任务数</p>
                    <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
                  </div>
                  <Database className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">运行中</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {tasks.filter(t => t.status === 'running').length}
                    </p>
                  </div>
                  <Play className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">已完成</p>
                    <p className="text-2xl font-bold text-green-600">
                      {tasks.filter(t => t.status === 'completed').length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">已抓取项目</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {tasks.reduce((sum, t) => sum + t.items_scraped, 0)}
                    </p>
                  </div>
                  <Search className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 任务列表 */}
          <Card>
            <CardHeader>
              <CardTitle>抓取任务</CardTitle>
              <CardDescription>
                管理和监控所有网页抓取任务
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">正在加载任务...</p>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8">
                  <Globe className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">暂无抓取任务</p>
                  <Button 
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4"
                    variant="outline"
                  >
                    创建第一个任务
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Globe className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{task.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <ExternalLink className="w-3 h-3" />
                              <span>{task.url}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(task.status)}>
                            {getStatusText(task.status)}
                          </Badge>
                          <Button size="sm" variant="outline">
                            <Settings className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-500">进度</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${task.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{task.progress}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">已抓取</p>
                          <p className="font-medium">{task.items_scraped} / {task.total_items}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">创建时间</p>
                          <p className="font-medium">{task.created_at}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">最后运行</p>
                          <p className="font-medium">{task.last_run}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {task.status === 'running' ? (
                          <Button size="sm" variant="outline">
                            <Pause className="w-3 h-3 mr-1" />
                            暂停
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline">
                            <Play className="w-3 h-3 mr-1" />
                            开始
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          查看详情
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-3 h-3 mr-1" />
                          删除
                        </Button>
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

export default AdminWebScraping; 