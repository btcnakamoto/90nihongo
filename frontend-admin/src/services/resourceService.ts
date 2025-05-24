import { apiClient } from './apiClient';

export interface ResourceItem {
  id: string;
  name: string;
  type: 'course' | 'material' | 'vocabulary' | 'audio' | 'video';
  source: string;
  status: 'pending' | 'downloading' | 'processing' | 'completed' | 'error';
  progress?: number;
  content?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
  size?: string;
  count?: number;
  error?: string;
}

export interface ImportTask {
  id: string;
  type: 'web-scraping' | 'file-upload' | 'api-import' | 'batch-process';
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  progress: number;
  total_items: number;
  items_processed: number;
  config?: any;
  logs: string[];
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
}

export interface ResourceStats {
  total_resources: number;
  completed_resources: number;
  failed_resources: number;
  active_tasks: number;
  total_size: string;
  success_rate: number;
  resource_by_type: {
    course: number;
    material: number;
    vocabulary: number;
    audio: number;
    video: number;
  };
  recent_activities: Array<{
    id: string;
    action: string;
    resource_name: string;
    created_at: string;
  }>;
}

export interface WebScrapingConfig {
  urls: string;
  max_pages: number;
  content_type: 'course' | 'material' | 'vocabulary' | 'news';
  delay_ms: number;
  include_images: boolean;
  include_audio: boolean;
}

export interface ApiImportConfig {
  endpoint: string;
  api_key: string;
  format: 'json' | 'xml' | 'csv';
  batch_size: number;
  content_type: string;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: PaginationMeta;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  errors?: any;
}

class ResourceService {
  private baseUrl = '/api/admin/resources';

  /**
   * 获取资源列表
   */
  async getResources(page = 1, perPage = 15): Promise<PaginatedResponse<ResourceItem>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<ResourceItem>>>(
      `${this.baseUrl}?page=${page}&per_page=${perPage}`
    );
    
    if (response.data.status === 'error') {
      throw new Error(response.data.message || '获取资源列表失败');
    }
    
    return response.data.data!;
  }

  /**
   * 获取资源统计信息
   */
  async getStats(): Promise<ResourceStats> {
    const response = await apiClient.get<ApiResponse<ResourceStats>>(`${this.baseUrl}/stats`);
    
    if (response.data.status === 'error') {
      throw new Error(response.data.message || '获取统计信息失败');
    }
    
    return response.data.data!;
  }

  /**
   * 获取导入任务列表
   */
  async getTasks(page = 1, perPage = 15): Promise<PaginatedResponse<ImportTask>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<ImportTask>>>(
      `${this.baseUrl}/tasks?page=${page}&per_page=${perPage}`
    );
    
    if (response.data.status === 'error') {
      throw new Error(response.data.message || '获取任务列表失败');
    }
    
    return response.data.data!;
  }

  /**
   * 获取任务详情
   */
  async getTaskDetail(taskId: string): Promise<ImportTask> {
    const response = await apiClient.get<ApiResponse<ImportTask>>(`${this.baseUrl}/tasks/${taskId}`);
    
    if (response.data.status === 'error') {
      throw new Error(response.data.message || '获取任务详情失败');
    }
    
    return response.data.data!;
  }

  /**
   * 启动网页抓取任务
   */
  async startWebScraping(config: WebScrapingConfig): Promise<ImportTask> {
    const response = await apiClient.post<ApiResponse<ImportTask>>(
      `${this.baseUrl}/web-scraping`,
      config
    );
    
    if (response.data.status === 'error') {
      throw new Error(response.data.message || '启动抓取任务失败');
    }
    
    return response.data.data!;
  }

  /**
   * 文件上传
   */
  async uploadFiles(files: FileList): Promise<ImportTask> {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files[]', file);
    });

    const response = await apiClient.post<ApiResponse<ImportTask>>(
      `${this.baseUrl}/file-upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    if (response.data.status === 'error') {
      throw new Error(response.data.message || '文件上传失败');
    }
    
    return response.data.data!;
  }

  /**
   * 启动API导入任务
   */
  async startApiImport(config: ApiImportConfig): Promise<ImportTask> {
    const response = await apiClient.post<ApiResponse<ImportTask>>(
      `${this.baseUrl}/api-import`,
      config
    );
    
    if (response.data.status === 'error') {
      throw new Error(response.data.message || '启动API导入失败');
    }
    
    return response.data.data!;
  }

  /**
   * 暂停/恢复任务
   */
  async toggleTask(taskId: string): Promise<ImportTask> {
    const response = await apiClient.patch<ApiResponse<ImportTask>>(
      `${this.baseUrl}/tasks/${taskId}/toggle`
    );
    
    if (response.data.status === 'error') {
      throw new Error(response.data.message || '操作任务失败');
    }
    
    return response.data.data!;
  }

  /**
   * 取消/删除任务
   */
  async cancelTask(taskId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(
      `${this.baseUrl}/tasks/${taskId}`
    );
    
    if (response.data.status === 'error') {
      throw new Error(response.data.message || '取消任务失败');
    }
  }

  /**
   * 删除资源
   */
  async deleteResource(resourceId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(
      `${this.baseUrl}/${resourceId}`
    );
    
    if (response.data.status === 'error') {
      throw new Error(response.data.message || '删除资源失败');
    }
  }

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 格式化时间差
   */
  formatTimeDiff(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 30) return `${diffDays}天前`;
    
    return date.toLocaleDateString();
  }

  /**
   * 获取状态显示文本
   */
  getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      pending: '等待中',
      running: '运行中',
      downloading: '下载中',
      processing: '处理中',
      completed: '已完成',
      failed: '失败',
      error: '错误',
      paused: '已暂停'
    };
    
    return statusMap[status] || status;
  }

  /**
   * 获取类型显示文本
   */
  getTypeText(type: string): string {
    const typeMap: Record<string, string> = {
      course: '课程',
      material: '教材',
      vocabulary: '词汇',
      audio: '音频',
      video: '视频',
      'web-scraping': '网页抓取',
      'file-upload': '文件上传',
      'api-import': 'API导入',
      'batch-process': '批量处理'
    };
    
    return typeMap[type] || type;
  }
}

export const resourceService = new ResourceService();
export default resourceService; 