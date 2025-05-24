import React, { useState, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { contentService } from '@/services/contentService';
import {
  Upload,
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX,
  FileAudio,
  Trash2,
  Eye,
  Link,
  CheckCircle,
  XCircle,
  RefreshCw,
  FolderOpen,
  Download
} from 'lucide-react';

interface AudioFile {
  id?: number;
  file: File;
  name: string;
  size: number;
  duration?: number;
  uploadUrl?: string;
  status: 'pending' | 'uploading' | 'uploaded' | 'error';
  progress: number;
  errorMessage?: string;
  associationType?: 'vocabulary' | 'course' | 'material' | 'exercise';
  associationId?: number;
  associationName?: string;
}

interface AudioFileManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType?: 'vocabulary' | 'course' | 'material' | 'exercise';
  associationData?: Array<{ id: number; name: string; key?: string }>;
  onComplete?: (uploadedFiles: AudioFile[]) => void;
}

const AudioFileManager: React.FC<AudioFileManagerProps> = ({
  open,
  onOpenChange,
  contentType,
  associationData = [],
  onComplete
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
  const [autoAssociate, setAutoAssociate] = useState(true);

  // 支持的音频格式
  const supportedFormats = ['.mp3', '.wav', '.ogg', '.m4a', '.aac'];
  const maxFileSize = 50 * 1024 * 1024; // 50MB

  // 文件选择处理
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles: AudioFile[] = [];

    files.forEach((file) => {
      // 检查文件类型
      const isValidType = supportedFormats.some(format => 
        file.name.toLowerCase().endsWith(format)
      );

      if (!isValidType) {
        toast({
          title: "不支持的文件格式",
          description: `${file.name} 不是支持的音频格式`,
          variant: "destructive",
        });
        return;
      }

      // 检查文件大小
      if (file.size > maxFileSize) {
        toast({
          title: "文件过大",
          description: `${file.name} 超过了50MB的大小限制`,
          variant: "destructive",
        });
        return;
      }

      // 尝试自动关联
      let association: Pick<AudioFile, 'associationType' | 'associationId' | 'associationName'> = {};
      
      if (autoAssociate && contentType && associationData.length > 0) {
        // 基于文件名进行智能匹配
        const fileName = file.name.replace(/\.[^/.]+$/, ""); // 移除扩展名
        const match = associationData.find(item => 
          item.name.includes(fileName) || 
          fileName.includes(item.name) ||
          (item.key && fileName.includes(item.key))
        );

        if (match) {
          association = {
            associationType: contentType,
            associationId: match.id,
            associationName: match.name
          };
        }
      }

      validFiles.push({
        file,
        name: file.name,
        size: file.size,
        status: 'pending',
        progress: 0,
        ...association
      });
    });

    setAudioFiles(prev => [...prev, ...validFiles]);
    
    // 清空input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [autoAssociate, contentType, associationData, toast]);

  // 获取音频时长
  const getAudioDuration = useCallback((file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.addEventListener('loadedmetadata', () => {
        resolve(audio.duration);
      });
      audio.addEventListener('error', () => {
        resolve(0);
      });
      audio.src = URL.createObjectURL(file);
    });
  }, []);

  // 上传单个文件
  const uploadSingleFile = useCallback(async (audioFile: AudioFile, index: number) => {
    try {
      // 更新状态为上传中
      setAudioFiles(prev => prev.map((file, i) => 
        i === index ? { ...file, status: 'uploading' } : file
      ));

      // 获取音频时长
      const duration = await getAudioDuration(audioFile.file);
      
      // 上传文件
      const result = await contentService.uploadFile(audioFile.file, 'audio');

      if (result.success && result.url) {
        // 更新为上传成功
        setAudioFiles(prev => prev.map((file, i) => 
          i === index ? { 
            ...file, 
            status: 'uploaded', 
            progress: 100,
            uploadUrl: result.url,
            duration 
          } : file
        ));

        return { ...audioFile, uploadUrl: result.url, duration };
      } else {
        throw new Error(result.message || '上传失败');
      }
    } catch (error: any) {
      // 更新为错误状态
      setAudioFiles(prev => prev.map((file, i) => 
        i === index ? { 
          ...file, 
          status: 'error', 
          errorMessage: error.message 
        } : file
      ));
      throw error;
    }
  }, [getAudioDuration]);

  // 批量上传
  const handleBatchUpload = useCallback(async () => {
    if (audioFiles.filter(f => f.status === 'pending').length === 0) return;

    setUploading(true);
    const uploadPromises = audioFiles.map((file, index) => {
      if (file.status === 'pending') {
        return uploadSingleFile(file, index);
      }
      return Promise.resolve(file);
    });

    try {
      await Promise.allSettled(uploadPromises);
      
      const successCount = audioFiles.filter(f => f.status === 'uploaded').length;
      const errorCount = audioFiles.filter(f => f.status === 'error').length;

      toast({
        title: "上传完成",
        description: `成功: ${successCount}个文件，失败: ${errorCount}个文件`,
        variant: successCount > 0 ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "批量上传失败",
        description: "部分文件上传遇到问题",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }, [audioFiles, uploadSingleFile, toast]);

  // 音频播放控制
  const toggleAudioPlay = useCallback((index: number) => {
    const audioFile = audioFiles[index];
    if (!audioFile || audioFile.status !== 'uploaded') return;

    if (currentlyPlaying === index) {
      setCurrentlyPlaying(null);
    } else {
      setCurrentlyPlaying(index);
    }
  }, [audioFiles, currentlyPlaying]);

  // 删除文件
  const removeFile = useCallback((index: number) => {
    setAudioFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  // 更新文件关联
  const updateFileAssociation = useCallback((index: number, associationId: number) => {
    const association = associationData.find(item => item.id === associationId);
    if (!association) return;

    setAudioFiles(prev => prev.map((file, i) => 
      i === index ? {
        ...file,
        associationType: contentType,
        associationId: association.id,
        associationName: association.name
      } : file
    ));
  }, [associationData, contentType]);

  // 完成处理
  const handleComplete = useCallback(() => {
    const uploadedFiles = audioFiles.filter(f => f.status === 'uploaded');
    onComplete?.(uploadedFiles);
    onOpenChange(false);
    setAudioFiles([]);
  }, [audioFiles, onComplete, onOpenChange]);

  // 格式化文件大小
  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  // 格式化时长
  const formatDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const totalFiles = audioFiles.length;
  const uploadedFiles = audioFiles.filter(f => f.status === 'uploaded').length;
  const errorFiles = audioFiles.filter(f => f.status === 'error').length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileAudio className="h-5 w-5" />
            音频文件管理器
          </DialogTitle>
          <DialogDescription>
            批量上传和管理音频文件，支持 {supportedFormats.join(', ')} 格式
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 上传区域 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                文件上传
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <FolderOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-700">点击选择音频文件</p>
                <p className="text-sm text-gray-500 mt-2">
                  支持 {supportedFormats.join(', ')} 格式，单文件最大 50MB
                </p>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={supportedFormats.join(',')}
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  选择文件
                </Button>

                {totalFiles > 0 && (
                  <Button
                    onClick={handleBatchUpload}
                    disabled={uploading || audioFiles.every(f => f.status !== 'pending')}
                  >
                    {uploading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        上传中...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        批量上传 ({audioFiles.filter(f => f.status === 'pending').length})
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* 统计信息 */}
              {totalFiles > 0 && (
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{totalFiles}</div>
                    <div className="text-sm text-blue-600">总文件数</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{uploadedFiles}</div>
                    <div className="text-sm text-green-600">已上传</div>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{errorFiles}</div>
                    <div className="text-sm text-red-600">失败</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 文件列表 */}
          {totalFiles > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-4 w-4" />
                  文件列表 ({totalFiles})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>文件名</TableHead>
                      <TableHead>大小</TableHead>
                      <TableHead>时长</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>关联内容</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {audioFiles.map((audioFile, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {audioFile.name}
                        </TableCell>
                        <TableCell>{formatFileSize(audioFile.size)}</TableCell>
                        <TableCell>
                          {audioFile.duration ? formatDuration(audioFile.duration) : '-'}
                        </TableCell>
                        <TableCell>
                          {audioFile.status === 'pending' && (
                            <Badge variant="outline">等待上传</Badge>
                          )}
                          {audioFile.status === 'uploading' && (
                            <Badge variant="outline">
                              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                              上传中
                            </Badge>
                          )}
                          {audioFile.status === 'uploaded' && (
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              已上传
                            </Badge>
                          )}
                          {audioFile.status === 'error' && (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              失败
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {contentType && associationData.length > 0 ? (
                            <Select
                              value={audioFile.associationId?.toString() || ''}
                              onValueChange={(value) => updateFileAssociation(index, parseInt(value))}
                            >
                              <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="选择关联内容" />
                              </SelectTrigger>
                              <SelectContent>
                                {associationData.map((item) => (
                                  <SelectItem key={item.id} value={item.id.toString()}>
                                    {item.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {audioFile.status === 'uploaded' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleAudioPlay(index)}
                              >
                                {currentlyPlaying === index ? (
                                  <Pause className="h-3 w-3" />
                                ) : (
                                  <Play className="h-3 w-3" />
                                )}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFile(index)}
                              disabled={uploading}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* 错误提示 */}
          {errorFiles > 0 && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                {errorFiles} 个文件上传失败。请检查网络连接或文件格式。
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button 
            onClick={handleComplete}
            disabled={uploadedFiles === 0}
          >
            完成 ({uploadedFiles} 个文件)
          </Button>
        </DialogFooter>

        {/* 音频播放器 */}
        {currentlyPlaying !== null && audioFiles[currentlyPlaying]?.uploadUrl && (
          <audio
            autoPlay
            onEnded={() => setCurrentlyPlaying(null)}
            className="hidden"
          >
            <source src={audioFiles[currentlyPlaying].uploadUrl} />
          </audio>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AudioFileManager; 