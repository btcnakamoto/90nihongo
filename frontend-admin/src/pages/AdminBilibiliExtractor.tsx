import React, { useState, useEffect } from "react";
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
  Upload
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/contexts/SidebarContext";

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
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);

  // 获取视频信息
  const fetchVideoInfo = async (url: string) => {
    if (!url) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/bilibili/video-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({ url })
      });

      if (response.ok) {
        const data = await response.json();
        setVideoInfo(data.video_info);
      } else {
        console.error('获取视频信息失败');
      }
    } catch (error) {
      console.error('获取视频信息时出错:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 提交提取任务
  const handleSubmitExtraction = async () => {
    if (!videoUrl || !startTime || !endTime) {
      alert('请填写完整的提取信息');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/bilibili/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({
          video_url: videoUrl,
          start_time: startTime,
          end_time: endTime,
          description,
          use_ai_subtitle: useAiSubtitle
        })
      });

      if (response.ok) {
        const data = await response.json();
        // 添加新任务到列表
        const newJob: ExtractionJob = {
          id: data.job_id,
          videoUrl,
          videoTitle: videoInfo?.title,
          startTime,
          endTime,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        setJobs(prev => [newJob, ...prev]);
        
        // 清空表单
        setVideoUrl("");
        setStartTime("");
        setEndTime("");
        setDescription("");
        setVideoInfo(null);
        
        alert('提取任务已提交，请在任务列表中查看进度');
        setActiveTab("jobs");
      } else {
        const error = await response.json();
        alert(`提交失败: ${error.message}`);
      }
    } catch (error) {
      console.error('提交提取任务时出错:', error);
      alert('提交失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 获取提取任务列表
  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/admin/bilibili/jobs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs);
      }
    } catch (error) {
      console.error('获取任务列表时出错:', error);
    }
  };

  // 删除任务
  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('确定要删除这个任务吗？')) return;

    try {
      const response = await fetch(`/api/admin/bilibili/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });

      if (response.ok) {
        setJobs(prev => prev.filter(job => job.id !== jobId));
      } else {
        alert('删除失败');
      }
    } catch (error) {
      console.error('删除任务时出错:', error);
      alert('删除失败');
    }
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
    fetchJobs();
    // 设置定时刷新任务状态
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, []);

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
                            onClick={() => fetchVideoInfo(videoUrl)}
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

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="useAiSubtitle"
                          checked={useAiSubtitle}
                          onChange={(e) => setUseAiSubtitle(e.target.checked)}
                          className="rounded"
                        />
                        <Label htmlFor="useAiSubtitle">使用AI生成字幕</Label>
                      </div>

                      <Button 
                        onClick={handleSubmitExtraction}
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
                            <p className="font-medium">选择字幕模式</p>
                            <p className="text-sm text-gray-600">AI生成或使用B站原生字幕</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-nihongo-indigo text-white text-xs flex items-center justify-center font-bold mt-0.5">4</div>
                          <div>
                            <p className="font-medium">提交和监控</p>
                            <p className="text-sm text-gray-600">任务提交后可在任务列表中查看进度</p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <h4 className="font-medium mb-2">支持的时间格式:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• HH:MM:SS (如: 00:01:30)</li>
                          <li>• MM:SS (如: 1:30)</li>
                          <li>• 秒数 (如: 90)</li>
                        </ul>
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
                    <Button onClick={fetchJobs} variant="outline" size="sm">
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
                                {job.status === 'completed' && job.audioPath && (
                                  <Button size="sm" variant="outline">
                                    <Download className="h-4 w-4 mr-1" />
                                    下载
                                  </Button>
                                )}
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => handleDeleteJob(job.id)}
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
                              <div className="space-y-2">
                                {job.audioPath && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Volume2 className="h-4 w-4 text-green-600" />
                                    <span>音频文件已生成</span>
                                  </div>
                                )}
                                {job.subtitlePath && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <FileText className="h-4 w-4 text-blue-600" />
                                    <span>字幕文件已生成</span>
                                  </div>
                                )}
                                {job.subtitleText && (
                                  <details className="text-sm">
                                    <summary className="cursor-pointer text-nihongo-indigo">查看字幕内容</summary>
                                    <div className="mt-2 p-3 bg-gray-50 rounded text-gray-700 max-h-32 overflow-y-auto">
                                      {job.subtitleText}
                                    </div>
                                  </details>
                                )}
                              </div>
                            )}

                            {job.status === 'failed' && job.error && (
                              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>{job.error}</span>
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