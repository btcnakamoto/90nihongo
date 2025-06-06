/**
 * 功能描述：系统设置服务
 * 输入参数：各种设置相关的API请求参数
 * 返回值：设置数据和操作结果
 * 用途说明：处理系统设置的获取、更新等操作
 * 作者：nakamotochen
 * 创建时间：2024-12-19
 */

import apiClient from './apiClient';

// 设置项类型定义
export interface SettingItem {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'select' | 'json';
  label: string;
  description?: string;
  options?: { label: string; value: any }[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
}

// 设置组类型定义
export interface SettingsGroup {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  settings: SettingItem[];
}

// 所有设置类型定义
export interface AllSettings {
  [groupId: string]: SettingsGroup;
}

// 设置更新请求类型
export interface SettingUpdateRequest {
  key: string;
  value: any;
  group?: string;
}

// 设置服务类
class SettingsService {
  private baseUrl = '/api/admin/settings';

  /**
   * 获取所有设置
   */
  async getAllSettings(): Promise<AllSettings> {
    try {
      const response = await apiClient.get(`${this.baseUrl}`);
      return response.data.data || this.getDefaultSettings();
    } catch (error) {
      console.warn('Failed to fetch settings from API, using defaults:', error);
      return this.getDefaultSettings();
    }
  }

  /**
   * 获取特定组的设置
   */
  async getSettingsGroup(groupId: string): Promise<SettingsGroup> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/groups/${groupId}`);
      return response.data.data;
    } catch (error) {
      console.warn(`Failed to fetch settings group ${groupId}, using defaults:`, error);
      const defaultSettings = this.getDefaultSettings();
      return defaultSettings[groupId] || this.getEmptyGroup(groupId);
    }
  }

  /**
   * 更新单个设置
   */
  async updateSetting(key: string, value: any, group?: string): Promise<boolean> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${key}`, {
        value,
        group
      });
      return response.data.success;
    } catch (error) {
      console.error('Failed to update setting:', error);
      throw error;
    }
  }

  /**
   * 批量更新设置
   */
  async updateSettings(updates: SettingUpdateRequest[]): Promise<boolean> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/batch`, {
        updates
      });
      return response.data.success;
    } catch (error) {
      console.error('Failed to batch update settings:', error);
      throw error;
    }
  }

  /**
   * 重置设置组到默认值
   */
  async resetSettingsGroup(groupId: string): Promise<boolean> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/groups/${groupId}/reset`);
      return response.data.success;
    } catch (error) {
      console.error('Failed to reset settings group:', error);
      throw error;
    }
  }

  /**
   * 导出设置
   */
  async exportSettings(): Promise<Blob> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/export`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to export settings:', error);
      throw error;
    }
  }

  /**
   * 导入设置
   */
  async importSettings(file: File): Promise<boolean> {
    try {
      const formData = new FormData();
      formData.append('settings_file', file);
      
      const response = await apiClient.post(`${this.baseUrl}/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.success;
    } catch (error) {
      console.error('Failed to import settings:', error);
      throw error;
    }
  }

  /**
   * 获取默认设置（用于离线或API失败时）
   */
  private getDefaultSettings(): AllSettings {
    return {
      general: {
        id: 'general',
        name: '基础设置',
        description: '系统的基础配置选项',
        icon: 'Settings',
        settings: [
          {
            key: 'site_name',
            value: '90天日语学习平台',
            type: 'string',
            label: '网站名称',
            description: '显示在浏览器标题栏和页面头部的网站名称',
            validation: { required: true }
          },
          {
            key: 'site_description',
            value: '提升实用日语交流能力的高效学习系统',
            type: 'string',
            label: '网站描述',
            description: '网站的简短描述，用于SEO和页面介绍'
          },
          {
            key: 'default_language',
            value: 'zh-CN',
            type: 'select',
            label: '默认语言',
            description: '系统界面的默认显示语言',
            options: [
              { label: '简体中文', value: 'zh-CN' },
              { label: '繁体中文', value: 'zh-TW' },
              { label: 'English', value: 'en' },
              { label: '日本語', value: 'ja' }
            ]
          },
          {
            key: 'timezone',
            value: 'Asia/Shanghai',
            type: 'select',
            label: '时区',
            description: '系统使用的时区设置',
            options: [
              { label: '北京时间 (UTC+8)', value: 'Asia/Shanghai' },
              { label: '东京时间 (UTC+9)', value: 'Asia/Tokyo' },
              { label: 'UTC时间', value: 'UTC' }
            ]
          }
        ]
      },
      learning: {
        id: 'learning',
        name: '学习设置',
        description: '学习相关的配置选项',
        icon: 'Globe',
        settings: [
          {
            key: 'daily_goal_minutes',
            value: 30,
            type: 'number',
            label: '每日学习目标（分钟）',
            description: '推荐用户每天的学习时长',
            validation: { min: 5, max: 480 }
          },
          {
            key: 'auto_save_progress',
            value: true,
            type: 'boolean',
            label: '自动保存学习进度',
            description: '是否自动保存用户的学习进度'
          },
          {
            key: 'difficulty_auto_adjust',
            value: true,
            type: 'boolean',
            label: '自动调整难度',
            description: '根据用户表现自动调整学习内容难度'
          }
        ]
      },
      notifications: {
        id: 'notifications',
        name: '通知设置',
        description: '系统通知和提醒配置',
        icon: 'Bell',
        settings: [
          {
            key: 'email_notifications',
            value: true,
            type: 'boolean',
            label: '邮件通知',
            description: '是否发送邮件通知给用户'
          },
          {
            key: 'daily_reminder',
            value: true,
            type: 'boolean',
            label: '每日学习提醒',
            description: '是否发送每日学习提醒'
          },
          {
            key: 'reminder_time',
            value: '20:00',
            type: 'string',
            label: '提醒时间',
            description: '每日提醒的发送时间'
          }
        ]
      },
      security: {
        id: 'security',
        name: '安全设置',
        description: '系统安全相关配置',
        icon: 'Shield',
        settings: [
          {
            key: 'session_timeout',
            value: 1440,
            type: 'number',
            label: '会话超时时间（分钟）',
            description: '用户会话的超时时间',
            validation: { min: 30, max: 10080 }
          },
          {
            key: 'password_min_length',
            value: 8,
            type: 'number',
            label: '密码最小长度',
            description: '用户密码的最小长度要求',
            validation: { min: 6, max: 32 }
          },
          {
            key: 'enable_2fa',
            value: false,
            type: 'boolean',
            label: '启用双因素认证',
            description: '是否启用双因素认证功能'
          }
        ]
      }
    };
  }

  /**
   * 获取空的设置组
   */
  private getEmptyGroup(groupId: string): SettingsGroup {
    return {
      id: groupId,
      name: '未知设置组',
      description: '设置组不存在',
      settings: []
    };
  }
}

// 导出单例实例
const settingsService = new SettingsService();
export default settingsService;
