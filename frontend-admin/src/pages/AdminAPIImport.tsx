import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import TopNavbar from '@/components/admin/TopNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Zap,
  Plus,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  Database
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';

interface APIConnection {
  id: number;
  name: string;
  api_url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  status: 'active' | 'inactive' | 'error' | 'testing';
  last_sync: string;
  items_imported: number;
  description?: string;
  auth_type: 'none' | 'api_key' | 'bearer' | 'basic';
}

interface ImportJob {
  id: number;
  connection_id: number;
  connection_name: string;
  status: 'running' | 'completed' | 'failed' | 'queued';
  progress: number;
  items_processed: number;
  total_items: number;
  started_at: string;
  completed_at?: string;
}

const AdminAPIImport: React.FC = () => {
  const { toast } = useToast();
  const { isCollapsed } = useSidebar();
  
  const [connections, setConnections] = useState<APIConnection[]>([]);
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 模拟数据
      const mockConnections: APIConnection[] = [
        {
          id: 1,
          name: "JMdict词典API",
          api_url: "https://jmdict.org/api/v1/entries",
          method: "GET",
          status: "active",
          last_sync: "2024-01-20 10:30",
          items_imported: 15000,
          description: "日语词典数据导入",
          auth_type: "api_key"
        },
        {
          id: 2,
          name: "日语新闻API",
          api_url: "https://newsapi.jp/v2/articles",
          method: "GET",
          status: "active",
          last_sync: "2024-01-20 09:15",
          items_imported: 250,
          description: "实时新闻内容导入",
          auth_type: "bearer"
        },
        {
          id: 3,
          name: "语法数据库",
          api_url: "https://grammar-db.com/api/rules",
          method: "GET",
          status: "error",
          last_sync: "2024-01-19 14:20",
          items_imported: 0,
          description: "日语语法规则导入",
          auth_type: "basic"
        }
      ];

      const mockJobs: ImportJob[] = [
        {
          id: 1,
          connection_id: 1,
          connection_name: "JMdict词典API",
          status: "running",
          progress: 65,
          items_processed: 6500,
          total_items: 10000,
          started_at: "2024-01-20 14:30"
        },
        {
          id: 2,
          connection_id: 2,
          connection_name: "日语新闻API",
          status: "completed",
          progress: 100,
          items_processed: 50,
          total_items: 50,
          started_at: "2024-01-20 13:15",
          completed_at: "2024-01-20 13:20"
        }
      ];

      setConnections(mockConnections);
      setJobs(mockJobs);
    } catch (error) {
      console.error('获取API连接失败:', error);
      toast({
        title: "错误",
        description: "无法加载API连接信息",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'testing': return 'bg-blue-100 text-blue-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'queued': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '活跃';
      case 'inactive': return '未激活';
      case 'error': return '错误';
      case 'testing': return '测试中';
      case 'running': return '运行中';
      case 'completed': return '已完成';
      case 'failed': return '失败';
      case 'queued': return '队列中';
      default: return status;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-800';
      case 'POST': return 'bg-green-100 text-green-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    totalConnections: connections.length,
    activeConnections: connections.filter(c => c.status === 'active').length,
    runningJobs: jobs.filter(j => j.status === 'running').length,
    totalImported: connections.reduce((sum, c) => sum + c.items_imported, 0)
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar activePath="/admin/resources/api-import" />
      <div className={cn("flex-1 transition-all duration-300 main-content", isCollapsed ? "collapsed" : "")}>
        <TopNavbar />
        
        <div className="p-6">
          {/* 页面标题和操作按钮 */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Zap className="w-8 h-8 text-yellow-500" />
                API导入管理
              </h1>
              <p className="text-gray-600 mt-1">
                管理外部API数据源和导入任务
              </p>
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              新增API连接
            </Button>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">API连接数</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalConnections}</p>
                  </div>
                  <Database className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">活跃连接</p>
                    <p className="text-2xl font-bold text-green-600">{stats.activeConnections}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">运行任务</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.runningJobs}</p>
                  </div>
                  <Play className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">总导入项</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.totalImported.toLocaleString()}</p>
                  </div>
                  <RefreshCw className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* API连接列表 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>API连接</CardTitle>
              <CardDescription>
                管理外部API数据源连接
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">正在加载API连接...</p>
                </div>
              ) : connections.length === 0 ? (
                <div className="text-center py-8">
                  <Zap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">暂无API连接</p>
                  <Button 
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4"
                    variant="outline"
                  >
                    创建第一个连接
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {connections.map((connection) => (
                    <div key={connection.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{connection.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <ExternalLink className="w-3 h-3" />
                              <span>{connection.api_url}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getMethodColor(connection.method)}>
                            {connection.method}
                          </Badge>
                          <Badge className={getStatusColor(connection.status)}>
                            {getStatusText(connection.status)}
                          </Badge>
                          <Button size="sm" variant="outline">
                            <Settings className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {connection.description && (
                        <p className="text-sm text-gray-600 mb-3">{connection.description}</p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-500">认证方式</p>
                          <p className="font-medium">{connection.auth_type.toUpperCase()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">已导入项目</p>
                          <p className="font-medium">{connection.items_imported.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">最后同步</p>
                          <p className="font-medium">{connection.last_sync}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">操作</p>
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="outline">
                              <RefreshCw className="w-3 h-3 mr-1" />
                              同步
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3 mr-1" />
                              测试
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

          {/* 导入任务 */}
          <Card>
            <CardHeader>
              <CardTitle>导入任务</CardTitle>
              <CardDescription>
                监控正在运行和已完成的导入任务
              </CardDescription>
            </CardHeader>
            <CardContent>
              {jobs.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">暂无导入任务</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                            <RefreshCw className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{job.connection_name}</h4>
                            <p className="text-sm text-gray-500">任务 #{job.id}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(job.status)}>
                          {getStatusText(job.status)}
                        </Badge>
                      </div>

                      {job.status === 'running' && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                            <span>进度</span>
                            <span>{job.items_processed} / {job.total_items} ({job.progress}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${job.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <span className="text-gray-500">开始时间: {job.started_at}</span>
                          {job.completed_at && (
                            <span className="text-gray-500">完成时间: {job.completed_at}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {job.status === 'running' && (
                            <Button size="sm" variant="outline">
                              <Pause className="w-3 h-3 mr-1" />
                              暂停
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3 mr-1" />
                            详情
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

export default AdminAPIImport; 