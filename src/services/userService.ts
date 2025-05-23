// 用户数据类型定义
export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  japanese_level: 'N1' | 'N2' | 'N3' | 'N4' | 'N5';
  is_active: boolean;
  email_verified_at?: string;
  created_at: string;
  last_login_at?: string;
  study_start_date?: string;
  daily_study_minutes: number;
  learning_goals?: string[];
  // 订阅相关字段
  subscription_type: 'free' | 'monthly' | 'quarterly' | 'yearly' | 'lifetime';
  subscription_expires_at?: string;
  total_spent: number;
  is_premium: boolean;
  referral_code?: number;
  learning_progress: {
    current_day: number;
    total_study_minutes: number;
    consecutive_days: number;
    listening_score: number;
    speaking_score: number;
    vocabulary_score: number;
    grammar_score: number;
    last_study_date?: string;
  };
  achievements?: Achievement[];
} 