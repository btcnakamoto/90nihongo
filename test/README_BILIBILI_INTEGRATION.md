# B站视频音频提取功能集成指南

## 🎯 功能概述

本功能已成功集成到90nihongo管理端的资源管理页面中，允许管理员从B站视频中提取指定片段的音频和字幕，用于日语学习材料制作。

## 📍 访问路径

在管理端侧边栏中：
```
资源管理 → B站提取
```

或直接访问：
```
/admin/resources/bilibili
```

## 🚀 主要功能

### 1. 视频信息获取
- 输入B站视频链接（支持BV号和AV号）
- 自动获取视频标题、时长、UP主等信息
- 实时预览视频基本信息

### 2. 音频片段提取
- 指定开始和结束时间（支持多种时间格式）
- 高质量音频提取
- 自动格式转换

### 3. 字幕生成
- **AI字幕生成**：使用OpenAI Whisper自动识别语音
- **原生字幕**：获取B站原有字幕文件
- 支持中文、日语、英语等多语言

### 4. 任务管理
- 实时进度监控
- 任务状态跟踪（等待中、处理中、已完成、失败）
- 批量任务管理
- 文件下载和管理

## 🛠️ 技术架构

### 前端组件
- **页面组件**: `AdminBilibiliExtractor.tsx`
- **路由配置**: `/admin/resources/bilibili`
- **UI框架**: React + TypeScript + Tailwind CSS

### 后端架构
- **控制器**: `BilibiliExtractorController.php`
- **模型**: `BilibiliExtractJob.php`
- **队列任务**: `ProcessBilibiliExtraction.php`
- **数据库表**: `bilibili_extract_jobs`

### Python脚本
- **视频信息获取**: `python/get_video_info.py`
- **音频提取**: `python/bilibili_audio_extractor.py`
- **依赖管理**: `python/requirements_bilibili.txt`

## 📋 API接口

### 获取视频信息
```http
POST /api/admin/bilibili/video-info
Content-Type: application/json

{
  "url": "https://www.bilibili.com/video/BV1234567890"
}
```

### 提交提取任务
```http
POST /api/admin/bilibili/extract
Content-Type: application/json

{
  "video_url": "https://www.bilibili.com/video/BV1234567890",
  "start_time": "00:01:30",
  "end_time": "00:02:30",
  "description": "日语学习片段",
  "use_ai_subtitle": true
}
```

### 获取任务列表
```http
GET /api/admin/bilibili/jobs
```

### 下载文件
```http
GET /api/admin/bilibili/jobs/{jobId}/download/{fileType}
```

## 🔧 环境配置

### Python环境
1. 安装Python 3.8+
2. 安装依赖：
```bash
pip install -r python/requirements_bilibili.txt
```

### FFmpeg
确保系统已安装FFmpeg：
```bash
# Windows (使用Chocolatey)
choco install ffmpeg

# macOS (使用Homebrew)
brew install ffmpeg

# Ubuntu/Debian
sudo apt update && sudo apt install ffmpeg
```

### Laravel配置
在`.env`文件中配置Python路径：
```env
PYTHON_PATH=python
```

### 队列配置
启动队列处理器：
```bash
php artisan queue:work --queue=bilibili-extraction
```

## 📊 数据库结构

### bilibili_extract_jobs表
```sql
- id (UUID, 主键)
- admin_id (外键，关联管理员)
- video_url (视频链接)
- video_title (视频标题)
- start_time (开始时间)
- end_time (结束时间)
- description (描述)
- use_ai_subtitle (是否使用AI字幕)
- status (状态：pending/processing/completed/failed)
- progress (进度百分比)
- audio_path (音频文件路径)
- subtitle_path (字幕文件路径)
- subtitle_text (字幕内容)
- error_message (错误信息)
- completed_at (完成时间)
- created_at/updated_at (时间戳)
```

## 🎨 用户界面

### 新建提取页面
- 视频链接输入和验证
- 时间段选择器
- 字幕选项配置
- 实时视频信息预览

### 任务列表页面
- 任务状态监控
- 进度条显示
- 文件下载链接
- 任务管理操作

### 设置页面
- 视频质量配置
- AI模型选择
- 系统状态检查

## 📝 使用流程

1. **访问功能页面**
   - 登录管理端
   - 导航到"资源管理" → "B站提取"

2. **获取视频信息**
   - 输入B站视频链接
   - 点击获取信息按钮
   - 查看视频详情

3. **配置提取参数**
   - 设置开始和结束时间
   - 选择字幕生成方式
   - 添加描述信息

4. **提交提取任务**
   - 点击"开始提取"按钮
   - 任务进入队列处理

5. **监控任务进度**
   - 切换到"任务列表"标签
   - 实时查看处理进度
   - 等待任务完成

6. **下载结果文件**
   - 任务完成后下载音频文件
   - 下载字幕文件
   - 查看字幕内容

## ⚠️ 注意事项

### 版权合规
- 仅用于教育和学习目的
- 遵守相关版权法规
- 不得用于商业用途

### 性能优化
- 建议片段长度控制在1-5分钟
- 避免同时处理过多任务
- 定期清理过期文件

### 错误处理
- 网络连接问题
- 视频不可访问
- 格式不支持
- 存储空间不足

## 🔍 故障排除

### 常见问题
1. **Python环境问题**
   - 检查Python版本和依赖
   - 验证脚本执行权限

2. **FFmpeg问题**
   - 确认FFmpeg安装
   - 检查PATH环境变量

3. **队列处理问题**
   - 启动队列工作进程
   - 检查数据库连接

4. **文件权限问题**
   - 确保存储目录可写
   - 检查文件权限设置

## 🚀 未来扩展

### 计划功能
- 批量视频处理
- 更多字幕语言支持
- 视频片段预览
- 自动标签生成
- 学习材料自动分类

### 技术优化
- 并行处理支持
- 缓存机制优化
- 错误重试机制
- 进度推送优化

---

## 📞 技术支持

如有问题或建议，请联系开发团队或在项目仓库中提交Issue。 