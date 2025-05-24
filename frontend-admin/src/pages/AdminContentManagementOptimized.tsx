import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useLocation } from 'react-router-dom';
import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';
import { 
  contentService, 
  type ContentStats, 
  type CourseProgressData, 
  type ContentTypeData, 
  type RecentActivity, 
  type Course, 
  type LearningMaterial, 
  type Vocabulary, 
  type Exercise,
  type CreateCourseData,
  type CreateMaterialData,
  type CreateVocabularyData,
  type CreateExerciseData
} from '@/services/contentService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {  BookOpen,  Plus,  Upload,  RefreshCw,  BarChart3,  Layers,  Target,  TrendingUp,  Volume2,  Link} from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import TopNavbar from '@/components/admin/TopNavbar';
import PageHeader from '@/components/admin/PageHeader';
import StatsCard from '@/components/admin/StatsCard';
import { OptimizedCoursesTab, OptimizedMaterialsTab } from '@/components/admin/OptimizedContentTabs';
import { OptimizedVocabularyTab, OptimizedExercisesTab } from '@/components/admin/VocabularyAndExerciseTabs';
import { 
  ContentTypeSelector, 
  CourseForm, 
  MaterialForm, 
  VocabularyForm, 
  ExerciseForm 
} from '@/components/admin/ContentFormComponents';
import BatchImportDialog from '@/components/admin/BatchImportDialog';import AudioFileManager from '@/components/admin/AudioFileManager';import AudioContentLinker from '@/components/admin/AudioContentLinker';

// 移除了占位符组件，现在使用完整功能的优化组件

const AdminContentManagementOptimized = () => {
  const { isCollapsed } = useSidebar();
  const { toast } = useToast();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  
  // 根据路径确定初始活动标签页
  const getInitialTab = useCallback(() => {
    const path = location.pathname;
    if (path.includes('/courses')) return 'courses';
    if (path.includes('/materials')) return 'materials';
    if (path.includes('/vocabulary')) return 'vocabulary';
    if (path.includes('/exercises')) return 'exercises';
    return 'overview';
  }, [location.pathname]);

  const [activeTab, setActiveTab] = useState(getInitialTab());

  // 监听路径变化，自动切换标签页
  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [getInitialTab]);

  // API数据状态
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [courseProgressData, setCourseProgressData] = useState<CourseProgressData[]>([]);
  const [contentTypeData, setContentTypeData] = useState<ContentTypeData[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  // 数据加载状态追踪
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set());
  const [tabLoading, setTabLoading] = useState<{[key: string]: boolean}>({});

  // 搜索和筛选状态
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  // 性能优化：防抖搜索
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // 搜索时重置到第一页
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 对话框状态
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [batchImportDialogOpen, setBatchImportDialogOpen] = useState(false);
  const [audioManagerOpen, setAudioManagerOpen] = useState(false);
  const [audioLinkerOpen, setAudioLinkerOpen] = useState(false);
  const [contentType, setContentType] = useState<'course' | 'material' | 'vocabulary' | 'exercise'>('course');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // 音频关联数据
  const [audioFiles, setAudioFiles] = useState<any[]>([]);
  const [loadingAudioFiles, setLoadingAudioFiles] = useState(false);

  // 表单状态
  const [courseForm, setCourseForm] = useState<CreateCourseData>({
    title: "",
    description: "",
    day_number: 1,
    difficulty: "beginner",
    tags: [],
    is_active: false
  });

  const [materialForm, setMaterialForm] = useState<CreateMaterialData>({
    course_id: 0,
    title: "",
    type: "text",
    content: "",
    media_url: "",
    duration_minutes: 0,
    metadata: {}
  });

  const [vocabularyForm, setVocabularyForm] = useState<CreateVocabularyData>({
    word: "",
    reading: "",
    meaning: "",
    part_of_speech: "",
    example_sentence: "",
    example_reading: "",
    example_meaning: "",
    jlpt_level: "N5",
    tags: []
  });

  const [exerciseForm, setExerciseForm] = useState<CreateExerciseData>({
    course_id: 0,
    title: "",
    type: "vocabulary",
    question: "",
    options: ["", "", "", ""],
    correct_answer: "",
    explanation: "",
    points: 10
  });

  // 加载概览数据（统计信息）
  const loadOverviewData = useCallback(async () => {
    if (loadedTabs.has('overview')) return;
    
    try {
      setTabLoading(prev => ({ ...prev, overview: true }));
      const statsResponse = await contentService.getStats();

      if (statsResponse.success) {
        setStats(statsResponse.data.stats);
        setCourseProgressData(statsResponse.data.course_progress_data);
        setContentTypeData(statsResponse.data.content_type_data);
        setRecentActivities(statsResponse.data.recent_activities);
        setLoadedTabs(prev => new Set(prev).add('overview'));
      }
    } catch (error) {
      console.error('Failed to load overview data:', error);
      toast({
        title: "加载失败",
        description: "无法加载概览数据，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setTabLoading(prev => ({ ...prev, overview: false }));
    }
  }, [loadedTabs, toast]);

  // 加载课程数据
  const loadCoursesData = useCallback(async () => {
    if (loadedTabs.has('courses')) return;
    
    try {
      setTabLoading(prev => ({ ...prev, courses: true }));
      const coursesResponse = await contentService.getCourses();

      if (coursesResponse.success) {
        setCourses(coursesResponse.data);
        setLoadedTabs(prev => new Set(prev).add('courses'));
      }
    } catch (error) {
      console.error('Failed to load courses data:', error);
      toast({
        title: "加载失败",
        description: "无法加载课程数据，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setTabLoading(prev => ({ ...prev, courses: false }));
    }
  }, [loadedTabs, toast]);

  // 加载学习材料数据
  const loadMaterialsData = useCallback(async () => {
    if (loadedTabs.has('materials')) return;
    
    try {
      setTabLoading(prev => ({ ...prev, materials: true }));
      const materialsResponse = await contentService.getMaterials();

      if (materialsResponse.success) {
        setMaterials(materialsResponse.data);
        setLoadedTabs(prev => new Set(prev).add('materials'));
      }
    } catch (error) {
      console.error('Failed to load materials data:', error);
      toast({
        title: "加载失败",
        description: "无法加载学习材料数据，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setTabLoading(prev => ({ ...prev, materials: false }));
    }
  }, [loadedTabs, toast]);

  // 加载词汇数据
  const loadVocabularyData = useCallback(async () => {
    if (loadedTabs.has('vocabulary')) return;
    
    try {
      setTabLoading(prev => ({ ...prev, vocabulary: true }));
      const vocabularyResponse = await contentService.getVocabulary();

      if (vocabularyResponse.success) {
        setVocabulary(vocabularyResponse.data);
        setLoadedTabs(prev => new Set(prev).add('vocabulary'));
      }
    } catch (error) {
      console.error('Failed to load vocabulary data:', error);
      toast({
        title: "加载失败",
        description: "无法加载词汇数据，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setTabLoading(prev => ({ ...prev, vocabulary: false }));
    }
  }, [loadedTabs, toast]);

  // 加载练习题数据
  const loadExercisesData = useCallback(async () => {
    if (loadedTabs.has('exercises')) return;
    
    try {
      setTabLoading(prev => ({ ...prev, exercises: true }));
      const exercisesResponse = await contentService.getExercises();

      if (exercisesResponse.success) {
        setExercises(exercisesResponse.data);
        setLoadedTabs(prev => new Set(prev).add('exercises'));
      }
    } catch (error) {
      console.error('Failed to load exercises data:', error);
      toast({
        title: "加载失败",
        description: "无法加载练习题数据，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setTabLoading(prev => ({ ...prev, exercises: false }));
    }
  }, [loadedTabs, toast]);

  // 根据标签页按需加载数据
  const loadTabData = useCallback(async (tab: string) => {
    switch (tab) {
      case 'overview':
        await loadOverviewData();
        break;
      case 'courses':
        await loadCoursesData();
        break;
      case 'materials':
        await loadMaterialsData();
        break;
      case 'vocabulary':
        await loadVocabularyData();
        break;
      case 'exercises':
        await loadExercisesData();
        break;
    }
  }, [loadOverviewData, loadCoursesData, loadMaterialsData, loadVocabularyData, loadExercisesData]);

  // 初始化时加载默认标签页数据
  useEffect(() => {
    setLoading(true);
    loadTabData(activeTab).finally(() => setLoading(false));
  }, [activeTab, loadTabData]);

  // 标签页切换时按需加载数据
  const handleTabChange = useCallback(async (tab: string) => {
    setActiveTab(tab);
    if (!loadedTabs.has(tab)) {
      await loadTabData(tab);
    }
  }, [loadedTabs, loadTabData]);

  // 重新加载数据（用于创建内容后刷新）
  const reloadCurrentTabData = useCallback(async () => {
    // 清除当前标签页的加载状态，强制重新加载
    setLoadedTabs(prev => {
      const newSet = new Set(prev);
      newSet.delete(activeTab);
      return newSet;
    });
    await loadTabData(activeTab);
  }, [activeTab, loadTabData]);

  // 工具函数
  const getContentTypeName = useCallback((type: string) => {
    const names = {
      course: '课程',
      material: '学习材料',
      vocabulary: '词汇',
      exercise: '练习题'
    };
    return names[type as keyof typeof names] || type;
  }, []);

  // 事件处理函数
  const handleCreateContent = useCallback((type: 'course' | 'material' | 'vocabulary' | 'exercise' = 'course') => {
    setContentType(type);
    setCreateDialogOpen(true);
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return;
    
    try {
      setUploading(true);
      const fileType = file.type.startsWith('video') ? 'video' : 
                      file.type.startsWith('audio') ? 'audio' : 'image';
      
      const result = await contentService.uploadFile(file, fileType);
      
      if (result.success && result.url) {
        setMaterialForm(prev => ({ ...prev, media_url: result.url! }));
        toast({
          title: "上传成功",
          description: "文件已成功上传",
        });
      } else {
        throw new Error(result.message || '上传失败');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "上传失败",
        description: "文件上传失败，请重试",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }, [toast]);

  const handleSaveContent = useCallback(async () => {
    try {
      setSaving(true);
      let result;

      switch (contentType) {
        case 'course':
          if (!courseForm.title || !courseForm.description) {
            throw new Error('请填写必要的课程信息');
          }
          result = await contentService.createCourse(courseForm);
          break;

        case 'material':
          if (!materialForm.title || !materialForm.content || !materialForm.course_id) {
            throw new Error('请填写必要的材料信息');
          }
          result = await contentService.createMaterial(materialForm);
          break;

        case 'vocabulary':
          if (!vocabularyForm.word || !vocabularyForm.reading || !vocabularyForm.meaning) {
            throw new Error('请填写必要的词汇信息');
          }
          result = await contentService.createVocabulary(vocabularyForm);
          break;

        case 'exercise':
          if (!exerciseForm.title || !exerciseForm.question || !exerciseForm.correct_answer) {
            throw new Error('请填写必要的练习题信息');
          }
          result = await contentService.createExercise(exerciseForm);
          break;

        default:
          throw new Error('未知的内容类型');
      }

      if (result && result.success) {
        toast({
          title: "创建成功",
          description: `${getContentTypeName(contentType)}已成功创建`,
        });
        setCreateDialogOpen(false);
        await reloadCurrentTabData();
      } else {
        throw new Error(result?.message || '创建失败');
      }
    } catch (error: any) {
      console.error('Save failed:', error);
      toast({
        title: "创建失败",
        description: error.message || "创建内容失败，请重试",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [contentType, courseForm, materialForm, vocabularyForm, exerciseForm, reloadCurrentTabData, toast, getContentTypeName]);

  // 表单更新处理函数
  const handleCourseFormChange = useCallback((field: keyof CreateCourseData, value: any) => {
    setCourseForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleMaterialFormChange = useCallback((field: keyof CreateMaterialData, value: any) => {
    setMaterialForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleVocabularyFormChange = useCallback((field: keyof CreateVocabularyData, value: any) => {
    setVocabularyForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleExerciseFormChange = useCallback((field: keyof CreateExerciseData, value: any) => {
    setExerciseForm(prev => ({ ...prev, [field]: value }));
  }, []);

  // 操作处理函数
  const handleEdit = useCallback((id: number) => {
    console.log('Edit:', id);
  }, []);

  const handleDelete = useCallback((id: number) => {
    console.log('Delete:', id);
  }, []);

  const handleView = useCallback((id: number) => {
    console.log('View:', id);
  }, []);

  // 批量导入处理函数
  const handleBatchImport = useCallback(() => {
    // 根据当前标签页确定导入类型
    let importType: 'course' | 'material' | 'vocabulary' | 'exercise';
    switch (activeTab) {
      case 'courses':
        importType = 'course';
        break;
      case 'materials':
        importType = 'material';
        break;
      case 'vocabulary':
        importType = 'vocabulary';
        break;
      case 'exercises':
        importType = 'exercise';
        break;
      default:
        importType = 'course';
    }
    setContentType(importType);
    setBatchImportDialogOpen(true);
  }, [activeTab]);

  const handleBatchImportComplete = useCallback(async () => {
    setBatchImportDialogOpen(false);
    await reloadCurrentTabData();
    toast({
      title: "导入完成",
      description: "数据已成功导入，页面数据已刷新",
    });
  }, [reloadCurrentTabData, toast]);

  // 音频管理处理函数
  const handleAudioManager = useCallback(() => {
    // 根据当前标签页确定音频类型
    let audioType: 'vocabulary' | 'course' | 'material' | 'exercise';
    switch (activeTab) {
      case 'courses':
        audioType = 'course';
        break;
      case 'materials':
        audioType = 'material';
        break;
      case 'vocabulary':
        audioType = 'vocabulary';
        break;
      case 'exercises':
        audioType = 'exercise';
        break;
      default:
        audioType = 'vocabulary';
    }
    setContentType(audioType);
    setAudioManagerOpen(true);
  }, [activeTab]);

  const handleAudioUploadComplete = useCallback(async (uploadedFiles: any[]) => {
    setAudioManagerOpen(false);
    // 这里可以处理上传完成的音频文件，比如更新关联数据
    toast({
      title: "音频上传完成",
      description: `成功上传 ${uploadedFiles.length} 个音频文件`,
    });
    await reloadCurrentTabData();
  }, [reloadCurrentTabData, toast]);

  // 获取关联数据用于音频文件关联
  const getAssociationData = useCallback(() => {
    switch (activeTab) {
      case 'courses':
        return courses.map(course => ({
          id: course.id,
          name: course.title,
          key: `day${course.day_number}`
        }));
      case 'materials':
        return materials.map(material => ({
          id: material.id,
          name: material.title,
          key: material.type
        }));
      case 'vocabulary':
        return vocabulary.map(vocab => ({
          id: vocab.id,
          name: vocab.word,
          key: vocab.reading
        }));
      case 'exercises':
        return exercises.map(exercise => ({
          id: exercise.id,
          name: exercise.title,
          key: exercise.type
        }));
      default:
        return [];
    }
  }, [activeTab, courses, materials, vocabulary, exercises]);

  // 获取当前内容项目数据用于音频关联
  const getCurrentContentItems = useCallback(() => {
    switch (activeTab) {
      case 'courses':
        return courses.map(course => ({
          id: course.id,
          title: course.title,
          type: 'course' as const,
          day_number: course.day_number,
          key: `day${course.day_number}`
        }));
      case 'materials':
        return materials.map(material => ({
          id: material.id,
          title: material.title,
          type: 'material' as const,
          key: material.type
        }));
      case 'vocabulary':
        return vocabulary.map(vocab => ({
          id: vocab.id,
          title: vocab.word,
          type: 'vocabulary' as const,
          jlpt_level: vocab.jlpt_level,
          key: vocab.reading
        }));
      case 'exercises':
        return exercises.map(exercise => ({
          id: exercise.id,
          title: exercise.title,
          type: 'exercise' as const,
          key: exercise.type
        }));
      default:
        return [];
    }
  }, [activeTab, courses, materials, vocabulary, exercises]);

  // 加载音频文件列表
  const loadAudioFiles = useCallback(async () => {
    try {
      setLoadingAudioFiles(true);
      const response = await contentService.getAudioFiles();
      if (response.success) {
        setAudioFiles(response.data);
      }
    } catch (error) {
      console.error('Failed to load audio files:', error);
      toast({
        title: "加载失败",
        description: "无法加载音频文件列表，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setLoadingAudioFiles(false);
    }
  }, [toast]);

  // 音频智能关联处理函数
  const handleAudioLinker = useCallback(async () => {
    // 首先加载音频文件
    await loadAudioFiles();
    
    // 根据当前标签页确定内容类型
    let linkType: 'vocabulary' | 'course' | 'material' | 'exercise';
    switch (activeTab) {
      case 'courses':
        linkType = 'course';
        break;
      case 'materials':
        linkType = 'material';
        break;
      case 'vocabulary':
        linkType = 'vocabulary';
        break;
      case 'exercises':
        linkType = 'exercise';
        break;
      default:
        linkType = 'vocabulary';
    }
    setContentType(linkType);
    setAudioLinkerOpen(true);
  }, [activeTab, loadAudioFiles]);

  const handleAudioLinkComplete = useCallback(async (linkedPairs: Array<{ audioId: number; contentId: number }>) => {
    setAudioLinkerOpen(false);
    // 处理关联完成后的逻辑，比如刷新数据
    toast({
      title: "关联完成",
      description: `成功关联 ${linkedPairs.length} 个音频文件`,
    });
    await reloadCurrentTabData();
  }, [reloadCurrentTabData, toast]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar activePath="/admin/content" />
        <div className={cn(
          "main-content flex-1 flex flex-col transition-all duration-300",
          isCollapsed && "collapsed"
        )}>
          <TopNavbar />
          <main className="flex-1 p-6 overflow-auto">
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar activePath="/admin/content" />
      <div className={cn(
        "main-content flex-1 flex flex-col transition-all duration-300",
        isCollapsed && "collapsed"
      )}>
        <TopNavbar />
        
        <main className="flex-1 p-6 overflow-auto">
          <PageHeader 
            title="内容管理" 
            description="管理90天日语学习课程、材料库和练习内容"
          >
            <Button onClick={() => handleCreateContent()} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              创建内容
            </Button>
            <Button variant="outline" onClick={handleBatchImport}>              <Upload className="h-4 w-4 mr-2" />              批量导入            </Button>            <Button variant="outline" onClick={handleAudioManager}>              <Volume2 className="h-4 w-4 mr-2" />              音频管理            </Button>            <Button variant="outline" onClick={handleAudioLinker}>              <Link className="h-4 w-4 mr-2" />              智能关联            </Button>
          </PageHeader>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">内容概览</TabsTrigger>
              <TabsTrigger value="courses">90天课程</TabsTrigger>
              <TabsTrigger value="materials">学习材料</TabsTrigger>
              <TabsTrigger value="vocabulary">词汇管理</TabsTrigger>
              <TabsTrigger value="exercises">练习题库</TabsTrigger>
            </TabsList>

            {/* 内容概览 */}
            <TabsContent value="overview" className="space-y-6">
              {tabLoading.overview ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">加载概览数据...</span>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <StatsCard
                    title="总课程数"
                    value={stats?.total_courses?.toString() || "0"}
                    icon={<BookOpen className="h-5 w-5" />}
                    trend={{ value: 8, isPositive: true }}
                  />
                  <StatsCard
                    title="学习材料"
                    value={stats?.total_materials?.toString() || "0"}
                    icon={<Layers className="h-5 w-5" />}
                    trend={{ value: 12, isPositive: true }}
                  />
                  <StatsCard
                    title="词汇总数"
                    value={stats?.total_vocabulary?.toString() || "0"}
                    icon={<Target className="h-5 w-5" />}
                    trend={{ value: 5, isPositive: true }}
                  />
                  <StatsCard
                    title="平均完成率"
                    value={`${stats?.average_completion || 0}%`}
                    icon={<TrendingUp className="h-5 w-5" />}
                    trend={{ value: 3.2, isPositive: true }}
                  />
                </div>
              )}
            </TabsContent>

            {/* 90天课程管理 - 使用优化组件 */}
            <TabsContent value="courses" className="space-y-6">
              {tabLoading.courses ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">加载课程数据...</span>
                </div>
              ) : (
                <OptimizedCoursesTab
                  courses={courses}
                  searchTerm={debouncedSearchTerm}
                  setSearchTerm={setSearchTerm}
                  filterStatus={filterStatus}
                  setFilterStatus={setFilterStatus}
                  filterLevel={filterLevel}
                  setFilterLevel={setFilterLevel}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  pageSize={pageSize}
                  handleCreateContent={handleCreateContent}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                  handleView={handleView}
                />
              )}
            </TabsContent>

            {/* 学习材料管理 - 使用优化组件 */}
            <TabsContent value="materials" className="space-y-6">
              {tabLoading.materials ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">加载学习材料数据...</span>
                </div>
              ) : (
                <OptimizedMaterialsTab
                  materials={materials}
                  searchTerm={debouncedSearchTerm}
                  setSearchTerm={setSearchTerm}
                  filterType={filterType}
                  setFilterType={setFilterType}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  pageSize={pageSize}
                  handleCreateContent={handleCreateContent}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                  handleView={handleView}
                />
              )}
            </TabsContent>

            {/* 词汇管理 - 使用优化组件 */}
            {tabLoading.vocabulary ? (
              <TabsContent value="vocabulary" className="space-y-6">
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">加载词汇数据...</span>
                </div>
              </TabsContent>
            ) : (
              <OptimizedVocabularyTab
                vocabulary={vocabulary}
                searchTerm={debouncedSearchTerm}
                setSearchTerm={setSearchTerm}
                filterLevel={filterLevel}
                setFilterLevel={setFilterLevel}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                pageSize={pageSize}
                handleCreateContent={handleCreateContent}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                handleView={handleView}
              />
            )}

            {/* 练习题库 - 使用优化组件 */}
            {tabLoading.exercises ? (
              <TabsContent value="exercises" className="space-y-6">
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">加载练习题数据...</span>
                </div>
              </TabsContent>
            ) : (
              <OptimizedExercisesTab
                exercises={exercises}
                searchTerm={debouncedSearchTerm}
                setSearchTerm={setSearchTerm}
                filterType={filterType}
                setFilterType={setFilterType}
                filterLevel={filterLevel}
                setFilterLevel={setFilterLevel}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                pageSize={pageSize}
                handleCreateContent={handleCreateContent}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                handleView={handleView}
              />
            )}
          </Tabs>

          {/* 创建内容对话框 */}
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>创建新{getContentTypeName(contentType)}</DialogTitle>
                <DialogDescription>
                  填写{getContentTypeName(contentType)}的相关信息
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <ContentTypeSelector 
                  contentType={contentType} 
                  onTypeChange={setContentType} 
                />

                {contentType === 'course' && (
                  <CourseForm 
                    form={courseForm}
                    onChange={handleCourseFormChange}
                  />
                )}

                {contentType === 'material' && (
                  <MaterialForm 
                    form={materialForm}
                    courses={courses}
                    uploading={uploading}
                    onChange={handleMaterialFormChange}
                    onFileUpload={handleFileUpload}
                  />
                )}

                {contentType === 'vocabulary' && (
                  <VocabularyForm 
                    form={vocabularyForm}
                    onChange={handleVocabularyFormChange}
                  />
                )}

                {contentType === 'exercise' && (
                  <ExerciseForm 
                    form={exerciseForm}
                    courses={courses}
                    onChange={handleExerciseFormChange}
                  />
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleSaveContent} disabled={saving}>
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      创建中...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      创建{getContentTypeName(contentType)}
                    </>
                  )}
                </Button>
              </DialogFooter>            </DialogContent>          </Dialog>          {/* 批量导入对话框 */}          <BatchImportDialog            open={batchImportDialogOpen}            onOpenChange={setBatchImportDialogOpen}            contentType={contentType}            onImportComplete={handleBatchImportComplete}          />          {/* 音频文件管理器 */}          <AudioFileManager            open={audioManagerOpen}            onOpenChange={setAudioManagerOpen}            contentType={contentType}            associationData={getAssociationData()}            onComplete={handleAudioUploadComplete}          />          {/* 音频内容智能关联器 */}          <AudioContentLinker            open={audioLinkerOpen}            onOpenChange={setAudioLinkerOpen}            contentType={contentType}            audioFiles={audioFiles}            contentItems={getCurrentContentItems()}            onLinkComplete={handleAudioLinkComplete}          />        </main>      </div>    </div>  );};export default AdminContentManagementOptimized; 