import { apiClient as api } from './apiClient';

// 学习材料相关接口定义
export interface MaterialStats {
  total_materials: number;
  video_count: number;
  audio_count: number;
  text_count: number;
  quiz_count: number;
  material_trends: MaterialTrend[];
  materials_by_course: MaterialByCourse[];
  type_distribution: TypeDistribution[];
}

export interface MaterialTrend {
  date: string;
  count: number;
}

export interface MaterialByCourse {
  day_number: number;
  title: string;
  material_count: number;
}

export interface TypeDistribution {
  name: string;
  value: number;
  color: string;
}

export interface LearningMaterial {
  id: number;
  title: string;
  type: 'video' | 'audio' | 'text' | 'quiz';
  course_id: number;
  course_title: string;
  course_day: number;
  content: string;
  media_url?: string;
  duration: number;
  duration_formatted: string;
  size: string;
  status: 'active' | 'inactive' | 'pending';
  views: number;
  rating: number;
  downloads: number;
  file_type: string;
  created_at: string;
  updated_at: string;
}

export interface MaterialDetail extends LearningMaterial {
  metadata: Record<string, any>;
}

export interface Course {
  id: number;
  title: string;
  day_number: number;
}

export interface MaterialFilters {
  search?: string;
  type?: string;
  course_id?: string;
  status?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface MaterialsResponse {
  success: boolean;
  data: LearningMaterial[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  stats: MaterialStats;
  courses: Course[];
  filter_options: {
    types: string[];
    statuses: string[];
  };
}

export interface BatchOperationRequest {
  action: 'delete' | 'activate' | 'deactivate' | 'move';
  material_ids: number[];
  target_course_id?: number;
}

export interface BatchOperationResponse {
  success: boolean;
  message: string;
  affected_count: number;
}

export const materialService = {
  /**
   * 获取学习材料列表（带筛选和分页）
   */
  async getMaterials(filters: MaterialFilters = {}): Promise<MaterialsResponse> {
    const response = await api.get('/admin/materials', { params: filters });
    return response.data;
  },

  /**
   * 获取学习材料统计数据
   */
  async getMaterialStats(): Promise<{ success: boolean; data: MaterialStats }> {
    const response = await api.get('/admin/materials/stats');
    return response.data;
  },

  /**
   * 获取学习材料详情
   */
  async getMaterialDetail(id: number): Promise<{ success: boolean; data: MaterialDetail }> {
    const response = await api.get(`/admin/materials/${id}`);
    return response.data;
  },

  /**
   * 批量操作学习材料
   */
  async batchOperation(request: BatchOperationRequest): Promise<BatchOperationResponse> {
    const response = await api.post('/admin/materials/batch-operation', request);
    return response.data;
  },

  /**
   * 获取初期化数据（包含材料列表、统计数据、课程列表等）
   */
  async getInitialData(filters: MaterialFilters = {}): Promise<MaterialsResponse> {
    // 这个方法直接调用getMaterials，因为后端已经返回了所有需要的数据
    return this.getMaterials(filters);
  },

  /**
   * 搜索学习材料
   */
  async searchMaterials(searchTerm: string, filters: Omit<MaterialFilters, 'search'> = {}): Promise<MaterialsResponse> {
    return this.getMaterials({ ...filters, search: searchTerm });
  },

  /**
   * 按类型筛选学习材料
   */
  async filterByType(type: string, filters: Omit<MaterialFilters, 'type'> = {}): Promise<MaterialsResponse> {
    return this.getMaterials({ ...filters, type });
  },

  /**
   * 按课程筛选学习材料
   */
  async filterByCourse(courseId: string, filters: Omit<MaterialFilters, 'course_id'> = {}): Promise<MaterialsResponse> {
    return this.getMaterials({ ...filters, course_id: courseId });
  },

  /**
   * 按状态筛选学习材料
   */
  async filterByStatus(status: string, filters: Omit<MaterialFilters, 'status'> = {}): Promise<MaterialsResponse> {
    return this.getMaterials({ ...filters, status });
  },

  /**
   * 排序学习材料
   */
  async sortMaterials(
    sortBy: string, 
    sortOrder: 'asc' | 'desc' = 'desc', 
    filters: Omit<MaterialFilters, 'sort_by' | 'sort_order'> = {}
  ): Promise<MaterialsResponse> {
    return this.getMaterials({ ...filters, sort_by: sortBy, sort_order: sortOrder });
  },

  /**
   * 分页获取学习材料
   */
  async getMaterialsPage(
    page: number, 
    perPage: number = 20, 
    filters: Omit<MaterialFilters, 'page' | 'per_page'> = {}
  ): Promise<MaterialsResponse> {
    return this.getMaterials({ ...filters, page, per_page: perPage });
  },

  /**
   * 删除单个学习材料
   */
  async deleteMaterial(id: number): Promise<BatchOperationResponse> {
    return this.batchOperation({
      action: 'delete',
      material_ids: [id]
    });
  },

  /**
   * 移动学习材料到其他课程
   */
  async moveMaterial(id: number, targetCourseId: number): Promise<BatchOperationResponse> {
    return this.batchOperation({
      action: 'move',
      material_ids: [id],
      target_course_id: targetCourseId
    });
  },

  /**
   * 批量删除学习材料
   */
  async deleteMaterials(ids: number[]): Promise<BatchOperationResponse> {
    return this.batchOperation({
      action: 'delete',
      material_ids: ids
    });
  },

  /**
   * 批量移动学习材料
   */
  async moveMaterials(ids: number[], targetCourseId: number): Promise<BatchOperationResponse> {
    return this.batchOperation({
      action: 'move',
      material_ids: ids,
      target_course_id: targetCourseId
    });
  }
}; 