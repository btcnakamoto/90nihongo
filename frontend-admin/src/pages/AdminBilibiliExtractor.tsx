import React, { useState, useEffect, useCallback } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import TopNavbar from "@/components/admin/TopNavbar";
import PageHeader from "@/components/admin/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Volume2, 
  Download, 
  Play, 
  Pause, 
  Clock, 
  FileText, 
  Video,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  ExternalLink,
  RefreshCw,
  Settings,
  Copy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/contexts/SidebarContext";
import apiClient from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

interface ExtractionJob {
  id: string;
  videoUrl: string;
  videoTitle?: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  audioPath?: string;
  subtitlePath?: string;
  subtitleText?: string;
  useAiSubtitle?: boolean;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

interface VideoInfo {
  title: string;
  duration: number;
  bvid: string;
  owner: string;
  description: string;
}

const AdminBilibiliExtractor: React.FC = () => {
  const { isCollapsed } = useSidebar();
  const [activeTab, setActiveTab] = useState("extract");
  const [isLoading, setIsLoading] = useState(false);
  const [jobs, setJobs] = useState<ExtractionJob[]>([]);
  
  // 提取表单状态
  const [videoUrl, setVideoUrl] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [useAiSubtitle, setUseAiSubtitle] = useState(true);
  const [extractionMode, setExtractionMode] = useState<'online' | 'offline'>('offline');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [selectedUrl, setSelectedUrl] = useState("");
  const [manualVideoInfo, setManualVideoInfo] = useState<VideoInfo | null>(null);
  const [loadingVideoInfo, setLoadingVideoInfo] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // 获取视频信息
  const getVideoInfo = async (url: string) => {
    try {
      setLoadingVideoInfo(true);
      console.log('正在获取视频信息:', url);
      
      const response = await apiClient.post('/api/admin/resources/bilibili/video-info', { url });
      console.log('获取视频信息成功:', response.data);
      
      if (response.data.success) {
        setVideoInfo(response.data.data);
        setSelectedUrl(url);
        setManualVideoInfo(null);
        console.log('已设置视频信息:', response.data.data);
      } else {
        throw new Error(response.data.message || '获取视频信息失败');
      }
    } catch (error: any) {
      console.error('获取视频信息失败:', error);
      toast({
        title: "获取视频信息失败",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingVideoInfo(false);
    }
  };

  // 提交提取任务
  const submitExtraction = async () => {
    if (!videoUrl || !startTime || !endTime) {
      toast({
        title: "参数不完整",
        description: "请填写视频链接、开始时间和结束时间",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiClient.post('/api/admin/resources/bilibili/extract', {
        video_url: videoUrl,
        start_time: startTime,
        end_time: endTime,
        description: description.trim() || undefined,
        use_ai_subtitle: useAiSubtitle,
        extraction_mode: extractionMode
      });

      if (response.data.success) {
        // 添加新任务到列表
        const newJob: ExtractionJob = {
          id: response.data.data.job_id || Date.now().toString(),
          videoUrl,
          videoTitle: videoInfo?.title,
          startTime,
          endTime,
          status: 'pending',
          useAiSubtitle,
          createdAt: new Date().toISOString()
        };
        setJobs(prev => [newJob, ...prev]);
        
        // 清空表单
        setVideoUrl("");
        setStartTime("");
        setEndTime("");
        setDescription("");
        setVideoInfo(null);
        
        toast({
          title: "任务提交成功",
          description: "提取任务已提交，请在任务列表中查看进度",
        });
        setActiveTab("jobs");
      } else {
        throw new Error(response.data.message || '提交失败');
      }
    } catch (error: any) {
      console.error('提交提取任务失败:', error);
      toast({
        title: "提交失败",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 获取提取任务列表
  const loadJobs = useCallback(async () => {
    try {
      setLoadingJobs(true);
      const response = await apiClient.get('/api/admin/resources/bilibili/jobs');
      if (response.data.success) {
        setJobs(response.data.data || []);
      }
    } catch (error: any) {
      console.error('加载任务列表失败:', error);
      toast({
        title: "加载任务列表失败",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingJobs(false);
    }
  }, []);

  // 删除任务
  const deleteJob = async (jobId: string) => {
    try {
      await apiClient.delete(`/api/admin/resources/bilibili/jobs/${jobId}`);
      toast({
        title: "删除成功",
        description: "任务已被删除",
      });
      await loadJobs();
    } catch (error: any) {
      console.error('删除任务失败:', error);
      toast({
        title: "删除失败",
        description: error.response?.data?.message || "删除任务时发生错误",
        variant: "destructive",
      });
    }
  };

  // 下载文件
  const downloadFile = async (jobId: string, fileType: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/admin/resources/bilibili/jobs/${jobId}/download/${fileType}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('下载失败');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${jobId}_${fileType}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "下载成功",
        description: `${fileType} 文件下载完成`,
      });
    } catch (error: any) {
      console.error('下载文件失败:', error);
      toast({
        title: "下载失败",
        description: error.message || "下载文件时发生错误",
        variant: "destructive",
      });
    }
  };

  // 重试任务
  const retryJob = async (jobId: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/admin/resources/bilibili/jobs/${jobId}/retry`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('重试失败');
      }

      toast({
        title: "重试成功",
        description: "任务已重新启动",
      });
      
      await loadJobs();
    } catch (error: any) {
      console.error('重试任务失败:', error);
      toast({
        title: "重试失败",
        description: error.message || "重试任务时发生错误",
        variant: "destructive",
      });
    }
  };

  // 复制字幕内容
  const handleCopySubtitle = (subtitleText: string) => {
    navigator.clipboard.writeText(subtitleText).then(() => {
      alert('字幕内容已复制到剪贴板');
    }).catch(() => {
      alert('复制失败');
    });
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'processing': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // 组件挂载时获取任务列表
  useEffect(() => {
    loadJobs();
    // 设置定时刷新任务状态
    const interval = setInterval(loadJobs, 5000);
    return () => clearInterval(interval);
  }, [loadJobs]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar activePath="/admin/resources/bilibili" />
      
      <div className={cn(
        "main-content flex-1 flex flex-col transition-all duration-300",
        isCollapsed && "collapsed"
      )}>
        {/* 统一顶部导航栏 */}
        <TopNavbar />
        
        {/* 页面标题区域 */}
        <PageHeader 
          title="B站视频音频提取" 
          description="从B站视频中提取指定片段的音频和字幕，支持AI自动生成字幕"
        >
          <Button variant="outline" size="sm">
            <Volume2 className="h-4 w-4 mr-2" />
            提取工具
          </Button>
        </PageHeader>

        {/* 主要内容区域 */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* 主要内容区域 */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="extract" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  新建提取
                </TabsTrigger>
                <TabsTrigger value="jobs" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  任务列表
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  设置
                </TabsTrigger>
              </TabsList>

              {/* 新建提取任务 */}
              <TabsContent value="extract" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 提取表单 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Video className="h-5 w-5" />
                        视频信息
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="videoUrl">B站视频链接</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id="videoUrl"
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            placeholder="https://www.bilibili.com/video/BV..."
                            className="flex-1"
                          />
                          <Button 
                            onClick={() => getVideoInfo(videoUrl)}
                            disabled={isLoading || !videoUrl}
                            variant="outline"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {videoInfo && (
                        <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                          <h4 className="font-medium text-gray-900">{videoInfo.title}</h4>
                          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                            <span>UP主: {videoInfo.owner}</span>
                            <span>•</span>
                            <span>时长: {Math.floor(videoInfo.duration / 60)}:{(videoInfo.duration % 60).toString().padStart(2, '0')}</span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">{videoInfo.description}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="startTime">开始时间</Label>
                          <Input
                            id="startTime"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            placeholder="00:01:30"
                            className="mt-1"
                          />
                          <p className="text-xs text-gray-500 mt-1">格式: HH:MM:SS 或秒数</p>
                        </div>
                        <div>
                          <Label htmlFor="endTime">结束时间</Label>
                          <Input
                            id="endTime"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            placeholder="00:02:30"
                            className="mt-1"
                          />
                          <p className="text-xs text-gray-500 mt-1">格式: HH:MM:SS 或秒数</p>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="description">描述 (可选)</Label>
                        <Textarea
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="为这个音频片段添加描述..."
                          className="mt-1"
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="extractionMode">提取模式</Label>
                        <Select value={extractionMode} onValueChange={(value: 'online' | 'offline') => setExtractionMode(value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="选择提取模式" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="offline">
                              <div className="flex flex-col items-start">
                                <span className="font-medium">离线模式 (推荐)</span>
                                <span className="text-xs text-gray-500">先下载视频，再提取音频 - 稳定可靠</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="online">
                              <div className="flex flex-col items-start">
                                <span className="font-medium">在线模式 (实验性)</span>
                                <span className="text-xs text-gray-500">直接从视频流提取 - 节省存储空间</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500 mt-1">
                          {extractionMode === 'online' 
                            ? '在线模式直接从视频流中提取音频，无需下载完整视频，但可能不够稳定'
                            : '离线模式先下载完整视频，然后提取音频，更加稳定可靠'
                          }
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="useAiSubtitle"
                          checked={useAiSubtitle}
                          onChange={(e) => setUseAiSubtitle(e.target.checked)}
                          className="rounded"
                          disabled={extractionMode === 'online'}
                        />
                        <Label htmlFor="useAiSubtitle" className={extractionMode === 'online' ? 'text-gray-400' : ''}>
                          使用AI生成字幕 {extractionMode === 'online' && '(在线模式暂不支持)'}
                        </Label>
                      </div>

                      <Button 
                        onClick={submitExtraction}
                        disabled={isLoading || !videoUrl || !startTime || !endTime}
                        className="w-full"
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            提交中...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            开始提取
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* 使用说明 */}
                  <Card>
                    <CardHeader>
                      <CardTitle>使用说明</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-nihongo-indigo text-white text-xs flex items-center justify-center font-bold mt-0.5">1</div>
                          <div>
                            <p className="font-medium">输入B站视频链接</p>
                            <p className="text-sm text-gray-600">支持 BV号 和 AV号 格式的链接</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-nihongo-indigo text-white text-xs flex items-center justify-center font-bold mt-0.5">2</div>
                          <div>
                            <p className="font-medium">设置时间段</p>
                            <p className="text-sm text-gray-600">指定要提取的音频开始和结束时间</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-nihongo-indigo text-white text-xs flex items-center justify-center font-bold mt-0.5">3</div>
                          <div>
                            <p className="font-medium">选择提取模式</p>
                            <p className="text-sm text-gray-600">在线模式节省空间，离线模式更稳定</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-nihongo-indigo text-white text-xs flex items-center justify-center font-bold mt-0.5">4</div>
                          <div>
                            <p className="font-medium">选择字幕模式</p>
                            <p className="text-sm text-gray-600">AI生成或使用B站原生字幕</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-nihongo-indigo text-white text-xs flex items-center justify-center font-bold mt-0.5">5</div>
                          <div>
                            <p className="font-medium">提交和监控</p>
                            <p className="text-sm text-gray-600">任务提交后可在任务列表中查看进度</p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">提取模式对比:</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-start gap-2">
                              <span className="font-medium text-green-600">离线模式:</span>
                              <span className="text-gray-600">先下载完整视频，再提取音频。稳定可靠，支持AI字幕</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="font-medium text-blue-600">在线模式:</span>
                              <span className="text-gray-600">直接从视频流提取音频。节省存储空间，但可能不够稳定</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">支持的时间格式:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• HH:MM:SS (如: 00:01:30)</li>
                            <li>• MM:SS (如: 1:30)</li>
                            <li>• 秒数 (如: 90)</li>
                          </ul>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <h4 className="font-medium mb-2">注意事项:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• 请遵守版权法规，仅用于学习目的</li>
                          <li>• 建议片段长度控制在1-5分钟</li>
                          <li>• AI字幕生成需要一定时间</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* 任务列表 */}
              <TabsContent value="jobs" className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      提取任务列表
                    </CardTitle>
                    <Button onClick={loadJobs} variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      刷新
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {jobs.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Volume2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>暂无提取任务</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {jobs.map((job) => (
                          <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium">{job.videoTitle || '未知视频'}</h4>
                                  <Badge className={cn("text-xs", getStatusColor(job.status))}>
                                    <span className="flex items-center gap-1">
                                      {getStatusIcon(job.status)}
                                      {job.status === 'pending' && '等待中'}
                                      {job.status === 'processing' && '处理中'}
                                      {job.status === 'completed' && '已完成'}
                                      {job.status === 'failed' && '失败'}
                                    </span>
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  时间段: {job.startTime} - {job.endTime}
                                </p>
                                <p className="text-sm text-gray-500">
                                  创建时间: {new Date(job.createdAt).toLocaleString()}
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => deleteJob(job.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {job.progress !== undefined && job.status === 'processing' && (
                              <div className="mb-3">
                                <div className="flex justify-between text-sm mb-1">
                                  <span>处理进度</span>
                                  <span>{job.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-nihongo-indigo h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${job.progress}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}

                            {job.status === 'completed' && (
                              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg space-y-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                  <h5 className="font-medium text-green-800">提取完成</h5>
                                  {job.completedAt && (
                                    <span className="text-sm text-green-600 ml-auto">
                                      完成时间: {new Date(job.completedAt).toLocaleString()}
                                    </span>
                                  )}
                                </div>

                                {/* 文件信息和下载 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {job.audioPath && (
                                    <Card className="border-green-200">
                                      <CardContent className="p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                          <Volume2 className="h-5 w-5 text-green-600" />
                                          <h6 className="font-medium">音频文件</h6>
                                        </div>
                                        <div className="space-y-2">
                                          <div className="text-sm text-gray-600">
                                            <p>格式: WAV</p>
                                            <p>时长: {job.startTime} - {job.endTime}</p>
                                          </div>
                                          <div className="flex gap-2">
                                            <Button 
                                              size="sm" 
                                              onClick={() => downloadFile(job.id, 'audio')}
                                              className="bg-green-600 hover:bg-green-700"
                                            >
                                              <Download className="h-4 w-4 mr-1" />
                                              下载音频
                                            </Button>
                                            {/* 可以在这里添加音频预览播放器 */}
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )}

                                  {job.subtitlePath && (
                                    <Card className="border-blue-200">
                                      <CardContent className="p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                          <FileText className="h-5 w-5 text-blue-600" />
                                          <h6 className="font-medium">字幕文件</h6>
                                        </div>
                                        <div className="space-y-2">
                                          <div className="text-sm text-gray-600">
                                            <p>格式: SRT</p>
                                            <p>生成方式: {job.useAiSubtitle ? 'AI生成' : '原生字幕'}</p>
                                          </div>
                                          <div className="flex gap-2">
                                            <Button 
                                              size="sm" 
                                              onClick={() => downloadFile(job.id, 'subtitle')}
                                              className="bg-blue-600 hover:bg-blue-700"
                                            >
                                              <Download className="h-4 w-4 mr-1" />
                                              下载字幕
                                            </Button>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )}
                                </div>

                                {/* 字幕内容预览和编辑 */}
                                {job.subtitleText && (
                                  <Card className="border-gray-200">
                                    <CardHeader className="pb-3">
                                      <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-medium">字幕内容预览</CardTitle>
                                        <div className="flex gap-2">
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => handleCopySubtitle(job.subtitleText!)}
                                          >
                                            <Copy className="h-4 w-4 mr-1" />
                                            复制
                                          </Button>
                                        </div>
                                      </div>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                                          {job.subtitleText}
                                        </pre>
                                      </div>
                                      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                                        <span>字符数: {job.subtitleText.length}</span>
                                        <span>行数: {job.subtitleText.split('\n').length}</span>
                                      </div>
                                    </CardContent>
                                  </Card>
                                )}

                                {/* 提取信息总结 */}
                                <div className="pt-3 border-t border-green-200">
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-500">视频链接:</span>
                                      <div className="font-mono text-xs text-blue-600 truncate" title={job.videoUrl}>
                                        {job.videoUrl.length > 30 ? `${job.videoUrl.substring(0, 30)}...` : job.videoUrl}
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">时间段:</span>
                                      <div className="font-medium">{job.startTime} - {job.endTime}</div>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">处理时长:</span>
                                      <div className="font-medium">
                                        {job.completedAt && job.createdAt ? 
                                          `${Math.round((new Date(job.completedAt).getTime() - new Date(job.createdAt).getTime()) / 1000)}秒` 
                                          : '未知'}
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">任务ID:</span>
                                      <div className="font-mono text-xs">{job.id.substring(0, 8)}...</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {job.status === 'failed' && (
                              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <h5 className="font-medium text-red-800 mb-2">提取失败</h5>
                                    <p className="text-sm text-red-700 mb-3">{job.error}</p>
                                    <div className="flex gap-2">
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => retryJob(job.id)}
                                        className="border-red-300 text-red-700 hover:bg-red-50"
                                      >
                                        <RefreshCw className="h-4 w-4 mr-1" />
                                        重新尝试
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 设置 */}
              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      提取设置
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-medium">视频下载设置</h4>
                        <div>
                          <Label>默认视频质量</Label>
                          <select className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md">
                            <option>最佳质量</option>
                            <option>720p</option>
                            <option>480p</option>
                            <option>最小文件</option>
                          </select>
                        </div>
                        <div>
                          <Label>输出目录</Label>
                          <Input defaultValue="storage/bilibili_extracts" className="mt-1" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium">AI字幕设置</h4>
                        <div>
                          <Label>Whisper模型</Label>
                          <select className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md">
                            <option>base (推荐)</option>
                            <option>tiny (快速)</option>
                            <option>small</option>
                            <option>medium</option>
                            <option>large (高质量)</option>
                          </select>
                        </div>
                        <div>
                          <Label>默认语言</Label>
                          <select className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md">
                            <option value="zh">中文</option>
                            <option value="ja">日语</option>
                            <option value="en">英语</option>
                            <option value="auto">自动检测</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Button className="mr-4">保存设置</Button>
                      <Button variant="outline">重置为默认</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>系统状态</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 p-4 border rounded-lg">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                        <div>
                          <p className="font-medium">Python环境</p>
                          <p className="text-sm text-gray-600">正常</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 border rounded-lg">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                        <div>
                          <p className="font-medium">FFmpeg</p>
                          <p className="text-sm text-gray-600">v4.4.2</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 border rounded-lg">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                        <div>
                          <p className="font-medium">Whisper AI</p>
                          <p className="text-sm text-gray-600">已加载</p>
                        </div>
                      </div>
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

export default AdminBilibiliExtractor; 