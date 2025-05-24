import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import TopNavbar from '@/components/admin/TopNavbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  Upload, 
  Globe, 
  FileText, 
  Music, 
  BookOpen, 
  Languages, 
  Video,
  Search,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  Trash2,
  Eye,
  Settings,
  Database,
  FolderOpen,
  Monitor,
  Play,
  Pause,
  Square
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';

interface ResourceItem {
  id: string;
  name: string;
  type: 'course' | 'material' | 'vocabulary' | 'audio' | 'video';
  source: string;
  status: 'pending' | 'downloading' | 'processing' | 'completed' | 'error';
  progress: number;
  createdAt: string;
  size?: string;
  count?: number;
  error?: string;
}

interface ImportTask {
  id: string;
  type: 'web-scraping' | 'file-upload' | 'api-import' | 'batch-process';
  name: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  progress: number;
  startTime: string;
  estimatedTime?: string;
  itemsProcessed: number;
  totalItems: number;
  logs: string[];
}

const AdminResourceManager: React.FC = () => {
  const { toast } = useToast();
  const { isCollapsed } = useSidebar();
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [tasks, setTasks] = useState<ImportTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // 网页抓取配置
  const [scrapingConfig, setScrapingConfig] = useState({
    urls: '',
    maxPages: 10,
    contentType: 'course',
    delayMs: 1000,
    includeImages: true,
    includeAudio: true
  });

  // 文件上传状态
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);

  // API导入配置
  const [apiConfig, setApiConfig] = useState({
    endpoint: '',
    apiKey: '',
    format: 'json',
    batchSize: 100
  });

  useEffect(() => {
    loadResources();
    loadTasks();
    
    // 设置定时更新任务状态
    const interval = setInterval(() => {
      updateTaskStatus();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const loadResources = async () => {
    try {
      // 模拟数据，实际应该从API获取
      const mockResources: ResourceItem[] = [
        {
          id: '1',
          name: 'NHK新闻课程',
          type: 'course',
          source: 'web-scraping',
          status: 'completed',
          progress: 100,
          createdAt: '2024-01-15',
          count: 45
        },
        {
          id: '2',
          name: '日语发音词汇',
          type: 'vocabulary',
          source: 'api-import',
          status: 'processing',
          progress: 75,
          createdAt: '2024-01-15',
          count: 1200
        },
        {
          id: '3',
          name: '听力练习音频',
          type: 'audio',
          source: 'file-upload',
          status: 'downloading',
          progress: 45,
          createdAt: '2024-01-15',
          size: '2.3GB'
        }
      ];
      setResources(mockResources);
    } catch (error) {
      toast({
        title: "加载失败",
        description: "无法加载资源列表",
        variant: "destructive",
      });
    }
  };

  const loadTasks = async () => {
    // 模拟任务数据
    const mockTasks: ImportTask[] = [
      {
        id: '1',
        type: 'web-scraping',
        name: '抓取朝日新闻简单日语',
        status: 'running',
        progress: 60,
        startTime: '2024-01-15 14:30:00',
        estimatedTime: '还需5分钟',
        itemsProcessed: 120,
        totalItems: 200,
        logs: [
          '开始抓取...',
          '已处理120页',
          '正在处理音频文件...'
        ]
      }
    ];
    setTasks(mockTasks);
  };

  const updateTaskStatus = async () => {
    // 实际实现中应该调用API更新任务状态
    setTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.status === 'running' && task.progress < 100) {
          return {
            ...task,
            progress: Math.min(task.progress + Math.random() * 5, 100),
            itemsProcessed: Math.min(task.itemsProcessed + Math.floor(Math.random() * 3), task.totalItems)
          };
        }
        return task;
      })
    );
  };

  const startWebScraping = async () => {
    if (!scrapingConfig.urls.trim()) {
      toast({
        title: "配置错误",
        description: "请输入要抓取的网址",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // 模拟API调用
      const newTask: ImportTask = {
        id: Date.now().toString(),
        type: 'web-scraping',
        name: `网页抓取 - ${scrapingConfig.contentType}`,
        status: 'running',
        progress: 0,
        startTime: new Date().toLocaleString(),
        itemsProcessed: 0,
        totalItems: scrapingConfig.maxPages,
        logs: ['任务已启动', '开始抓取网页...']
      };

      setTasks(prev => [...prev, newTask]);

      toast({
        title: "任务已启动",
        description: "网页抓取任务已开始运行",
      });
    } catch (error) {
      toast({
        title: "启动失败",
        description: "无法启动网页抓取任务",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (uploadFiles.length === 0) {
      toast({
        title: "请选择文件",
        description: "请先选择要上传的文件",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      uploadFiles.forEach(file => {
        formData.append('files[]', file);
      });

      // 实际实现中应该调用上传API
      // const response = await uploadAPI(formData);

      const newTask: ImportTask = {
        id: Date.now().toString(),
        type: 'file-upload',
        name: `文件上传 - ${uploadFiles.length}个文件`,
        status: 'running',
        progress: 0,
        startTime: new Date().toLocaleString(),
        itemsProcessed: 0,
        totalItems: uploadFiles.length,
        logs: ['文件上传已开始']
      };

      setTasks(prev => [...prev, newTask]);

      toast({
        title: "上传开始",
        description: `正在上传${uploadFiles.length}个文件`,
      });
    } catch (error) {
      toast({
        title: "上传失败",
        description: "文件上传过程中出现错误",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startApiImport = async () => {
    if (!apiConfig.endpoint || !apiConfig.apiKey) {
      toast({
        title: "配置错误",
        description: "请填写API端点和密钥",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const newTask: ImportTask = {
        id: Date.now().toString(),
        type: 'api-import',
        name: `API导入 - ${apiConfig.endpoint}`,
        status: 'running',
        progress: 0,
        startTime: new Date().toLocaleString(),
        itemsProcessed: 0,
        totalItems: apiConfig.batchSize,
        logs: ['连接API中...']
      };

      setTasks(prev => [...prev, newTask]);

      toast({
        title: "API导入已启动",
        description: "正在从外部API导入数据",
      });
    } catch (error) {
      toast({
        title: "导入失败",
        description: "API导入过程中出现错误",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const pauseTask = (taskId: string) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, status: task.status === 'running' ? 'paused' : 'running' }
          : task
      )
    );
  };

  const cancelTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <BookOpen className="h-4 w-4" />;
      case 'vocabulary':
        return <Languages className="h-4 w-4" />;
      case 'audio':
        return <Music className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'material':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleImportToContent = (resource: ResourceItem) => {
    // 根据资源类型确定内容管理的目标类型
    const contentTypeMap: { [key: string]: string } = {
      'course': 'courses',
      'material': 'materials', 
      'vocabulary': 'vocabulary',
      'audio': 'materials',
      'video': 'materials'
    };
    
    const targetType = contentTypeMap[resource.type] || 'materials';
    
    // 跳转到内容管理页面并预填充资源信息
    const url = `/admin/content/${targetType}?import_resource=${resource.id}&import_name=${encodeURIComponent(resource.name)}`;
    window.open(url, '_blank');
    
    toast({
      title: "跳转到内容管理",
      description: `已打开内容管理页面，可以将资源 "${resource.name}" 加工为学习内容`,
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar activePath="/admin/resources" />
      
      <div className={cn(
        "main-content flex-1 flex flex-col transition-all duration-300",
        isCollapsed && "collapsed"
      )}>
        <TopNavbar />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="container mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">学习资源管理</h1>
                <p className="text-gray-600 mt-2">管理和获取各种日语学习材料资源</p>
              </div>
              <Button 
                onClick={loadResources} 
                variant="outline"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                刷新
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">概览</TabsTrigger>
                <TabsTrigger value="web-scraping">网页抓取</TabsTrigger>
                <TabsTrigger value="file-upload">文件上传</TabsTrigger>
                <TabsTrigger value="api-import">API导入</TabsTrigger>
                <TabsTrigger value="tasks">任务管理</TabsTrigger>
              </TabsList>

              {/* 概览页面 */}
              <TabsContent value="overview" className="space-y-6">
                {/* 工作流程指南 */}
                <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                      <BookOpen className="h-5 w-5" />
                      学习资源处理工作流程
                    </CardTitle>
                    <CardDescription className="text-blue-600">
                      从原材料获取到结构化学习内容的完整流程
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-medium">1</div>
                          <span className="font-medium">获取原材料</span>
                        </div>
                        <div className="w-8 h-0.5 bg-blue-300"></div>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-medium">2</div>
                          <span className="font-medium">加工为内容</span>
                        </div>
                        <div className="w-8 h-0.5 bg-green-300"></div>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-medium">3</div>
                          <span className="font-medium">发布学习</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open('/admin/content', '_blank')}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        打开内容管理
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* 统计卡片 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">总资源数</CardTitle>
                      <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{resources.length}</div>
                      <p className="text-xs text-muted-foreground">
                        +3 较上周
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">运行中任务</CardTitle>
                      <Monitor className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {tasks.filter(t => t.status === 'running').length}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        2个排队中
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">今日导入</CardTitle>
                      <Download className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">1,245</div>
                      <p className="text-xs text-muted-foreground">
                        条目已导入
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">成功率</CardTitle>
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">98.5%</div>
                      <p className="text-xs text-muted-foreground">
                        +0.5% 较上周
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* 最近资源 */}
                <Card>
                  <CardHeader>
                    <CardTitle>最近导入的资源</CardTitle>
                    <CardDescription>查看最新获取的学习材料</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {resources.map((resource) => (
                        <div key={resource.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            {getTypeIcon(resource.type)}
                            <div>
                              <h4 className="font-medium">{resource.name}</h4>
                              <p className="text-sm text-gray-500">
                                {resource.type} • {resource.source} • {resource.createdAt}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Badge variant={resource.status === 'completed' ? 'default' : 'secondary'}>
                              {resource.status}
                            </Badge>
                            {resource.status !== 'completed' && (
                              <Progress value={resource.progress} className="w-24" />
                            )}
                            {resource.status === 'completed' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleImportToContent(resource)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <BookOpen className="h-4 w-4 mr-1" />
                                导入到内容管理
                              </Button>
                            )}
                            {getStatusIcon(resource.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 网页抓取 */}
              <TabsContent value="web-scraping" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      网页内容抓取
                    </CardTitle>
                    <CardDescription>
                      从指定网站自动抓取日语学习内容
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="urls">目标网址 (每行一个)</Label>
                        <Textarea
                          id="urls"
                          placeholder="https://www3.nhk.or.jp/news/easy/&#10;https://mainichi.jp/&#10;..."
                          value={scrapingConfig.urls}
                          onChange={(e) => setScrapingConfig(prev => ({ ...prev, urls: e.target.value }))}
                          rows={4}
                        />
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="maxPages">最大页面数</Label>
                          <Input
                            id="maxPages"
                            type="number"
                            value={scrapingConfig.maxPages}
                            onChange={(e) => setScrapingConfig(prev => ({ ...prev, maxPages: parseInt(e.target.value) || 10 }))}
                          />
                        </div>

                        <div>
                          <Label htmlFor="contentType">内容类型</Label>
                          <select 
                            id="contentType"
                            className="w-full p-2 border rounded-md"
                            value={scrapingConfig.contentType}
                            onChange={(e) => setScrapingConfig(prev => ({ ...prev, contentType: e.target.value }))}
                          >
                            <option value="course">课程内容</option>
                            <option value="material">学习材料</option>
                            <option value="vocabulary">词汇</option>
                            <option value="news">新闻文章</option>
                          </select>
                        </div>

                        <div>
                          <Label htmlFor="delay">抓取间隔 (毫秒)</Label>
                          <Input
                            id="delay"
                            type="number"
                            value={scrapingConfig.delayMs}
                            onChange={(e) => setScrapingConfig(prev => ({ ...prev, delayMs: parseInt(e.target.value) || 1000 }))}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={scrapingConfig.includeImages}
                          onChange={(e) => setScrapingConfig(prev => ({ ...prev, includeImages: e.target.checked }))}
                        />
                        <span>包含图片</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={scrapingConfig.includeAudio}
                          onChange={(e) => setScrapingConfig(prev => ({ ...prev, includeAudio: e.target.checked }))}
                        />
                        <span>包含音频</span>
                      </label>
                    </div>

                    <Button 
                      onClick={startWebScraping} 
                      disabled={isLoading}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      开始抓取
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 文件上传 */}
              <TabsContent value="file-upload" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      文件批量上传
                    </CardTitle>
                    <CardDescription>
                      上传本地文件并自动处理为学习资源
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <div className="space-y-2">
                        <p className="text-lg font-medium">拖拽文件到此处或点击选择</p>
                        <p className="text-sm text-gray-500">
                          支持格式: TXT, CSV, JSON, MP3, MP4, PDF
                        </p>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept=".txt,.csv,.json,.mp3,.mp4,.pdf"
                        onChange={(e) => setUploadFiles(Array.from(e.target.files || []))}
                        className="mt-4"
                      />
                    </div>

                    {uploadFiles.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">已选择文件:</h4>
                        <div className="space-y-1">
                          {uploadFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="text-sm">{file.name}</span>
                              <span className="text-xs text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button 
                      onClick={handleFileUpload} 
                      disabled={isLoading || uploadFiles.length === 0}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      开始上传
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* API导入 */}
              <TabsContent value="api-import" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      外部API导入
                    </CardTitle>
                    <CardDescription>
                      从外部API批量导入学习资源
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="api-endpoint">API端点</Label>
                        <Input
                          id="api-endpoint"
                          placeholder="https://api.example.com/japanese-content"
                          value={apiConfig.endpoint}
                          onChange={(e) => setApiConfig(prev => ({ ...prev, endpoint: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="api-key">API密钥</Label>
                        <Input
                          id="api-key"
                          type="password"
                          placeholder="your-api-key"
                          value={apiConfig.apiKey}
                          onChange={(e) => setApiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="format">数据格式</Label>
                        <select 
                          id="format"
                          className="w-full p-2 border rounded-md"
                          value={apiConfig.format}
                          onChange={(e) => setApiConfig(prev => ({ ...prev, format: e.target.value }))}
                        >
                          <option value="json">JSON</option>
                          <option value="xml">XML</option>
                          <option value="csv">CSV</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="batch-size">批次大小</Label>
                        <Input
                          id="batch-size"
                          type="number"
                          value={apiConfig.batchSize}
                          onChange={(e) => setApiConfig(prev => ({ ...prev, batchSize: parseInt(e.target.value) || 100 }))}
                        />
                      </div>
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        确保API端点返回符合我们格式要求的数据。支持批量导入以提高效率。
                      </AlertDescription>
                    </Alert>

                    <Button 
                      onClick={startApiImport} 
                      disabled={isLoading}
                      className="w-full"
                    >
                      <Database className="h-4 w-4 mr-2" />
                      开始导入
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 任务管理 */}
              <TabsContent value="tasks" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="h-5 w-5" />
                      运行中的任务
                    </CardTitle>
                    <CardDescription>
                      监控和管理所有资源获取任务
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {tasks.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>当前没有运行中的任务</p>
                        </div>
                      ) : (
                        tasks.map((task) => (
                          <div key={task.id} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {getStatusIcon(task.status)}
                                <div>
                                  <h4 className="font-medium">{task.name}</h4>
                                  <p className="text-sm text-gray-500">
                                    {task.type} • 开始时间: {task.startTime}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => pauseTask(task.id)}
                                >
                                  {task.status === 'running' ? (
                                    <Pause className="h-4 w-4" />
                                  ) : (
                                    <Play className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => cancelTask(task.id)}
                                >
                                  <Square className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>进度: {task.itemsProcessed}/{task.totalItems}</span>
                                <span>{task.progress.toFixed(1)}%</span>
                              </div>
                              <Progress value={task.progress} className="w-full" />
                              {task.estimatedTime && (
                                <p className="text-xs text-gray-500">{task.estimatedTime}</p>
                              )}
                            </div>

                            {task.logs.length > 0 && (
                              <div className="bg-gray-50 rounded p-3">
                                <h5 className="text-sm font-medium mb-2">最近日志:</h5>
                                <div className="space-y-1 text-xs text-gray-600 max-h-20 overflow-y-auto">
                                  {task.logs.slice(-3).map((log, index) => (
                                    <p key={index}>• {log}</p>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminResourceManager; 