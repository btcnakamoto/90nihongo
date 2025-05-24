import React, { useState, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { contentService } from '@/services/contentService';
import {
  Link,
  Play,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  Search,
  RefreshCw,
  Music,
  FileText,
  ArrowRight,
  Eye,
  Settings
} from 'lucide-react';

interface AudioFile {
  id?: number;
  name: string;
  url: string;
  duration?: number;
  size?: number;
}

interface ContentItem {
  id: number;
  title: string;
  type: 'course' | 'material' | 'vocabulary' | 'exercise';
  key?: string;
  day_number?: number;
  jlpt_level?: string;
  hasAudio?: boolean;
  audioUrl?: string;
}

interface MatchSuggestion {
  audioFile: AudioFile;
  contentItem: ContentItem;
  confidence: number;
  matchReason: string;
  status: 'suggested' | 'confirmed' | 'rejected';
}

interface AudioContentLinkerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: 'course' | 'material' | 'vocabulary' | 'exercise';
  audioFiles: AudioFile[];
  contentItems: ContentItem[];
  onLinkComplete: (linkedPairs: Array<{ audioId: number; contentId: number }>) => void;
}

const AudioContentLinker: React.FC<AudioContentLinkerProps> = ({
  open,
  onOpenChange,
  contentType,
  audioFiles,
  contentItems,
  onLinkComplete
}) => {
  const { toast } = useToast();
  const [matchSuggestions, setMatchSuggestions] = useState<MatchSuggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set());
  const [matchingRules, setMatchingRules] = useState({
    exactName: true,
    fuzzyName: true,
    numberSequence: true,
    keywordMatch: true,
    minimumConfidence: 0.7
  });
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 智能匹配算法
  const generateMatchSuggestions = useCallback(() => {
    const suggestions: MatchSuggestion[] = [];

    audioFiles.forEach(audioFile => {
      contentItems.forEach(contentItem => {
        let confidence = 0;
        let matchReasons: string[] = [];

        const audioName = audioFile.name.replace(/\.[^/.]+$/, "").toLowerCase();
        const contentTitle = contentItem.title.toLowerCase();

        // 1. 精确名称匹配
        if (matchingRules.exactName) {
          if (audioName === contentTitle) {
            confidence += 0.9;
            matchReasons.push('精确标题匹配');
          }
        }

        // 2. 模糊名称匹配
        if (matchingRules.fuzzyName) {
          if (audioName.includes(contentTitle) || contentTitle.includes(audioName)) {
            confidence += 0.7;
            matchReasons.push('模糊标题匹配');
          }
        }

        // 3. 序号匹配
        if (matchingRules.numberSequence) {
          const audioNumbers = audioName.match(/\d+/g);
          const contentNumbers = contentTitle.match(/\d+/g);
          
          if (audioNumbers && contentNumbers) {
            const commonNumbers = audioNumbers.filter(num => contentNumbers.includes(num));
            if (commonNumbers.length > 0) {
              confidence += 0.6;
              matchReasons.push(`序号匹配: ${commonNumbers.join(', ')}`);
            }
          }

          // 特殊处理课程天数
          if (contentItem.day_number) {
            const dayPattern = new RegExp(`day${contentItem.day_number}|第${contentItem.day_number}天|${contentItem.day_number}日`, 'i');
            if (dayPattern.test(audioName)) {
              confidence += 0.8;
              matchReasons.push(`课程天数匹配: 第${contentItem.day_number}天`);
            }
          }
        }

        // 4. 关键词匹配
        if (matchingRules.keywordMatch) {
          const keywords = {
            course: ['课程', 'lesson', 'day', '天', '课'],
            material: ['材料', 'material', '学习', 'study'],
            vocabulary: ['词汇', 'vocab', '单词', 'word'],
            exercise: ['练习', 'exercise', '题目', 'quiz']
          };

          const typeKeywords = keywords[contentType] || [];
          const hasKeyword = typeKeywords.some(keyword => 
            audioName.includes(keyword.toLowerCase())
          );

          if (hasKeyword) {
            confidence += 0.4;
            matchReasons.push('类型关键词匹配');
          }

          // JLPT等级匹配
          if (contentItem.jlpt_level) {
            const jlptPattern = new RegExp(contentItem.jlpt_level.toLowerCase(), 'i');
            if (jlptPattern.test(audioName)) {
              confidence += 0.5;
              matchReasons.push(`JLPT等级匹配: ${contentItem.jlpt_level}`);
            }
          }
        }

        // 5. 文件名特殊模式匹配
        if (contentType === 'vocabulary') {
          // 检查是否为日语词汇的罗马音
          const romajiPattern = /^[a-zA-Z]+$/;
          if (romajiPattern.test(audioName) && contentItem.key) {
            if (audioName === contentItem.key.toLowerCase()) {
              confidence += 0.8;
              matchReasons.push('罗马音匹配');
            }
          }
        }

        // 只有超过最小置信度才添加建议
        if (confidence >= matchingRules.minimumConfidence && matchReasons.length > 0) {
          suggestions.push({
            audioFile,
            contentItem,
            confidence,
            matchReason: matchReasons.join(', '),
            status: 'suggested'
          });
        }
      });
    });

    // 按置信度排序
    suggestions.sort((a, b) => b.confidence - a.confidence);

    setMatchSuggestions(suggestions);
  }, [audioFiles, contentItems, contentType, matchingRules]);

  // 自动匹配
  const handleAutoMatch = useCallback(() => {
    setProcessing(true);
    generateMatchSuggestions();
    setProcessing(false);
    
    toast({
      title: "智能匹配完成",
      description: `找到 ${matchSuggestions.length} 个匹配建议`,
    });
  }, [generateMatchSuggestions, matchSuggestions.length, toast]);

  // 选择/取消选择建议
  const toggleSuggestionSelection = useCallback((index: number) => {
    setSelectedSuggestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  // 批量确认选中的关联
  const handleBatchConfirm = useCallback(async () => {
    if (selectedSuggestions.size === 0) {
      toast({
        title: "请选择要确认的关联",
        description: "至少选择一个匹配建议进行确认",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    try {
      const linkedPairs = Array.from(selectedSuggestions).map(index => {
        const suggestion = matchSuggestions[index];
        return {
          audioId: suggestion.audioFile.id!,
          contentId: suggestion.contentItem.id
        };
      });

      // 调用关联API
      await Promise.all(linkedPairs.map(pair => 
        contentService.linkAudioToContent(pair.audioId, pair.contentId, contentType)
      ));

      // 更新建议状态
      setMatchSuggestions(prev => prev.map((suggestion, index) => 
        selectedSuggestions.has(index) 
          ? { ...suggestion, status: 'confirmed' as const }
          : suggestion
      ));

      onLinkComplete(linkedPairs);

      toast({
        title: "关联成功",
        description: `成功关联 ${selectedSuggestions.size} 个音频文件`,
      });

      setSelectedSuggestions(new Set());
    } catch (error) {
      console.error('Batch linking failed:', error);
      toast({
        title: "关联失败",
        description: "批量关联过程中出现错误，请重试",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  }, [selectedSuggestions, matchSuggestions, contentType, onLinkComplete, toast]);

  // 筛选后的建议
  const filteredSuggestions = useMemo(() => {
    if (!searchTerm) return matchSuggestions;
    
    return matchSuggestions.filter(suggestion =>
      suggestion.audioFile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      suggestion.contentItem.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [matchSuggestions, searchTerm]);

  // 统计信息
  const stats = useMemo(() => {
    const confirmed = matchSuggestions.filter(s => s.status === 'confirmed').length;
    const suggested = matchSuggestions.filter(s => s.status === 'suggested').length;
    const rejected = matchSuggestions.filter(s => s.status === 'rejected').length;
    
    return { confirmed, suggested, rejected, total: matchSuggestions.length };
  }, [matchSuggestions]);

  const getContentTypeName = (type: string) => {
    const names = { course: '课程', material: '学习材料', vocabulary: '词汇', exercise: '练习题' };
    return names[type as keyof typeof names] || type;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            智能音频关联 - {getContentTypeName(contentType)}
          </DialogTitle>
          <DialogDescription>
            自动匹配音频文件与学习内容，支持批量确认关联
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 操作控制区 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                匹配设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>匹配规则</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="exactName"
                        checked={matchingRules.exactName}
                        onCheckedChange={(checked) => 
                          setMatchingRules(prev => ({ ...prev, exactName: !!checked }))
                        }
                      />
                      <Label htmlFor="exactName">精确名称匹配</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="fuzzyName"
                        checked={matchingRules.fuzzyName}
                        onCheckedChange={(checked) => 
                          setMatchingRules(prev => ({ ...prev, fuzzyName: !!checked }))
                        }
                      />
                      <Label htmlFor="fuzzyName">模糊名称匹配</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="numberSequence"
                        checked={matchingRules.numberSequence}
                        onCheckedChange={(checked) => 
                          setMatchingRules(prev => ({ ...prev, numberSequence: !!checked }))
                        }
                      />
                      <Label htmlFor="numberSequence">序号匹配</Label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confidence">最小置信度</Label>
                  <Input
                    id="confidence"
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={matchingRules.minimumConfidence}
                    onChange={(e) => setMatchingRules(prev => ({ 
                      ...prev, 
                      minimumConfidence: parseFloat(e.target.value) 
                    }))}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button onClick={handleAutoMatch} disabled={processing}>
                  {processing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      分析中...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      智能匹配
                    </>
                  )}
                </Button>

                <Button 
                  onClick={handleBatchConfirm}
                  disabled={selectedSuggestions.size === 0 || processing}
                  variant="outline"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  批量确认 ({selectedSuggestions.size})
                </Button>

                <div className="flex-1">
                  <Input
                    placeholder="搜索音频文件或内容..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 统计信息 */}
          {stats.total > 0 && (
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-blue-600">匹配建议</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
                <div className="text-sm text-green-600">已确认</div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.suggested}</div>
                <div className="text-sm text-yellow-600">待确认</div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                <div className="text-sm text-red-600">已拒绝</div>
              </div>
            </div>
          )}

          {/* 匹配建议列表 */}
          {filteredSuggestions.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-4 w-4" />
                  匹配建议 ({filteredSuggestions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                                     <TableHeader>                     <TableRow>                       <TableHead className="w-[50px]">选择</TableHead>                       <TableHead>音频文件</TableHead>                       <TableHead>关联内容</TableHead>                       <TableHead>置信度</TableHead>                       <TableHead>匹配原因</TableHead>                       <TableHead>状态</TableHead>                       <TableHead>操作</TableHead>                     </TableRow>                   </TableHeader>
                  <TableBody>
                    {filteredSuggestions.map((suggestion, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Checkbox
                            checked={selectedSuggestions.has(index)}
                            onCheckedChange={() => toggleSuggestionSelection(index)}
                            disabled={suggestion.status !== 'suggested'}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Music className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{suggestion.audioFile.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span>{suggestion.contentItem.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getConfidenceColor(suggestion.confidence)}>
                            {(suggestion.confidence * 100).toFixed(0)}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {suggestion.matchReason}
                          </span>
                        </TableCell>
                        <TableCell>
                          {suggestion.status === 'suggested' && (
                            <Badge variant="outline">待确认</Badge>
                          )}
                          {suggestion.status === 'confirmed' && (
                            <Badge className="bg-green-100 text-green-800">已确认</Badge>
                          )}
                          {suggestion.status === 'rejected' && (
                            <Badge variant="destructive">已拒绝</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Play className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {matchSuggestions.length === 0 
                  ? "点击'智能匹配'开始分析音频文件与内容的关联关系" 
                  : "没有找到符合搜索条件的匹配建议"
                }
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button 
            onClick={handleBatchConfirm}
            disabled={selectedSuggestions.size === 0 || processing}
          >
            完成关联 ({selectedSuggestions.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AudioContentLinker; 