import { apiClient as api } from './apiClient';

export interface ContentStats {
  total_courses: number;
  published_courses: number;
  total_materials: number;
  total_vocabulary: number;
  total_exercises: number;
  average_completion: number;
  user_satisfaction: number;
  content_usage: number;
}

export interface CourseProgressData {
  day: number;
  title: string;
  completion: number;
  feedback: number;
  materials_count: number;
  exercises_count: number;
}

export interface ContentTypeData {
  name: string;
  value: number;
  color: string;
}

export interface RecentActivity {
  id: number;
  title: string;
  day_number: number;
  status: string;
  last_updated: string;
  materials_count: number;
}

export interface Course {
  id: number;
  title: string;
  day_number: number;
  difficulty: string;
  status: string;
  materials_count: number;
  completion_rate: number;
  user_feedback: number;
  last_updated: string;
}

// 课程详情接口
export interface CourseDetail {
  id: number;
  title: string;
  description: string;
  day_number: number;
  difficulty: string;
  status: string;
  tags: string[];
  is_active: boolean;
  materials_count: number;
  exercises_count: number;
  completion_rate: number;
  user_feedback: number;
  created_at: string;
  updated_at: string;
  last_updated: string;
  materials: LearningMaterial[];
  exercises: Exercise[];
  user_progress: {
    total_users: number;
    completed_users: number;
    in_progress_users: number;
    not_started_users: number;
  };
  analytics: {
    daily_views: number;
    weekly_views: number;
    monthly_views: number;
    avg_time_spent: number;
    bounce_rate: number;
  };
}

export interface LearningMaterial {
  id: number;
  title: string;
  type: string;
  course_day: number;
  duration: number;
  size: string;
  status: string;
  views: number;
  rating: number;
  created_at: string;
}

export interface Vocabulary {
  id: number;
  word: string;
  reading: string;
  meaning: string;
  jlpt_level: string;
  part_of_speech: string;
  example_sentence: string;
  mastery_rate: number;
  created_at: string;
}

export interface Exercise {
  id: number;
  title: string;
  type: string;
  course_day: number;
  difficulty: string;
  completion_rate: number;
  average_score: number;
  created_at: string;
}

// 创建内容的表单数据接口
export interface CreateCourseData {
  title: string;
  description: string;
  day_number: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  is_active?: boolean;
}

export interface CreateMaterialData {
  course_id: number;
  title: string;
  type: 'video' | 'audio' | 'text' | 'quiz';
  content: string;
  media_url?: string;
  duration_minutes?: number;
  metadata?: Record<string, any>;
}

export interface CreateVocabularyData {
  word: string;
  reading: string;
  meaning: string;
  part_of_speech: string;
  example_sentence?: string;
  example_reading?: string;
  example_meaning?: string;
  jlpt_level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  tags?: string[];
}

export interface CreateExerciseData {
  course_id: number;
  title: string;
  type: 'listening' | 'speaking' | 'grammar' | 'vocabulary';
  question: string;
  options?: string[];
  correct_answer: string;
  explanation?: string;
  points?: number;
}

export interface ContentStatsResponse {
  success: boolean;
  data: {
    stats: ContentStats;
    course_progress_data: CourseProgressData[];
    content_type_data: ContentTypeData[];
    recent_activities: RecentActivity[];
    difficulty_stats: Record<string, number>;
    jlpt_stats: Record<string, number>;
  };
}

export const contentService = {
  // 获取内容统计数据
  async getStats(): Promise<ContentStatsResponse> {
    const response = await api.get('/admin/content/stats');
    return response.data;
  },

  // 获取课程列表
  async getCourses(params?: {
    search?: string;
    status?: string;
    difficulty?: string;
  }): Promise<{ success: boolean; data: Course[] }> {
    const response = await api.get('/admin/content/courses', { params });
    return response.data;
  },

  // 获取课程详情
  async getCourseDetail(id: number): Promise<{ success: boolean; data: CourseDetail }> {
    const response = await api.get(`/admin/content/courses/${id}`);
    return response.data;
  },

  // 获取学习材料列表
  async getMaterials(): Promise<{ success: boolean; data: LearningMaterial[] }> {
    const response = await api.get('/admin/content/materials');
    return response.data;
  },

  // 获取词汇列表
  async getVocabulary(): Promise<{ success: boolean; data: Vocabulary[] }> {
    const response = await api.get('/admin/content/vocabulary');
    return response.data;
  },

  // 获取练习题列表
  async getExercises(): Promise<{ success: boolean; data: Exercise[] }> {
    const response = await api.get('/admin/content/exercises');
    return response.data;
  },

  // 创建课程
  async createCourse(data: CreateCourseData): Promise<{ success: boolean; data?: Course; message?: string }> {
    const response = await api.post('/admin/content/courses', data);
    return response.data;
  },

  // 创建学习材料
  async createMaterial(data: CreateMaterialData): Promise<{ success: boolean; data?: LearningMaterial; message?: string }> {
    const response = await api.post('/admin/content/materials', data);
    return response.data;
  },

  // 创建词汇
  async createVocabulary(data: CreateVocabularyData): Promise<{ success: boolean; data?: Vocabulary; message?: string }> {
    const response = await api.post('/admin/content/vocabulary', data);
    return response.data;
  },

  // 创建练习题
  async createExercise(data: CreateExerciseData): Promise<{ success: boolean; data?: Exercise; message?: string }> {
    const response = await api.post('/admin/content/exercises', data);
    return response.data;
  },

  // 上传文件
  async uploadFile(file: File, type: 'video' | 'audio' | 'image'): Promise<{ success: boolean; url?: string; message?: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const response = await api.post('/admin/content/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 批量创建内容
  async batchCreate(contentType: 'course' | 'material' | 'vocabulary' | 'exercise', data: any[]): Promise<{ success: boolean; message?: string; data?: any }> {
    const response = await api.post(`/admin/content/batch/${contentType}`, { data });
    return response.data;
  },

  // 批量删除内容
  async batchDelete(contentType: 'course' | 'material' | 'vocabulary' | 'exercise', ids: number[]): Promise<{ success: boolean; message?: string; deleted_count?: number }> {
    const response = await api.delete(`/admin/content/batch/${contentType}`, { data: { ids } });
    return response.data;
  },

  // 导出数据
  async exportData(contentType: 'course' | 'material' | 'vocabulary' | 'exercise'): Promise<Blob> {
    const response = await api.get(`/admin/content/export/${contentType}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};