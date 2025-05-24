import React, { useState, useEffect, useCallback } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import TopNavbar from '@/components/admin/TopNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Upload,
  FileText,
  Music,
  Video,
  Image,
  File,
  Trash2,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  FolderOpen
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';

interface UploadedFile {
  id: number;
  name: string;
  type: 'audio' | 'video' | 'text' | 'image' | 'document';
  size: string;
  status: 'uploading' | 'completed' | 'processing' | 'failed';
  progress: number;
  upload_date: string;
  course_day?: number;
  description?: string;
}

const AdminFileUpload: React.FC = () => {
  const { toast } = useToast();
  const { isCollapsed } = useSidebar();
  
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      // 模拟数据
      const mockFiles: UploadedFile[] = [
        {
          id: 1,
          name: "第1天-基础对话.mp3",
          type: "audio",
          size: "15.2 MB",
          status: "completed",
          progress: 100,
          upload_date: "2024-01-20",
          course_day: 1,
          description: "基础日语对话练习"
        },
        {
          id: 2,
          name: "语法讲解视频.mp4",
          type: "video",
          size: "89.5 MB",
          status: "processing",
          progress: 65,
          upload_date: "2024-01-20",
          course_day: 5,
          description: "助词用法详解"
        },
        {
          id: 3,
          name: "词汇表.pdf",
          type: "document",
          size: "2.1 MB",
          status: "completed",
          progress: 100,
          upload_date: "2024-01-19",
          description: "N5级别词汇总结"
        },
        {
          id: 4,
          name: "发音练习.wav",
          type: "audio",
          size: "25.8 MB",
          status: "uploading",
          progress: 32,
          upload_date: "2024-01-20",
          course_day: 3
        }
      ];
      setFiles(mockFiles);
    } catch (error) {
      console.error('获取文件列表失败:', error);
      toast({
        title: "错误",
        description: "无法加载文件列表",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFileUpload(droppedFiles);
  }, []);

  const handleFileUpload = (fileList: File[]) => {
    // 处理文件上传逻辑
    toast({
      title: "上传开始",
      description: `正在上传 ${fileList.length} 个文件`,
    });
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'audio': return <Music className="w-5 h-5 text-green-500" />;
      case 'video': return <Video className="w-5 h-5 text-red-500" />;
      case 'text': return <FileText className="w-5 h-5 text-blue-500" />;
      case 'image': return <Image className="w-5 h-5 text-purple-500" />;
      case 'document': return <File className="w-5 h-5 text-orange-500" />;
      default: return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploading': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'uploading': return '上传中';
      case 'processing': return '处理中';
      case 'completed': return '已完成';
      case 'failed': return '失败';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading': return <Upload className="w-4 h-4" />;
      case 'processing': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  const stats = {
    total: files.length,
    completed: files.filter(f => f.status === 'completed').length,
    processing: files.filter(f => f.status === 'processing' || f.status === 'uploading').length,
    failed: files.filter(f => f.status === 'failed').length,
    totalSize: files.reduce((sum, f) => {
      const size = parseFloat(f.size.split(' ')[0]);
      return sum + size;
    }, 0).toFixed(1)
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar activePath="/admin/resources/upload" />
      <div className={cn("flex-1 transition-all duration-300 main-content", isCollapsed ? "collapsed" : "")}>
        <TopNavbar />
        
        <div className="p-6">
          {/* 页面标题 */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Upload className="w-8 h-8 text-green-500" />
                文件上传管理
              </h1>
              <p className="text-gray-600 mt-1">
                上传和管理学习资源文件
              </p>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">总文件数</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <FolderOpen className="w-8 h-8 text-blue-500" />
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
                    <p className="text-sm font-medium text-gray-600">处理中</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.processing}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
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

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">总大小</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.totalSize} MB</p>
                  </div>
                  <File className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 拖拽上传区域 */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                  isDragging 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-300 hover:border-gray-400"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  拖拽文件到此处上传
                </h3>
                <p className="text-gray-600 mb-4">
                  支持音频、视频、文档、图片等格式
                </p>
                <Button>
                  选择文件
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 文件列表 */}
          <Card>
            <CardHeader>
              <CardTitle>文件列表</CardTitle>
              <CardDescription>
                管理已上传的学习资源文件
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">正在加载文件列表...</p>
                </div>
              ) : files.length === 0 ? (
                <div className="text-center py-8">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">暂无上传文件</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {files.map((file) => (
                    <div key={file.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            {getFileIcon(file.type)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{file.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>{file.size}</span>
                              {file.course_day && (
                                <>
                                  <span>•</span>
                                  <span>第{file.course_day}天</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(file.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(file.status)}
                              {getStatusText(file.status)}
                            </div>
                          </Badge>
                        </div>
                      </div>

                      {file.description && (
                        <p className="text-sm text-gray-600 mb-3">{file.description}</p>
                      )}

                      {(file.status === 'uploading' || file.status === 'processing') && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                            <span>{file.status === 'uploading' ? '上传进度' : '处理进度'}</span>
                            <span>{file.progress}%</span>
                          </div>
                          <Progress value={file.progress} className="h-2" />
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          上传时间: {file.upload_date}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3 mr-1" />
                            预览
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="w-3 h-3 mr-1" />
                            下载
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

export default AdminFileUpload; 