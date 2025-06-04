import { apiClient as api } from './apiClient';
import axios from 'axios';

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

// 新增分类和标签接口
export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id?: number;
  level: number;
  sort_order: number;
  is_active: boolean;
  children?: Category[];
  materials_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  usage_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LearningMaterialWithCategories extends LearningMaterial {
  categories?: Category[];
  tags?: Tag[];
  content_length?: string;
  content_style?: string;
  source_id?: string;
  source_type?: string;
  dialogue?: {
    id: number;
    title?: string;
    scenario?: string;
    participant_count: number;
    difficulty_level: string;
    lines?: {
      id: number;
      speaker: string;
      line_order: number;
      japanese_text: string;
      chinese_text: string;
      audio_url?: string;
    }[];
  };
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
    const response = await api.get('/api/admin/content/stats');
    return response.data;
  },

  // 获取课程列表
  async getCourses(params?: {
    search?: string;
    status?: string;
    difficulty?: string;
  }): Promise<{ success: boolean; data: Course[] }> {
    const response = await api.get('/api/admin/content/courses', { params });
    return response.data;
  },

  // 获取课程详情
  async getCourseDetail(id: number): Promise<{ success: boolean; data: CourseDetail }> {
    const response = await api.get(`/api/admin/content/courses/${id}`);
    return response.data;
  },

  // 获取学习材料列表
  async getMaterials(): Promise<{ success: boolean; data: LearningMaterial[] }> {
    const response = await api.get('/api/admin/content/materials');
    return response.data;
  },

  // 获取词汇列表
  async getVocabulary(): Promise<{ success: boolean; data: Vocabulary[] }> {
    const response = await api.get('/api/admin/content/vocabulary');
    return response.data;
  },

  // 获取练习题列表
  async getExercises(): Promise<{ success: boolean; data: Exercise[] }> {
    const response = await api.get('/api/admin/content/exercises');
    return response.data;
  },

  // 创建课程
  async createCourse(data: CreateCourseData): Promise<{ success: boolean; data?: Course; message?: string }> {
    const response = await api.post('/api/admin/content/courses', data);
    return response.data;
  },

  // 创建学习材料
  async createMaterial(data: CreateMaterialData): Promise<{ success: boolean; data?: LearningMaterial; message?: string }> {
    const response = await api.post('/api/admin/content/materials', data);
    return response.data;
  },

  // 创建词汇
  async createVocabulary(data: CreateVocabularyData): Promise<{ success: boolean; data?: Vocabulary; message?: string }> {
    const response = await api.post('/api/admin/content/vocabulary', data);
    return response.data;
  },

  // 创建练习题
  async createExercise(data: CreateExerciseData): Promise<{ success: boolean; data?: Exercise; message?: string }> {
    const response = await api.post('/api/admin/content/exercises', data);
    return response.data;
  },

  // 上传文件
  async uploadFile(file: File, type: 'video' | 'audio' | 'image'): Promise<{ success: boolean; url?: string; message?: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const response = await api.post('/api/admin/content/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 批量创建内容
  async batchCreate(contentType: 'course' | 'material' | 'vocabulary' | 'exercise' | 'sentence', data: any[]): Promise<{ success: boolean; message?: string; data?: any }> {
    const response = await api.post(`/api/admin/content/batch/${contentType}`, { data });
    return response.data;
  },

  // 批量删除内容
  async batchDelete(contentType: 'course' | 'material' | 'vocabulary' | 'exercise' | 'sentence', ids: number[]): Promise<{ success: boolean; message?: string; deleted_count?: number }> {
    const response = await api.delete(`/api/admin/content/batch/${contentType}`, { data: { ids } });
    return response.data;
  },

  // 导出数据
  async exportData(contentType: 'course' | 'material' | 'vocabulary' | 'exercise' | 'sentence'): Promise<Blob> {
    const response = await api.get(`/api/admin/content/export/${contentType}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // 音频文件关联到内容
  async linkAudioToContent(audioId: number, contentId: number, contentType: string): Promise<{ success: boolean; message?: string }> {
    const response = await api.post('/api/admin/content/link-audio', {
      audio_id: audioId,
      content_id: contentId,
      content_type: contentType
    });
    return response.data;
  },

  // 获取音频文件列表
  async getAudioFiles(): Promise<{ success: boolean; data: any[] }> {
    const response = await api.get('/api/admin/content/audio-files');
    return response.data;
  },

  // 获取内容关联的音频文件
  async getContentAudio(contentId: number, contentType: string): Promise<{ success: boolean; data: any }> {
    const response = await api.get(`/api/admin/content/${contentType}/${contentId}/audio`);
    return response.data;
  },

  // 分类相关API
  async getCategories(params?: {
    search?: string;
    level?: number;
    status?: string;
    parent_id?: number | string;
    sort_by?: string;
    sort_direction?: string;
    per_page?: number | string;
  }): Promise<{ success: boolean; data: Category[] }> {
    try {
      const response = await api.get('/api/admin/categories', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { success: false, data: [] };
    }
  },

  async getCategory(id: number): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await api.get(`/api/admin/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching category:', error);
      return { success: false, message: '获取分类详情失败' };
    }
  },

  async createCategory(data: { 
    name: string; 
    parent_id?: number; 
    sort_order?: number;
    is_active?: boolean;
  }): Promise<{ success: boolean; data?: Category; message?: string }> {
    try {
      const response = await api.post('/api/admin/categories', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating category:', error);
      const message = error.response?.data?.message || '创建分类失败';
      return { success: false, message };
    }
  },

  async updateCategory(id: number, data: Partial<Category>): Promise<{ success: boolean; data?: Category; message?: string }> {
    try {
      const response = await api.put(`/api/admin/categories/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating category:', error);
      const message = error.response?.data?.message || '更新分类失败';
      return { success: false, message };
    }
  },

  async deleteCategory(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await api.delete(`/api/admin/categories/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting category:', error);
      const message = error.response?.data?.message || '删除分类失败';
      return { success: false, message };
    }
  },

  async getCategoryStats(): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await api.get('/api/admin/categories/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching category stats:', error);
      return { success: false, message: '获取统计信息失败' };
    }
  },

  async getCategoryTree(): Promise<{ success: boolean; data?: Category[]; message?: string }> {
    try {
      const response = await api.get('/api/admin/categories/tree');
      return response.data;
    } catch (error) {
      console.error('Error fetching category tree:', error);
      return { success: false, message: '获取分类树失败' };
    }
  },

  async batchActionCategories(action: 'activate' | 'deactivate' | 'delete', ids: number[]): Promise<{ success: boolean; message?: string; affected_count?: number }> {
    try {
      const response = await api.post('/api/admin/categories/batch-action', { action, ids });
      return response.data;
    } catch (error: any) {
      console.error('Error with batch action:', error);
      const message = error.response?.data?.message || '批量操作失败';
      return { success: false, message };
    }
  },

  // 标签相关API
  async getTags(params?: {
    search?: string;
    status?: string;
    sort_by?: string;
    sort_direction?: string;
    per_page?: number | string;
  }): Promise<{ success: boolean; data: Tag[] }> {
    try {
      const response = await api.get('/api/admin/tags', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching tags:', error);
      return { success: false, data: [] };
    }
  },

  async getTag(id: number): Promise<{ success: boolean; data?: Tag; message?: string }> {
    try {
      const response = await api.get(`/api/admin/tags/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tag:', error);
      return { success: false, message: '获取标签详情失败' };
    }
  },

  async createTag(data: { name: string; description?: string; is_active?: boolean }): Promise<{ success: boolean; data?: Tag; message?: string }> {
    try {
      const response = await api.post('/api/admin/tags', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating tag:', error);
      const message = error.response?.data?.message || '创建标签失败';
      return { success: false, message };
    }
  },

  async updateTag(id: number, data: Partial<Tag>): Promise<{ success: boolean; data?: Tag; message?: string }> {
    try {
      const response = await api.put(`/api/admin/tags/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating tag:', error);
      const message = error.response?.data?.message || '更新标签失败';
      return { success: false, message };
    }
  },

  async deleteTag(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await api.delete(`/api/admin/tags/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting tag:', error);
      const message = error.response?.data?.message || '删除标签失败';
      return { success: false, message };
    }
  },

  async getTagStats(): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await api.get('/api/admin/tags/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching tag stats:', error);
      return { success: false, message: '获取统计信息失败' };
    }
  },

  async getPopularTags(): Promise<{ success: boolean; data?: Tag[]; message?: string }> {
    try {
      const response = await api.get('/api/admin/tags/popular');
      return response.data;
    } catch (error) {
      console.error('Error fetching popular tags:', error);
      return { success: false, message: '获取热门标签失败' };
    }
  },

  async batchActionTags(action: 'activate' | 'deactivate' | 'delete', ids: number[]): Promise<{ success: boolean; message?: string; affected_count?: number }> {
    try {
      const response = await api.post('/api/admin/tags/batch-action', { action, ids });
      return response.data;
    } catch (error: any) {
      console.error('Error with batch action:', error);
      const message = error.response?.data?.message || '批量操作失败';
      return { success: false, message };
    }
  },

  // 获取带分类的材料
  async getMaterialsWithCategories(params?: {
    search?: string;
    type?: string;
    category?: string;
    tag?: string;
    include?: string;
  }): Promise<{ success: boolean; data: LearningMaterialWithCategories[] }> {
    try {
      const response = await api.get('/api/admin/materials', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching materials with categories:', error);
      return { success: false, data: [] };
    }
  }
};