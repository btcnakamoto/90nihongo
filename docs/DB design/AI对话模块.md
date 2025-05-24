# AI对话模块数据表

## 1. ai_conversation_scenarios 表 - AI对话场景配置

### 表结构
| 字段名 | 类型 | 是否必填 | 默认值 | 说明 |
|--------|------|----------|--------|------|
| id | bigint | 是 | 自增 | 主键 |
| name | varchar | 是 | - | 场景名称 |
| description | text | 是 | - | 场景描述 |
| difficulty | enum | 是 | - | 难度：beginner/intermediate/advanced |
| initial_context | json | 是 | - | AI的初始上下文设置 |
| suggested_topics | json | 是 | - | 建议的对话主题 |
| vocabulary_focus | json | 是 | - | 重点词汇 |
| grammar_focus | json | 是 | - | 重点语法 |
| is_active | boolean | 否 | true | 是否启用 |
| created_at | timestamp | 是 | 当前时间 | 创建时间 |
| updated_at | timestamp | 是 | 当前时间 | 更新时间 |

### 索引
- 主键：id
- 普通索引：difficulty, is_active

### 业务逻辑
- 定义AI对话的场景和上下文
- 支持不同难度级别的对话练习
- 可配置重点学习内容

### JSON 字段示例
```json
// initial_context 示例
{
  "role": "日语老师",
  "personality": "友善、耐心、鼓励性",
  "speaking_style": "使用简单易懂的日语",
  "correction_style": "温和纠错，提供解释"
}

// suggested_topics 示例
[
  "自我介绍",
  "日常问候",
  "购物对话",
  "餐厅点餐",
  "问路指路"
]

// vocabulary_focus 示例
[
  {"word": "こんにちは", "meaning": "你好", "priority": "high"},
  {"word": "ありがとう", "meaning": "谢谢", "priority": "high"},
  {"word": "すみません", "meaning": "不好意思", "priority": "medium"}
]

// grammar_focus 示例
[
  {"pattern": "です/である", "description": "敬语表达", "level": "N5"},
  {"pattern": "て形", "description": "动词连接形", "level": "N4"}
]
```

---

## 2. ai_conversation_histories 表 - 用户AI对话历史记录

### 表结构
| 字段名 | 类型 | 是否必填 | 默认值 | 说明 |
|--------|------|----------|--------|------|
| id | bigint | 是 | 自增 | 主键 |
| user_id | bigint | 是 | - | 关联用户ID |
| scenario_id | bigint | 是 | - | 关联场景ID |
| conversation_log | json | 是 | - | 对话内容记录 |
| duration_seconds | integer | 是 | - | 对话时长（秒） |
| user_messages_count | integer | 是 | - | 用户消息数量 |
| ai_messages_count | integer | 是 | - | AI消息数量 |
| performance_metrics | json | 否 | null | 发音准确度、流畅度等指标 |
| created_at | timestamp | 是 | 当前时间 | 创建时间 |
| updated_at | timestamp | 是 | 当前时间 | 更新时间 |

### 索引
- 主键：id
- 外键：user_id → users(id)
- 外键：scenario_id → ai_conversation_scenarios(id)
- 普通索引：created_at, duration_seconds

### 业务逻辑
- 记录完整的对话历史
- 统计对话质量指标
- 用于分析用户学习进度

### JSON 字段示例
```json
// conversation_log 示例
{
  "messages": [
    {
      "timestamp": "2024-03-15T10:30:00Z",
      "sender": "user",
      "content": "こんにちは",
      "audio_url": "https://audio.example.com/user_001.mp3"
    },
    {
      "timestamp": "2024-03-15T10:30:05Z",
      "sender": "ai",
      "content": "こんにちは！今日はいい天気ですね。",
      "audio_url": "https://audio.example.com/ai_001.mp3"
    }
  ]
}

// performance_metrics 示例
{
  "pronunciation_score": 85,
  "fluency_score": 78,
  "grammar_accuracy": 92,
  "vocabulary_usage": 80,
  "response_time_avg": 3.5,
  "corrections_needed": 2
}
```

---

## 3. micro_scenarios 表 - 微场景配置

### 表结构
| 字段名 | 类型 | 是否必填 | 默认值 | 说明 |
|--------|------|----------|--------|------|
| id | bigint | 是 | 自增 | 主键 |
| name | varchar | 是 | - | 微场景名称 |
| description | text | 是 | - | 场景描述 |
| type | enum | 是 | - | 类型：dialogue/role_play/situation_response |
| estimated_duration_minutes | integer | 是 | - | 预估时长（分钟） |
| scenario_content | json | 是 | - | 场景内容，包括对话脚本或情境描述 |
| key_phrases | json | 是 | - | 关键短语 |
| success_criteria | json | 是 | - | 完成标准 |
| is_active | boolean | 否 | true | 是否启用 |
| created_at | timestamp | 是 | 当前时间 | 创建时间 |
| updated_at | timestamp | 是 | 当前时间 | 更新时间 |

### 索引
- 主键：id
- 普通索引：type, estimated_duration_minutes, is_active

### 业务逻辑
- 短小精悍的学习场景
- 支持多种互动类型
- 明确的完成标准

### JSON 字段示例
```json
// scenario_content 示例
{
  "situation": "在咖啡店点餐",
  "background": "你是顾客，需要点一杯咖啡和一个蛋糕",
  "dialogue_script": [
    {"role": "店员", "line": "いらっしゃいませ！"},
    {"role": "顾客", "line": "[用户回应]"},
    {"role": "店员", "line": "何にいたしますか？"}
  ]
}

// key_phrases 示例
[
  {"phrase": "いらっしゃいませ", "meaning": "欢迎光临", "usage": "店员问候"},
  {"phrase": "コーヒーをお願いします", "meaning": "请给我咖啡", "usage": "点餐"},
  {"phrase": "ありがとうございます", "meaning": "谢谢", "usage": "感谢"}
]

// success_criteria 示例
{
  "required_phrases": ["コーヒー", "お願いします"],
  "min_exchanges": 3,
  "pronunciation_threshold": 70,
  "completion_time_limit": 300
}
```

---

## 4. user_micro_scenario_completions 表 - 用户微场景完成记录

### 表结构
| 字段名 | 类型 | 是否必填 | 默认值 | 说明 |
|--------|------|----------|--------|------|
| id | bigint | 是 | 自增 | 主键 |
| user_id | bigint | 是 | - | 关联用户ID |
| micro_scenario_id | bigint | 是 | - | 关联微场景ID |
| user_responses | json | 是 | - | 用户的回答记录 |
| score | integer | 否 | null | 得分 |
| feedback | json | 否 | null | AI评分反馈 |
| is_completed | boolean | 否 | false | 是否完成 |
| completed_at | timestamp | 否 | null | 完成时间 |
| created_at | timestamp | 是 | 当前时间 | 创建时间 |
| updated_at | timestamp | 是 | 当前时间 | 更新时间 |

### 索引
- 主键：id
- 外键：user_id → users(id)
- 外键：micro_scenario_id → micro_scenarios(id)
- 普通索引：is_completed, completed_at, score

### 业务逻辑
- 记录用户在微场景中的表现
- 提供详细的反馈和评分
- 跟踪完成状态

### JSON 字段示例
```json
// user_responses 示例
{
  "responses": [
    {
      "prompt": "店员说：いらっしゃいませ！",
      "user_response": "こんにちは",
      "audio_url": "https://audio.example.com/response_001.mp3",
      "timestamp": "2024-03-15T10:30:00Z"
    },
    {
      "prompt": "店员问：何にいたしますか？",
      "user_response": "コーヒーをお願いします",
      "audio_url": "https://audio.example.com/response_002.mp3",
      "timestamp": "2024-03-15T10:30:15Z"
    }
  ]
}

// feedback 示例
{
  "overall_score": 85,
  "pronunciation": {
    "score": 80,
    "comments": "发音基本准确，注意长音的发音"
  },
  "grammar": {
    "score": 90,
    "comments": "语法使用正确"
  },
  "vocabulary": {
    "score": 85,
    "comments": "词汇选择恰当"
  },
  "suggestions": [
    "可以尝试使用更多的敬语表达",
    "注意「お」的发音要更清晰"
  ]
}
```

---

## 5. ai_evaluation_criteria 表 - AI评分标准

### 表结构
| 字段名 | 类型 | 是否必填 | 默认值 | 说明 |
|--------|------|----------|--------|------|
| id | bigint | 是 | 自增 | 主键 |
| name | varchar | 是 | - | 评分标准名称 |
| description | text | 是 | - | 标准描述 |
| type | enum | 是 | - | 类型：pronunciation/grammar/vocabulary/fluency/comprehension |
| scoring_rules | json | 是 | - | 评分规则 |
| feedback_templates | json | 是 | - | 反馈模板 |
| created_at | timestamp | 是 | 当前时间 | 创建时间 |
| updated_at | timestamp | 是 | 当前时间 | 更新时间 |

### 索引
- 主键：id
- 普通索引：type

### 业务逻辑
- 定义AI评分的标准和规则
- 提供一致的评分体系
- 支持个性化反馈

### JSON 字段示例
```json
// scoring_rules 示例
{
  "pronunciation": {
    "excellent": {"min_score": 90, "description": "发音非常准确"},
    "good": {"min_score": 75, "description": "发音基本准确"},
    "needs_improvement": {"min_score": 60, "description": "发音需要改进"},
    "poor": {"min_score": 0, "description": "发音有明显错误"}
  }
}

// feedback_templates 示例
{
  "pronunciation": {
    "excellent": "您的发音非常标准！继续保持！",
    "good": "发音不错，注意{specific_points}的发音。",
    "needs_improvement": "建议多练习{problem_sounds}的发音。",
    "poor": "发音需要大幅改进，建议从{basic_sounds}开始练习。"
  }
}
```

---

## 关系图

```
users 1:N ai_conversation_histories (user_id)
ai_conversation_scenarios 1:N ai_conversation_histories (scenario_id)
users 1:N user_micro_scenario_completions (user_id)
micro_scenarios 1:N user_micro_scenario_completions (micro_scenario_id)
```

---

## 统计查询示例

### AI对话使用统计
```sql
-- 用户AI对话活跃度
SELECT 
    u.username,
    COUNT(ach.id) as total_conversations,
    AVG(ach.duration_seconds) as avg_duration,
    AVG(JSON_EXTRACT(ach.performance_metrics, '$.pronunciation_score')) as avg_pronunciation,
    MAX(ach.created_at) as last_conversation
FROM users u
LEFT JOIN ai_conversation_histories ach ON u.id = ach.user_id
WHERE ach.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY u.id, u.username
ORDER BY total_conversations DESC;
```

### 微场景完成率分析
```sql
-- 各微场景的完成率和平均得分
SELECT 
    ms.name,
    ms.type,
    COUNT(umsc.id) as total_attempts,
    SUM(CASE WHEN umsc.is_completed THEN 1 ELSE 0 END) as completed_count,
    ROUND(SUM(CASE WHEN umsc.is_completed THEN 1 ELSE 0 END) * 100.0 / COUNT(umsc.id), 2) as completion_rate,
    AVG(umsc.score) as avg_score
FROM micro_scenarios ms
LEFT JOIN user_micro_scenario_completions umsc ON ms.id = umsc.micro_scenario_id
WHERE ms.is_active = true
GROUP BY ms.id, ms.name, ms.type
ORDER BY completion_rate DESC;
```

### 学习效果分析
```sql
-- 用户学习进步趋势
SELECT 
    DATE(ach.created_at) as conversation_date,
    AVG(JSON_EXTRACT(ach.performance_metrics, '$.pronunciation_score')) as avg_pronunciation,
    AVG(JSON_EXTRACT(ach.performance_metrics, '$.fluency_score')) as avg_fluency,
    AVG(JSON_EXTRACT(ach.performance_metrics, '$.grammar_accuracy')) as avg_grammar
FROM ai_conversation_histories ach
WHERE ach.user_id = ? 
    AND ach.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(ach.created_at)
ORDER BY conversation_date;
```

---

## 业务流程

### AI对话流程
1. 用户选择对话场景
2. 系统初始化AI上下文
3. 开始对话交互
4. 实时语音识别和回应
5. 记录对话内容和评分
6. 提供学习反馈

### 微场景练习流程
1. 用户选择微场景
2. 系统展示场景背景
3. 用户按提示进行互动
4. AI实时评估用户表现
5. 完成后给出详细反馈
6. 记录完成状态和得分

### AI评分流程
1. 收集用户语音输入
2. 语音识别转文字
3. 分析发音、语法、词汇
4. 根据评分标准打分
5. 生成个性化反馈
6. 更新用户学习档案

---

## 技术实现要点

### 语音处理
- 实时语音识别（ASR）
- 语音合成（TTS）
- 发音评估算法
- 音频质量优化

### AI对话引擎
- 自然语言理解（NLU）
- 对话管理（DM）
- 自然语言生成（NLG）
- 上下文维护

### 评分算法
- 发音准确度评估
- 语法正确性检查
- 词汇使用评价
- 流畅度分析

---

## 注意事项

1. **隐私保护**：语音数据的安全存储和处理
2. **实时性能**：确保对话的流畅性和响应速度
3. **评分公平性**：建立客观一致的评分标准
4. **个性化**：根据用户水平调整难度和反馈
5. **数据质量**：确保训练数据的准确性和多样性
6. **用户体验**：提供友好的交互界面和清晰的反馈 