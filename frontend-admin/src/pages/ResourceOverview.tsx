import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import TopNavbar from '@/components/admin/TopNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  TrendingUp, 
  Activity, 
  FileText, 
  Music, 
  BookOpen, 
  Video,
  Globe,
  Upload,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Users,
  Calendar,
  Monitor,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';
import resourceService, { 
  ResourceStats, 
  ResourceItem, 
  ImportTask,
  PaginatedResponse 
} from '@/services/resourceService';

interface StatsCard {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
}

const ResourceOverview: React.FC = () => {
  const { toast } = useToast();
  const { isCollapsed } = useSidebar();
  
  // 状态管理
  const [stats, setStats] = useState<ResourceStats | null>(null);
  const [recentResources, setRecentResources] = useState<ResourceItem[]>([]);
  const [activeTasks, setActiveTasks] = useState<ImportTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // 初始化数据加载
  useEffect(() => {
    initializeData();
    
    // 设置定时刷新
    const interval = setInterval(() => {
      refreshData();
    }, 30000); // 每30秒刷新一次

    return () => clearInterval(interval);
  }, []);

  /**
   * 初始化数据 - 对接后端初期化API
   */
  const initializeData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadRecentResources(),
        loadActiveTasks()
      ]);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('初始化数据失败:', error);
      toast({
        title: "初始化失败",
        description: "无法加载资源概览数据，请检查网络连接或刷新页面重试。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 加载统计信息
   */
  const loadStats = async () => {
    try {
      const statsData = await resourceService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('加载统计信息失败:', error);
      throw error;
    }
  };

  /**
   * 加载最新资源
   */
  const loadRecentResources = async () => {
    try {
      const response: PaginatedResponse<ResourceItem> = await resourceService.getResources(1, 5);
      setRecentResources(response.data);
    } catch (error) {
      console.error('加载最新资源失败:', error);
      throw error;
    }
  };

  /**
   * 加载活跃任务
   */
  const loadActiveTasks = async () => {
    try {
      const response: PaginatedResponse<ImportTask> = await resourceService.getTasks(1, 10);
      // 过滤出活跃的任务
      const activeTasksList = response.data.filter(
        task => task.status === 'running' || task.status === 'pending'
      );
      setActiveTasks(activeTasksList);
    } catch (error) {
      console.error('加载活跃任务失败:', error);
      throw error;
    }
  };

  /**
   * 刷新数据
   */
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        loadStats(),
        loadRecentResources(),
        loadActiveTasks()
      ]);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('刷新数据失败:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  /**
   * 手动刷新
   */
  const handleRefresh = () => {
    refreshData();
    toast({
      title: "刷新成功",
      description: "数据已更新到最新状态",
    });
  };

  /**
   * 生成统计卡片数据
   */
  const getStatsCards = (): StatsCard[] => {
    if (!stats) return [];

    return [
      {
        title: '总资源数',
        value: stats.total_resources.toLocaleString(),
        description: '系统中的所有资源',
        icon: Database,
        trend: { value: 12, isPositive: true },
        color: 'blue'
      },
      {
        title: '完成资源',
        value: stats.completed_resources.toLocaleString(),
        description: '已成功处理的资源',
        icon: CheckCircle,
        trend: { value: 8, isPositive: true },
        color: 'green'
      },
      {
        title: '活跃任务',
        value: stats.active_tasks,
        description: '正在运行的导入任务',
        icon: Activity,
        color: 'yellow'
      },
      {
        title: '成功率',
        value: `${stats.success_rate.toFixed(1)}%`,
        description: '资源处理成功率',
        icon: TrendingUp,
        trend: { value: 5, isPositive: true },
        color: 'purple'
      },
      {
        title: '总存储',
        value: stats.total_size,
        description: '占用的存储空间',
        icon: Monitor,
        color: 'indigo'
      },
      {
        title: '失败资源',
        value: stats.failed_resources,
        description: '处理失败的资源',
        icon: AlertCircle,
        color: 'red'
      }
    ];
  };

  /**
   * 获取状态颜色
   */
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      completed: 'bg-green-500',
      running: 'bg-blue-500',
      pending: 'bg-yellow-500',
      failed: 'bg-red-500',
      error: 'bg-red-500',
      paused: 'bg-gray-500',
      processing: 'bg-blue-500',
      downloading: 'bg-indigo-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  /**
   * 获取类型图标
   */
  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      course: BookOpen,
      material: FileText,
      vocabulary: Users,
      audio: Music,
      video: Video,
      'web-scraping': Globe,
      'file-upload': Upload,
      'api-import': Download
    };
    const Icon = icons[type] || FileText;
    return <Icon className="w-4 h-4" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar activePath="/admin/resources/overview" />
        <div className={cn("flex-1 transition-all duration-300", isCollapsed ? "ml-16" : "ml-64")}>
          <TopNavbar />
          <div className="p-6">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                <p className="text-gray-600">正在加载资源概览...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statsCards = getStatsCards();

    return (    <div className="min-h-screen bg-gray-50 flex">      <AdminSidebar activePath="/admin/resources/overview" />      <div className={cn("flex-1 transition-all duration-300 main-content", isCollapsed ? "collapsed" : "")}>        <TopNavbar />
        
        <div className="p-6">
          {/* 页面标题和刷新按钮 */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">资源管理概览</h1>
              <p className="text-gray-600 mt-1">
                系统资源的实时状态和统计信息
                <span className="ml-2 text-sm text-gray-500">
                  最后更新: {lastUpdated.toLocaleTimeString()}
                </span>
              </p>
            </div>
            <Button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
              刷新数据
            </Button>
          </div>

          {/* 统计卡片网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {statsCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {card.title}
                    </CardTitle>
                    <Icon className={cn(
                      "w-5 h-5",
                      card.color === 'blue' && "text-blue-500",
                      card.color === 'green' && "text-green-500",
                      card.color === 'yellow' && "text-yellow-500",
                      card.color === 'red' && "text-red-500",
                      card.color === 'purple' && "text-purple-500",
                      card.color === 'indigo' && "text-indigo-500"
                    )} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {card.value}
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {card.description}
                    </p>
                    {card.trend && (
                      <div className="flex items-center text-xs">
                        <TrendingUp className={cn(
                          "w-3 h-3 mr-1",
                          card.trend.isPositive ? "text-green-500" : "text-red-500"
                        )} />
                        <span className={cn(
                          card.trend.isPositive ? "text-green-600" : "text-red-600"
                        )}>
                          {card.trend.isPositive ? '+' : ''}{card.trend.value}%
                        </span>
                        <span className="text-gray-500 ml-1">vs 上周</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* 主要内容区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 最新资源 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  最新资源
                </CardTitle>
                <CardDescription>
                  最近添加或更新的资源
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentResources.length > 0 ? (
                  <div className="space-y-4">
                    {recentResources.map((resource) => (
                      <div key={resource.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(resource.type)}
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {resource.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {resourceService.formatTimeDiff(resource.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={resource.status === 'completed' ? 'default' : 'secondary'}>
                            {resourceService.getStatusText(resource.status)}
                          </Badge>
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            getStatusColor(resource.status)
                          )} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>暂无资源</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 活跃任务 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  活跃任务
                </CardTitle>
                <CardDescription>
                  正在运行的导入和处理任务
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeTasks.length > 0 ? (
                  <div className="space-y-4">
                    {activeTasks.map((task) => (
                      <div key={task.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(task.type)}
                            <span className="font-medium text-gray-900 text-sm">
                              {task.name}
                            </span>
                          </div>
                          <Badge variant={task.status === 'running' ? 'default' : 'secondary'}>
                            {resourceService.getStatusText(task.status)}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>{task.items_processed} / {task.total_items}</span>
                            <span>{task.progress.toFixed(1)}%</span>
                          </div>
                          <Progress value={task.progress} className="h-2" />
                        </div>
                        {task.logs && task.logs.length > 0 && (
                          <p className="text-xs text-gray-500 mt-2">
                            {task.logs[task.logs.length - 1]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>暂无活跃任务</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 资源类型分布 */}
          {stats && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  资源类型分布
                </CardTitle>
                <CardDescription>
                  不同类型资源的数量统计
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(stats.resource_by_type).map(([type, count]) => (
                    <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-center mb-2">
                        {getTypeIcon(type)}
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {count.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {resourceService.getTypeText(type)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 最近活动 */}
          {stats && stats.recent_activities && stats.recent_activities.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  最近活动
                </CardTitle>
                <CardDescription>
                  系统的最新操作记录
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.recent_activities.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          {activity.action}: <span className="font-medium">{activity.resource_name}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          {resourceService.formatTimeDiff(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceOverview; 