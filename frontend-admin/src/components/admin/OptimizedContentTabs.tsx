import { memo, useMemo, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { TabsContent } from '@/components/ui/tabs';
import BatchImportDialog from './BatchImportDialog';
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
  Award,
  Tag as TagIcon,
  Folder
} from 'lucide-react';

// 新增分类标签显示组件
const CategoryBadge = memo(({ category }: { category: any }) => (
  <Badge variant="outline" className="flex items-center gap-1">
    <Folder className="h-3 w-3" />
    {category.name}
  </Badge>
));

const TagBadge = memo(({ tag }: { tag: any }) => (
  <Badge variant="secondary" className="flex items-center gap-1">
    <TagIcon className="h-3 w-3" />
    {tag.name}
  </Badge>
));

const ContentLengthBadge = memo(({ length }: { length: string }) => {
  const badgeConfig = useMemo(() => {
    const configs = {
      '短句': { className: 'bg-blue-100 text-blue-800' },
      '中句': { className: 'bg-green-100 text-green-800' },
      '长句': { className: 'bg-orange-100 text-orange-800' },
      '短文': { className: 'bg-purple-100 text-purple-800' },
      '长文': { className: 'bg-red-100 text-red-800' }
    };
    return configs[length as keyof typeof configs] || { className: 'bg-gray-100 text-gray-800' };
  }, [length]);

  return (
    <Badge className={badgeConfig.className}>
      {length}
    </Badge>
  );
});

const DialoguePreview = memo(({ dialogue }: { dialogue: any }) => {
  if (!dialogue) return null;
  
  return (
    <div className="text-sm text-gray-600 space-y-1">
      <div className="font-medium">对话内容预览:</div>
      {dialogue.lines?.slice(0, 2).map((line: any, index: number) => (
        <div key={index} className="flex gap-2">
          <span className="font-semibold">{line.speaker}:</span>
          <span className="truncate">{line.japanese_text}</span>
        </div>
      ))}
      {dialogue.lines?.length > 2 && (
        <div className="text-xs text-gray-400">...还有 {dialogue.lines.length - 2} 行对话</div>
      )}
    </div>
  );
});

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

// 增强版分页器组件
const PaginationControls = memo(({ 
  currentPage, 
  totalPages, 
  totalItems = 0,
  pageSize = 20,
  onPageChange 
}: {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
}) => {
  const [jumpPage, setJumpPage] = useState("");

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

  const handleFirst = useCallback(() => {
    onPageChange(1);
  }, [onPageChange]);

  const handleLast = useCallback(() => {
    onPageChange(totalPages);
  }, [totalPages, onPageChange]);

  const handleJump = useCallback(() => {
    const page = parseInt(jumpPage);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      setJumpPage("");
    }
  }, [jumpPage, totalPages, onPageChange]);

  const handleJumpKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJump();
    }
  }, [handleJump]);

  // 生成显示的页码数组
  const getDisplayPages = useCallback(() => {
    const delta = 2; // 当前页两边显示的页数
    const range = [];
    const rangeWithDots = [];

    // 计算显示范围
    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    // 添加首页
    if (start > 1) {
      rangeWithDots.push(1);
      if (start > 2) {
        rangeWithDots.push('...');
      }
    }

    // 添加中间页码
    rangeWithDots.push(...range);

    // 添加末页
    if (end < totalPages) {
      if (end < totalPages - 1) {
        rangeWithDots.push('...');
      }
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  }, [currentPage, totalPages]);

  const displayPages = getDisplayPages();

  // 计算当前显示的记录范围
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalItems);

  // 总是显示分页信息，即使只有一页
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-3 border-t bg-gray-50/50">
      {/* 记录信息 */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>显示第 {startRecord}-{endRecord} 条</span>
        <span>共 {totalItems} 条记录</span>
        <span>第 {currentPage}/{Math.max(1, totalPages)} 页</span>
      </div>

      {/* 分页控件 - 只在有多页时显示 */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          {/* 首页和上一页 */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleFirst}
            disabled={currentPage <= 1}
            className="hidden sm:inline-flex"
          >
            首页
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentPage <= 1}
          >
            上一页
          </Button>

          {/* 页码按钮 */}
          <div className="hidden md:flex items-center gap-1">
            {displayPages.map((page, index) => 
              typeof page === 'number' ? (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className="min-w-[2.5rem]"
                >
                  {page}
                </Button>
              ) : (
                <span key={index} className="px-2 text-muted-foreground">
                  {page}
                </span>
              )
            )}
          </div>

          {/* 下一页和末页 */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={currentPage >= totalPages}
          >
            下一页
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLast}
            disabled={currentPage >= totalPages}
            className="hidden sm:inline-flex"
          >
            末页
          </Button>

          {/* 快速跳转 */}
          <div className="hidden lg:flex items-center gap-2 ml-4">
            <span className="text-sm text-muted-foreground">跳转到</span>
            <Input
              type="number"
              min="1"
              max={totalPages}
              value={jumpPage}
              onChange={(e) => setJumpPage(e.target.value)}
              onKeyPress={handleJumpKeyPress}
              className="w-16 h-8 text-center"
              placeholder="页"
            />
            <Button size="sm" onClick={handleJump} disabled={!jumpPage}>
              跳转
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});

// 更新的学习材料表格行
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
      <TableCell className="font-medium">
        <div className="space-y-2">
          <div>
            <p className="font-medium">{material.title}</p>
            <p className="text-sm text-gray-500">
              {material.source_type === 'json_import' && material.source_id && (
                <span className="text-blue-600">ID: {material.source_id}</span>
              )}
            </p>
          </div>
          
          {/* 分类显示 */}
          {material.categories && material.categories.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {material.categories.map((category: any) => (
                <CategoryBadge key={category.id} category={category} />
              ))}
            </div>
          )}
          
          {/* 标签显示 */}
          {material.tags && material.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {material.tags.slice(0, 3).map((tag: any) => (
                <TagBadge key={tag.id} tag={tag} />
              ))}
              {material.tags.length > 3 && (
                <Badge variant="outline">+{material.tags.length - 3}</Badge>
              )}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <TypeBadge type={material.type} />
          {material.content_length && (
            <ContentLengthBadge length={material.content_length} />
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-2">
          {material.content_style && (
            <Badge variant="outline">{material.content_style}</Badge>
          )}
          <p className="text-sm text-gray-500 line-clamp-2">{material.content}</p>
          
          {/* 对话内容预览 */}
          <DialoguePreview dialogue={material.dialogue} />
        </div>
      </TableCell>
      <TableCell>
        {material.media_url && (
          <Badge variant="outline" className="text-green-600">
            <Volume2 className="h-3 w-3 mr-1" />
            有音频
          </Badge>
        )}
        {material.dialogue?.lines?.some((line: any) => line.audio_url) && (
          <Badge variant="outline" className="text-blue-600">
            <Volume2 className="h-3 w-3 mr-1" />
            分段音频
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleView}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
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
            管理每日课程安排，追踪学习进度和完成情况（共 {filteredCourses.length} 天课程）
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 课程表格 */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox />
                </TableHead>
                <TableHead>课程日期</TableHead>
                <TableHead>课程标题</TableHead>
                <TableHead>难度等级</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>关联材料</TableHead>
                <TableHead>完成率</TableHead>
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
                totalItems={filteredCourses.length}
                pageSize={pageSize}
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

// 更新的学习材料标签页组件
export const OptimizedMaterialsTab = memo(({
  materials,
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filterCategory, // 新增分类筛选
  setFilterCategory,
  filterTag, // 新增标签筛选
  setFilterTag,
  categories, // 新增分类数据
  tags, // 新增标签数据
  currentPage,
  setCurrentPage,
  pageSize,
  totalPages, // 新增总页数
  totalItems, // 新增总条数
  handleCreateContent,
  handleEdit,
  handleDelete,
  handleView
}: {
  materials: any[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
  filterCategory?: string;
  setFilterCategory?: (category: string) => void;
  filterTag?: string;
  setFilterTag?: (tag: string) => void;
  categories?: any[];
  tags?: any[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  totalPages?: number; // 新增
  totalItems?: number; // 新增
  handleCreateContent: () => void;
  handleEdit: (id: number) => void;
  handleDelete: (id: number) => void;
  handleView: (id: number) => void;
}) => {
  // 当使用外部分页数据时，不再在组件内部进行筛选和分页
  const shouldUseExternalPagination = totalPages !== undefined && totalItems !== undefined;
  
  // 筛选逻辑 - 仅在没有外部分页数据时使用
  const filteredMaterials = useMemo(() => {
    if (shouldUseExternalPagination) {
      return materials; // 直接使用传入的材料数据，不再进行客户端筛选
    }
    
    return materials.filter(material => {
      const matchesSearch = !searchTerm || 
        material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.source_id?.toString().includes(searchTerm);
      
      const matchesType = filterType === 'all' || material.type === filterType;
      
      const matchesCategory = !filterCategory || filterCategory === 'all' || 
        material.categories?.some((cat: any) => cat.id.toString() === filterCategory);
      
      const matchesTag = !filterTag || filterTag === 'all' || 
        material.tags?.some((tag: any) => tag.id.toString() === filterTag);
      
      return matchesSearch && matchesType && matchesCategory && matchesTag;
    });
  }, [materials, searchTerm, filterType, filterCategory, filterTag, shouldUseExternalPagination]);

  // 分页逻辑 - 仅在没有外部分页数据时使用
  const calculatedTotalPages = shouldUseExternalPagination ? totalPages : Math.ceil(filteredMaterials.length / pageSize);
  const calculatedTotalItems = shouldUseExternalPagination ? totalItems : filteredMaterials.length;
  
  const paginatedMaterials = useMemo(() => {
    if (shouldUseExternalPagination) {
      return materials; // 直接使用传入的材料数据
    }
    
    const startIndex = (currentPage - 1) * pageSize;
    return filteredMaterials.slice(startIndex, startIndex + pageSize);
  }, [filteredMaterials, currentPage, pageSize, shouldUseExternalPagination, materials]);

  return (
    <TabsContent value="materials" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>学习材料管理</CardTitle>
          <CardDescription>
            管理所有学习材料，包括视频、音频、文本和对话内容
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 搜索和筛选 */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="搜索材料标题、内容或源ID..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="类型" />
              </SelectTrigger>
              <SelectContent side="bottom" align="start" sideOffset={4}>
                <SelectItem value="all">所有类型</SelectItem>
                <SelectItem value="text">文本</SelectItem>
                <SelectItem value="video">视频</SelectItem>
                <SelectItem value="audio">音频</SelectItem>
                <SelectItem value="quiz">测验</SelectItem>
              </SelectContent>
            </Select>

            {/* 分类筛选 */}
            {categories && setFilterCategory && (
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="分类" />
                </SelectTrigger>
                <SelectContent side="bottom" align="start" sideOffset={4}>
                  <SelectItem value="all">所有分类</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* 标签筛选 */}
            {tags && setFilterTag && (
              <Select value={filterTag} onValueChange={setFilterTag}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="标签" />
                </SelectTrigger>
                <SelectContent side="bottom" align="start" sideOffset={4}>
                  <SelectItem value="all">所有标签</SelectItem>
                  {tags.slice(0, 20).map((tag) => (
                    <SelectItem key={tag.id} value={tag.id.toString()}>
                      {tag.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Button onClick={handleCreateContent}>
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
                <TableHead>标题与分类</TableHead>
                <TableHead>类型/长度</TableHead>
                <TableHead>内容预览</TableHead>
                <TableHead>媒体文件</TableHead>
                <TableHead className="w-32">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMaterials.map(material => (
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

          {/* 分页控制 */}
          <div className="mt-4">
            <PaginationControls
              currentPage={currentPage}
              totalPages={calculatedTotalPages}
              totalItems={calculatedTotalItems}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
});

OptimizedMaterialsTab.displayName = 'OptimizedMaterialsTab'; 