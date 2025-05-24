import { memo, useMemo, useCallback } from 'react';import { Link } from 'react-router-dom';import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Calendar,
  Video,
  Volume2,
  FileText,
  Brain,
  Target,
  Languages,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Star,
  BarChart3,
  Award
} from 'lucide-react';

// 优化的徽章组件
const DifficultyBadge = memo(({ difficulty }: { difficulty: string }) => {
  const badgeConfig = useMemo(() => {
    const configs = {
      beginner: { className: 'bg-green-100 text-green-800', label: '初级' },
      intermediate: { className: 'bg-yellow-100 text-yellow-800', label: '中级' },
      advanced: { className: 'bg-red-100 text-red-800', label: '高级' },
      easy: { className: 'bg-green-100 text-green-800', label: '简单' },
      medium: { className: 'bg-yellow-100 text-yellow-800', label: '中等' },
      hard: { className: 'bg-red-100 text-red-800', label: '困难' }
    };
    return configs[difficulty as keyof typeof configs] || { className: 'bg-gray-100 text-gray-800', label: difficulty };
  }, [difficulty]);

  return (
    <Badge className={badgeConfig.className}>
      {badgeConfig.label}
    </Badge>
  );
});

const StatusBadge = memo(({ status }: { status: string }) => {
  const badgeConfig = useMemo(() => {
    const configs = {
      published: { className: 'bg-green-100 text-green-800', label: '已发布' },
      draft: { className: 'bg-gray-100 text-gray-800', label: '草稿' },
      review: { className: 'bg-yellow-100 text-yellow-800', label: '审核中' },
      active: { className: 'bg-green-100 text-green-800', label: '启用' },
      inactive: { className: 'bg-gray-100 text-gray-800', label: '禁用' }
    };
    return configs[status as keyof typeof configs] || { className: 'bg-gray-100 text-gray-800', label: status };
  }, [status]);

  return (
    <Badge className={badgeConfig.className}>
      {badgeConfig.label}
    </Badge>
  );
});

const TypeBadge = memo(({ type }: { type: string }) => {
  const badgeConfig = useMemo(() => {
    const icons = {
      video: <Video className="h-3 w-3" />,
      audio: <Volume2 className="h-3 w-3" />,
      text: <FileText className="h-3 w-3" />,
      quiz: <Brain className="h-3 w-3" />,
      listening: <Volume2 className="h-3 w-3" />,
      speaking: <Languages className="h-3 w-3" />,
      grammar: <FileText className="h-3 w-3" />,
      vocabulary: <Target className="h-3 w-3" />
    };

    const labels = {
      video: '视频',
      audio: '音频', 
      text: '文本',
      quiz: '测验',
      listening: '听力',
      speaking: '口语',
      grammar: '语法',
      vocabulary: '词汇'
    };

    return {
      icon: icons[type as keyof typeof icons],
      label: labels[type as keyof typeof labels] || type
    };
  }, [type]);

  return (
    <Badge variant="outline" className="flex items-center gap-1">
      {badgeConfig.icon}
      {badgeConfig.label}
    </Badge>
  );
});

// 分页器组件
const PaginationControls = memo(({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  const handlePrevious = useCallback(() => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  }, [currentPage, onPageChange]);

  const handleNext = useCallback(() => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  }, [currentPage, totalPages, onPageChange]);

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        第 {currentPage} 页，共 {totalPages} 页
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={currentPage <= 1}
        >
          上一页
        </Button>
        <Button
          variant="outline" 
          size="sm"
          onClick={handleNext}
          disabled={currentPage >= totalPages}
        >
          下一页
        </Button>
      </div>
    </div>
  );
});

// 优化的课程表格行
const CourseTableRow = memo(({ 
  course, 
  onEdit, 
  onDelete, 
  onView 
}: { 
  course: any;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onView: (id: number) => void;
}) => {
  const handleEdit = useCallback(() => onEdit(course.id), [onEdit, course.id]);
  const handleDelete = useCallback(() => onDelete(course.id), [onDelete, course.id]);
  const handleView = useCallback(() => onView(course.id), [onView, course.id]);

  return (
    <TableRow>
      <TableCell>
        <Checkbox />
      </TableCell>
      <TableCell className="font-medium">第{course.day_number}天</TableCell>
      <TableCell>
        <div>
          <p className="font-medium">{course.title}</p>
          <p className="text-sm text-gray-500">更新于 {course.last_updated}</p>
        </div>
      </TableCell>
      <TableCell>
        <DifficultyBadge difficulty={course.difficulty} />
      </TableCell>
      <TableCell>
        <StatusBadge status={course.status} />
      </TableCell>
      <TableCell>
        <Badge variant="outline">{course.materials_count} 个</Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2 w-16">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${course.completion_rate}%` }}
            />
          </div>
          <span className="text-sm">{course.completion_rate}%</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 text-yellow-500" />
          <span>{course.user_feedback}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Link to={`/admin/content/courses/${course.id}`}>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-red-600" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

// 优化的课程标签页
export const OptimizedCoursesTab = memo(({
  courses,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterLevel,
  setFilterLevel,
  currentPage,
  setCurrentPage,
  pageSize,
  handleCreateContent,
  handleEdit,
  handleDelete,
  handleView
}: any) => {
  const filteredCourses = useMemo(() => {
    return courses.filter((course: any) => {
      const matchesSearch = searchTerm === "" || course.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || course.status === filterStatus;
      const matchesLevel = filterLevel === "all" || course.difficulty === filterLevel;
      return matchesSearch && matchesStatus && matchesLevel;
    });
  }, [courses, searchTerm, filterStatus, filterLevel]);

  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredCourses.slice(startIndex, startIndex + pageSize);
  }, [filteredCourses, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredCourses.length / pageSize);

  return (
    <TabsContent value="courses" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            90天课程管理
          </CardTitle>
          <CardDescription>
            管理90天学习路径中每天的课程内容（共 {filteredCourses.length} 个课程）
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 搜索和筛选 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索课程标题..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="published">已发布</SelectItem>
                  <SelectItem value="draft">草稿</SelectItem>
                  <SelectItem value="review">审核中</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="难度" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部难度</SelectItem>
                  <SelectItem value="beginner">初级</SelectItem>
                  <SelectItem value="intermediate">中级</SelectItem>
                  <SelectItem value="advanced">高级</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => handleCreateContent('course')} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              添加课程
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox />
                </TableHead>
                <TableHead>天数</TableHead>
                <TableHead>课程标题</TableHead>
                <TableHead>难度</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>材料数</TableHead>
                <TableHead>完成率</TableHead>
                <TableHead>评分</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCourses.map((course: any) => (
                <CourseTableRow
                  key={course.id}
                  course={course}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                />
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="mt-4">
              <PaginationControls 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
});

OptimizedCoursesTab.displayName = 'OptimizedCoursesTab';

// 优化的学习材料标签页
export const OptimizedMaterialsTab = memo(({
  materials,
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  currentPage,
  setCurrentPage,
  pageSize,
  handleCreateContent,
  handleEdit,
  handleDelete,
  handleView
}: any) => {
  const filteredMaterials = useMemo(() => {
    return materials.filter((material: any) => {
      const matchesSearch = searchTerm === "" || material.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || material.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [materials, searchTerm, filterType]);

  const paginatedMaterials = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredMaterials.slice(startIndex, startIndex + pageSize);
  }, [filteredMaterials, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredMaterials.length / pageSize);

  // 格式化时长
  const formatDuration = useCallback((minutes: number) => {
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}时${mins}分`;
  }, []);

  // 材料表格行组件
  const MaterialTableRow = memo(({ 
    material, 
    onEdit, 
    onDelete, 
    onView 
  }: { 
    material: any;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    onView: (id: number) => void;
  }) => {
    const handleEdit = useCallback(() => onEdit(material.id), [onEdit, material.id]);
    const handleDelete = useCallback(() => onDelete(material.id), [onDelete, material.id]);
    const handleView = useCallback(() => onView(material.id), [onView, material.id]);

    return (
      <TableRow>
        <TableCell>
          <Checkbox />
        </TableCell>
        <TableCell className="font-medium">{material.title}</TableCell>
        <TableCell>
          <TypeBadge type={material.type} />
        </TableCell>
        <TableCell>第{material.course_day || 1}天</TableCell>
        <TableCell>{formatDuration(material.duration_minutes || 0)}</TableCell>
        <TableCell>{material.file_size || '未知'}</TableCell>
        <TableCell>{material.views || 0}</TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400" />
            <span>{material.rating || 0}</span>
          </div>
        </TableCell>
        <TableCell>{material.created_at || '未知'}</TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleView}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-red-600" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  });

  return (
    <TabsContent value="materials" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            学习材料库
          </CardTitle>
          <CardDescription>
            管理视频、音频、文本和测验等各类学习资源（共 {filteredMaterials.length} 个材料）
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 材料库统计卡片 */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
              <CardContent className="flex items-center p-6">
                <Video className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">视频材料</p>
                  <p className="text-2xl font-bold">{materials.filter((m: any) => m.type === 'video').length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-6">
                <Volume2 className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">音频材料</p>
                  <p className="text-2xl font-bold">{materials.filter((m: any) => m.type === 'audio').length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-6">
                <FileText className="h-8 w-8 text-orange-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">文本材料</p>
                  <p className="text-2xl font-bold">{materials.filter((m: any) => m.type === 'text').length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-6">
                <Brain className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">测验材料</p>
                  <p className="text-2xl font-bold">{materials.filter((m: any) => m.type === 'quiz').length}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 搜索和筛选 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索学习材料..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="video">视频</SelectItem>
                  <SelectItem value="audio">音频</SelectItem>
                  <SelectItem value="text">文本</SelectItem>
                  <SelectItem value="quiz">测验</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => handleCreateContent('material')} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              添加材料
            </Button>
          </div>

          {/* 材料表格 */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox />
                </TableHead>
                <TableHead>材料标题</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>所属课程</TableHead>
                <TableHead>时长</TableHead>
                <TableHead>文件大小</TableHead>
                <TableHead>观看/下载</TableHead>
                <TableHead>评分</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMaterials.map((material: any) => (
                <MaterialTableRow
                  key={material.id}
                  material={material}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                />
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="mt-4">
              <PaginationControls 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
});

OptimizedMaterialsTab.displayName = 'OptimizedMaterialsTab';// 优化的词汇管理标签页export const OptimizedVocabularyTab = memo(({  vocabulary,  searchTerm,  setSearchTerm,  filterLevel,  setFilterLevel,  currentPage,  setCurrentPage,  pageSize,  handleCreateContent,  handleEdit,  handleDelete,  handleView}: any) => {  const filteredVocabulary = useMemo(() => {    return vocabulary.filter((word: any) => {      const matchesSearch = searchTerm === "" ||         word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||        word.reading.toLowerCase().includes(searchTerm.toLowerCase()) ||        word.meaning.toLowerCase().includes(searchTerm.toLowerCase());      const matchesLevel = filterLevel === "all" || word.jlpt_level === filterLevel;      return matchesSearch && matchesLevel;    });  }, [vocabulary, searchTerm, filterLevel]);  const paginatedVocabulary = useMemo(() => {    const startIndex = (currentPage - 1) * pageSize;    return filteredVocabulary.slice(startIndex, startIndex + pageSize);  }, [filteredVocabulary, currentPage, pageSize]);  const totalPages = Math.ceil(filteredVocabulary.length / pageSize);  // JLPT等级徽章  const JLPTBadge = memo(({ level }: { level: string }) => {    const levelConfig = useMemo(() => {      const configs = {        N5: { className: 'bg-green-100 text-green-800', label: 'N5' },        N4: { className: 'bg-blue-100 text-blue-800', label: 'N4' },        N3: { className: 'bg-yellow-100 text-yellow-800', label: 'N3' },        N2: { className: 'bg-orange-100 text-orange-800', label: 'N2' },        N1: { className: 'bg-red-100 text-red-800', label: 'N1' }      };      return configs[level as keyof typeof configs] || { className: 'bg-gray-100 text-gray-800', label: level };    }, [level]);    return (      <Badge className={levelConfig.className}>        {levelConfig.label}      </Badge>    );  });  // 词汇表格行组件  const VocabularyTableRow = memo(({     word,     onEdit,     onDelete,     onView   }: {     word: any;    onEdit: (id: number) => void;    onDelete: (id: number) => void;    onView: (id: number) => void;  }) => {    const handleEdit = useCallback(() => onEdit(word.id), [onEdit, word.id]);    const handleDelete = useCallback(() => onDelete(word.id), [onDelete, word.id]);    const handleView = useCallback(() => onView(word.id), [onView, word.id]);    return (      <TableRow>        <TableCell>          <Checkbox />        </TableCell>        <TableCell className="font-medium">{word.word}</TableCell>        <TableCell className="text-blue-600">{word.reading}</TableCell>        <TableCell>{word.meaning}</TableCell>        <TableCell>          <Badge variant="outline">{word.part_of_speech}</Badge>        </TableCell>        <TableCell>          <JLPTBadge level={word.jlpt_level} />        </TableCell>        <TableCell className="max-w-xs truncate">{word.example_sentence || '暂无'}</TableCell>        <TableCell>{word.created_at || '未知'}</TableCell>        <TableCell>          <div className="flex items-center gap-2">            <Button variant="ghost" size="sm" onClick={handleView}>              <Eye className="h-4 w-4" />            </Button>            <Button variant="ghost" size="sm" onClick={handleEdit}>              <Edit className="h-4 w-4" />            </Button>            <Button variant="ghost" size="sm" className="text-red-600" onClick={handleDelete}>              <Trash2 className="h-4 w-4" />            </Button>          </div>        </TableCell>      </TableRow>    );  });  return (    <TabsContent value="vocabulary" className="space-y-6">      <Card>        <CardHeader>          <CardTitle className="flex items-center gap-2">            <Target className="h-5 w-5" />            词汇管理          </CardTitle>          <CardDescription>            管理日语单词、读音、释义和例句等词汇信息（共 {filteredVocabulary.length} 个词汇）          </CardDescription>        </CardHeader>        <CardContent>          {/* 词汇统计卡片 */}          <div className="grid gap-4 md:grid-cols-5 mb-6">            <Card>              <CardContent className="flex items-center p-6">                <Award className="h-8 w-8 text-green-600 mr-3" />                <div>                  <p className="text-sm font-medium text-gray-600">N5词汇</p>                  <p className="text-2xl font-bold">{vocabulary.filter((v: any) => v.jlpt_level === 'N5').length}</p>                </div>              </CardContent>            </Card>            <Card>              <CardContent className="flex items-center p-6">                <Award className="h-8 w-8 text-blue-600 mr-3" />                <div>                  <p className="text-sm font-medium text-gray-600">N4词汇</p>                  <p className="text-2xl font-bold">{vocabulary.filter((v: any) => v.jlpt_level === 'N4').length}</p>                </div>              </CardContent>            </Card>            <Card>              <CardContent className="flex items-center p-6">                <Award className="h-8 w-8 text-yellow-600 mr-3" />                <div>                  <p className="text-sm font-medium text-gray-600">N3词汇</p>                  <p className="text-2xl font-bold">{vocabulary.filter((v: any) => v.jlpt_level === 'N3').length}</p>                </div>              </CardContent>            </Card>            <Card>              <CardContent className="flex items-center p-6">                <Award className="h-8 w-8 text-orange-600 mr-3" />                <div>                  <p className="text-sm font-medium text-gray-600">N2词汇</p>                  <p className="text-2xl font-bold">{vocabulary.filter((v: any) => v.jlpt_level === 'N2').length}</p>                </div>              </CardContent>            </Card>            <Card>              <CardContent className="flex items-center p-6">                <Award className="h-8 w-8 text-red-600 mr-3" />                <div>                  <p className="text-sm font-medium text-gray-600">N1词汇</p>                  <p className="text-2xl font-bold">{vocabulary.filter((v: any) => v.jlpt_level === 'N1').length}</p>                </div>              </CardContent>            </Card>          </div>          {/* 搜索和筛选 */}          <div className="flex items-center justify-between mb-6">            <div className="flex items-center gap-4">              <div className="relative">                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />                <Input                  placeholder="搜索词汇、读音或释义..."                  value={searchTerm}                  onChange={(e) => setSearchTerm(e.target.value)}                  className="pl-10 w-64"                />              </div>              <Select value={filterLevel} onValueChange={setFilterLevel}>                <SelectTrigger className="w-32">                  <SelectValue placeholder="JLPT等级" />                </SelectTrigger>                <SelectContent>                  <SelectItem value="all">全部等级</SelectItem>                  <SelectItem value="N5">N5</SelectItem>                  <SelectItem value="N4">N4</SelectItem>                  <SelectItem value="N3">N3</SelectItem>                  <SelectItem value="N2">N2</SelectItem>                  <SelectItem value="N1">N1</SelectItem>                </SelectContent>              </Select>            </div>            <Button onClick={() => handleCreateContent('vocabulary')} className="bg-purple-600 hover:bg-purple-700">              <Plus className="h-4 w-4 mr-2" />              添加词汇            </Button>          </div>          {/* 词汇表格 */}          <Table>            <TableHeader>              <TableRow>                <TableHead className="w-12">                  <Checkbox />                </TableHead>                <TableHead>词汇</TableHead>                <TableHead>读音</TableHead>                <TableHead>释义</TableHead>                <TableHead>词性</TableHead>                <TableHead>JLPT等级</TableHead>                <TableHead>例句</TableHead>                <TableHead>创建时间</TableHead>                <TableHead>操作</TableHead>              </TableRow>            </TableHeader>            <TableBody>              {paginatedVocabulary.map((word: any) => (                <VocabularyTableRow                  key={word.id}                  word={word}                  onEdit={handleEdit}                  onDelete={handleDelete}                  onView={handleView}                />              ))}            </TableBody>          </Table>          {totalPages > 1 && (            <div className="mt-4">              <PaginationControls                 currentPage={currentPage}                totalPages={totalPages}                onPageChange={setCurrentPage}              />            </div>          )}        </CardContent>      </Card>    </TabsContent>  );});OptimizedVocabularyTab.displayName = 'OptimizedVocabularyTab';// 优化的练习题库标签页export const OptimizedExercisesTab = memo(({  exercises,  searchTerm,  setSearchTerm,  filterType,  setFilterType,  filterLevel,  setFilterLevel,  currentPage,  setCurrentPage,  pageSize,  handleCreateContent,  handleEdit,  handleDelete,  handleView}: any) => {  const filteredExercises = useMemo(() => {    return exercises.filter((exercise: any) => {      const matchesSearch = searchTerm === "" ||         exercise.title.toLowerCase().includes(searchTerm.toLowerCase()) ||        exercise.question.toLowerCase().includes(searchTerm.toLowerCase());      const matchesType = filterType === "all" || exercise.type === filterType;      const matchesLevel = filterLevel === "all" || exercise.difficulty === filterLevel;      return matchesSearch && matchesType && matchesLevel;    });  }, [exercises, searchTerm, filterType, filterLevel]);  const paginatedExercises = useMemo(() => {    const startIndex = (currentPage - 1) * pageSize;    return filteredExercises.slice(startIndex, startIndex + pageSize);  }, [filteredExercises, currentPage, pageSize]);  const totalPages = Math.ceil(filteredExercises.length / pageSize);  // 练习题表格行组件  const ExerciseTableRow = memo(({     exercise,     onEdit,     onDelete,     onView   }: {     exercise: any;    onEdit: (id: number) => void;    onDelete: (id: number) => void;    onView: (id: number) => void;  }) => {    const handleEdit = useCallback(() => onEdit(exercise.id), [onEdit, exercise.id]);    const handleDelete = useCallback(() => onDelete(exercise.id), [onDelete, exercise.id]);    const handleView = useCallback(() => onView(exercise.id), [onView, exercise.id]);    return (      <TableRow>        <TableCell>          <Checkbox />        </TableCell>        <TableCell className="font-medium">{exercise.title}</TableCell>        <TableCell>          <TypeBadge type={exercise.type} />        </TableCell>        <TableCell>第{exercise.course_day || 1}天</TableCell>        <TableCell>          <DifficultyBadge difficulty={exercise.difficulty || 'easy'} />        </TableCell>        <TableCell>          <div className="flex items-center gap-1">            <Target className="h-4 w-4 text-blue-500" />            <span>{exercise.points || 10}</span>          </div>        </TableCell>        <TableCell>{exercise.completion_count || 0}</TableCell>        <TableCell>          <div className="flex items-center gap-1">            <BarChart3 className="h-4 w-4 text-green-500" />            <span>{exercise.accuracy_rate || 0}%</span>          </div>        </TableCell>        <TableCell>{exercise.created_at || '未知'}</TableCell>        <TableCell>          <div className="flex items-center gap-2">            <Button variant="ghost" size="sm" onClick={handleView}>              <Eye className="h-4 w-4" />            </Button>            <Button variant="ghost" size="sm" onClick={handleEdit}>              <Edit className="h-4 w-4" />            </Button>            <Button variant="ghost" size="sm" className="text-red-600" onClick={handleDelete}>              <Trash2 className="h-4 w-4" />            </Button>          </div>        </TableCell>      </TableRow>    );  });  return (    <TabsContent value="exercises" className="space-y-6">      <Card>        <CardHeader>          <CardTitle className="flex items-center gap-2">            <Brain className="h-5 w-5" />            练习题库          </CardTitle>          <CardDescription>            管理各类练习题，包括词汇、语法、听力和综合练习（共 {filteredExercises.length} 道题目）          </CardDescription>        </CardHeader>        <CardContent>          {/* 练习题统计卡片 */}          <div className="grid gap-4 md:grid-cols-4 mb-6">            <Card>              <CardContent className="flex items-center p-6">                <Target className="h-8 w-8 text-blue-600 mr-3" />                <div>                  <p className="text-sm font-medium text-gray-600">词汇练习</p>                  <p className="text-2xl font-bold">{exercises.filter((e: any) => e.type === 'vocabulary').length}</p>                </div>              </CardContent>            </Card>            <Card>              <CardContent className="flex items-center p-6">                <FileText className="h-8 w-8 text-green-600 mr-3" />                <div>                  <p className="text-sm font-medium text-gray-600">语法练习</p>                  <p className="text-2xl font-bold">{exercises.filter((e: any) => e.type === 'grammar').length}</p>                </div>              </CardContent>            </Card>            <Card>              <CardContent className="flex items-center p-6">                <Volume2 className="h-8 w-8 text-orange-600 mr-3" />                <div>                  <p className="text-sm font-medium text-gray-600">听力练习</p>                  <p className="text-2xl font-bold">{exercises.filter((e: any) => e.type === 'listening').length}</p>                </div>              </CardContent>            </Card>            <Card>              <CardContent className="flex items-center p-6">                <Languages className="h-8 w-8 text-purple-600 mr-3" />                <div>                  <p className="text-sm font-medium text-gray-600">口语练习</p>                  <p className="text-2xl font-bold">{exercises.filter((e: any) => e.type === 'speaking').length}</p>                </div>              </CardContent>            </Card>          </div>          {/* 搜索和筛选 */}          <div className="flex items-center justify-between mb-6">            <div className="flex items-center gap-4">              <div className="relative">                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />                <Input                  placeholder="搜索练习题标题或内容..."                  value={searchTerm}                  onChange={(e) => setSearchTerm(e.target.value)}                  className="pl-10 w-64"                />              </div>              <Select value={filterType} onValueChange={setFilterType}>                <SelectTrigger className="w-32">                  <SelectValue placeholder="类型" />                </SelectTrigger>                <SelectContent>                  <SelectItem value="all">全部类型</SelectItem>                  <SelectItem value="vocabulary">词汇</SelectItem>                  <SelectItem value="grammar">语法</SelectItem>                  <SelectItem value="listening">听力</SelectItem>                  <SelectItem value="speaking">口语</SelectItem>                </SelectContent>              </Select>              <Select value={filterLevel} onValueChange={setFilterLevel}>                <SelectTrigger className="w-32">                  <SelectValue placeholder="难度" />                </SelectTrigger>                <SelectContent>                  <SelectItem value="all">全部难度</SelectItem>                  <SelectItem value="easy">简单</SelectItem>                  <SelectItem value="medium">中等</SelectItem>                  <SelectItem value="hard">困难</SelectItem>                </SelectContent>              </Select>            </div>            <Button onClick={() => handleCreateContent('exercise')} className="bg-indigo-600 hover:bg-indigo-700">              <Plus className="h-4 w-4 mr-2" />              添加练习题            </Button>          </div>          {/* 练习题表格 */}          <Table>            <TableHeader>              <TableRow>                <TableHead className="w-12">                  <Checkbox />                </TableHead>                <TableHead>题目标题</TableHead>                <TableHead>类型</TableHead>                <TableHead>所属课程</TableHead>                <TableHead>难度</TableHead>                <TableHead>分值</TableHead>                <TableHead>完成次数</TableHead>                <TableHead>正确率</TableHead>                <TableHead>创建时间</TableHead>                <TableHead>操作</TableHead>              </TableRow>            </TableHeader>            <TableBody>              {paginatedExercises.map((exercise: any) => (                <ExerciseTableRow                  key={exercise.id}                  exercise={exercise}                  onEdit={handleEdit}                  onDelete={handleDelete}                  onView={handleView}                />              ))}            </TableBody>          </Table>          {totalPages > 1 && (            <div className="mt-4">              <PaginationControls                 currentPage={currentPage}                totalPages={totalPages}                onPageChange={setCurrentPage}              />            </div>          )}        </CardContent>      </Card>    </TabsContent>  );});OptimizedExercisesTab.displayName = 'OptimizedExercisesTab'; 