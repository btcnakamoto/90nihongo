import React, { useEffect, useState, useCallback } from 'react';
import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { 
  BookIcon, 
  Plus, 
  Search, 
  Download,
  Upload,
  Eye,
  Edit3,
  Trash2,
  Star,
  TrendingUp,
  MoreHorizontal,
  Languages,
  Bookmark,
  Volume2
} from 'lucide-react';

interface Vocabulary {
  id: number;
  word: string;
  reading: string;
  meaning: string;
  jlpt_level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  part_of_speech: string;
  example_sentence: string;
  mastery_rate: number;
  created_at: string;
}

const AdminVocabularyManagement = () => {
  const { isCollapsed } = useSidebar();
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWords, setSelectedWords] = useState<number[]>([]);
  
  // 筛选状态
  const [searchTerm, setSearchTerm] = useState('');
  const [jlptFilter, setJlptFilter] = useState('all');
  const [partOfSpeechFilter, setPartOfSpeechFilter] = useState('all');
  const [masteryFilter, setMasteryFilter] = useState('all');

  useEffect(() => {
    fetchVocabulary();
  }, []);

  useEffect(() => {
    fetchVocabulary();
  }, [searchTerm, jlptFilter, partOfSpeechFilter, masteryFilter]);

  const fetchVocabulary = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const params = new URLSearchParams({
        search: searchTerm,
        jlpt_level: jlptFilter,
        part_of_speech: partOfSpeechFilter,
        mastery: masteryFilter
      });

      const response = await fetch(`/api/admin/content/vocabulary?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setVocabulary(data.data || []);
      } else {
        toast({
          title: "错误",
          description: "获取词汇数据失败",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('获取词汇数据失败:', error);
      toast({
        title: "错误",
        description: "网络错误，请重试",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, jlptFilter, partOfSpeechFilter, masteryFilter]);

  const getJlptColor = (level: string) => {
    switch (level) {
      case 'N5': return 'bg-green-100 text-green-800';
      case 'N4': return 'bg-blue-100 text-blue-800';
      case 'N3': return 'bg-yellow-100 text-yellow-800';
      case 'N2': return 'bg-orange-100 text-orange-800';
      case 'N1': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMasteryColor = (rate: number) => {
    if (rate >= 80) return 'bg-green-100 text-green-800';
    if (rate >= 60) return 'bg-yellow-100 text-yellow-800';
    if (rate >= 40) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getMasteryText = (rate: number) => {
    if (rate >= 80) return '熟练';
    if (rate >= 60) return '良好';
    if (rate >= 40) return '一般';
    return '需要提高';
  };

  // 统计数据
  const stats = {
    total: vocabulary.length,
    n5: vocabulary.filter(v => v.jlpt_level === 'N5').length,
    n4: vocabulary.filter(v => v.jlpt_level === 'N4').length,
    n3: vocabulary.filter(v => v.jlpt_level === 'N3').length,
    n2: vocabulary.filter(v => v.jlpt_level === 'N2').length,
    n1: vocabulary.filter(v => v.jlpt_level === 'N1').length,
    avgMastery: vocabulary.length > 0 ? Math.round(vocabulary.reduce((sum, v) => sum + v.mastery_rate, 0) / vocabulary.length) : 0
  };

  // 过滤词汇
  const filteredVocabulary = vocabulary.filter(word => {
    if (searchTerm && !word.word.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !word.reading.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !word.meaning.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (jlptFilter !== 'all' && word.jlpt_level !== jlptFilter) {
      return false;
    }
    if (partOfSpeechFilter !== 'all' && word.part_of_speech !== partOfSpeechFilter) {
      return false;
    }
    if (masteryFilter !== 'all') {
      if (masteryFilter === 'high' && word.mastery_rate < 80) return false;
      if (masteryFilter === 'medium' && (word.mastery_rate < 60 || word.mastery_rate >= 80)) return false;
      if (masteryFilter === 'low' && word.mastery_rate >= 60) return false;
    }
    return true;
  });

  // 获取独特的词性列表
  const partOfSpeechOptions = [...new Set(vocabulary.map(v => v.part_of_speech))];

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 transition-all duration-300",
      isCollapsed ? "ml-16" : "ml-72"
    )}>
      {/* 页面头部 */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-nihongo-darkBlue flex items-center gap-2">
              <BookIcon className="h-6 w-6 text-nihongo-indigo" />
              词汇管理
            </h1>
            <p className="text-gray-600 mt-1">管理和编辑日语词汇库</p>
          </div>
          <div className="flex items-center gap-3">
            {selectedWords.length > 0 && (
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                批量删除 ({selectedWords.length})
              </Button>
            )}
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              导出词汇
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              导入词汇
            </Button>
            <Button size="sm" className="bg-nihongo-indigo hover:bg-nihongo-indigo/90">
              <Plus className="h-4 w-4 mr-2" />
              新建词汇
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 统计概览 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6">
          <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">总词汇数</p>
                  <p className="text-2xl font-bold text-nihongo-darkBlue">{stats.total}</p>
                </div>
                <BookIcon className="h-8 w-8 text-nihongo-indigo" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">N5级别</p>
                  <p className="text-2xl font-bold text-green-600">{stats.n5}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">
                  5
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">N4级别</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.n4}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                  4
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">N3级别</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.n3}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold text-sm">
                  3
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-orange-50 to-red-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">N2级别</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.n2}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
                  2
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-red-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">N1级别</p>
                  <p className="text-2xl font-bold text-red-600">{stats.n1}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm">
                  1
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-violet-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">平均掌握度</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.avgMastery}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选控制面板 */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索单词、读音或含义..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={jlptFilter} onValueChange={setJlptFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="JLPT级别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部级别</SelectItem>
                  <SelectItem value="N5">N5</SelectItem>
                  <SelectItem value="N4">N4</SelectItem>
                  <SelectItem value="N3">N3</SelectItem>
                  <SelectItem value="N2">N2</SelectItem>
                  <SelectItem value="N1">N1</SelectItem>
                </SelectContent>
              </Select>

              <Select value={partOfSpeechFilter} onValueChange={setPartOfSpeechFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="词性筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部词性</SelectItem>
                  {partOfSpeechOptions.map(pos => (
                    <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={masteryFilter} onValueChange={setMasteryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="掌握程度" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部程度</SelectItem>
                  <SelectItem value="high">熟练 (80%+)</SelectItem>
                  <SelectItem value="medium">良好 (60-79%)</SelectItem>
                  <SelectItem value="low">需提高 (<60%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 词汇列表 */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              词汇列表
              <Badge variant="secondary">{filteredVocabulary.length} 个词汇</Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedWords.length === filteredVocabulary.length && filteredVocabulary.length > 0}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedWords(filteredVocabulary.map(v => v.id));
                  } else {
                    setSelectedWords([]);
                  }
                }}
              />
              <span className="text-sm text-gray-500">全选</span>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nihongo-indigo mx-auto"></div>
                <p className="text-gray-500 mt-2">加载中...</p>
              </div>
            ) : filteredVocabulary.length === 0 ? (
              <div className="text-center py-8">
                <BookIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">暂无词汇数据</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredVocabulary.map((word) => (
                  <div key={word.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={selectedWords.includes(word.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedWords([...selectedWords, word.id]);
                          } else {
                            setSelectedWords(selectedWords.filter(id => id !== word.id));
                          }
                        }}
                      />
                      
                      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4">
                        <div className="lg:col-span-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getJlptColor(word.jlpt_level)}>
                              {word.jlpt_level}
                            </Badge>
                            <Badge variant="outline">{word.part_of_speech}</Badge>
                            <span className="text-sm text-gray-500">#{word.id}</span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Languages className="h-4 w-4 text-gray-400" />
                              <span className="text-lg font-bold text-nihongo-darkBlue">{word.word}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Volume2 className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">{word.reading}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Bookmark className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-800">{word.meaning}</span>
                            </div>
                          </div>
                        </div>

                        <div className="lg:col-span-5">
                          {word.example_sentence && (
                            <div>
                              <p className="text-sm text-gray-500 mb-1">例句</p>
                              <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded border-l-2 border-nihongo-indigo">
                                {word.example_sentence}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="lg:col-span-2">
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm text-gray-500">掌握程度</p>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-nihongo-indigo to-nihongo-blue h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${word.mastery_rate}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium">{word.mastery_rate}%</span>
                              </div>
                              <Badge className={getMasteryColor(word.mastery_rate)} size="sm">
                                {getMasteryText(word.mastery_rate)}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500">
                              创建: {word.created_at}
                            </p>
                          </div>
                        </div>

                        <div className="lg:col-span-1 flex items-center gap-2">
                          <Button size="sm" variant="outline" className="w-full">
                            <Eye className="h-3 w-3 mr-1" />
                            查看
                          </Button>
                          <Button size="sm" variant="outline" className="px-2">
                            <MoreHorizontal className="h-3 w-3" />
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
      </div>
    </div>
  );
};

export default AdminVocabularyManagement; 