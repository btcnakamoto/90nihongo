# 网页抓取功能文档

## 🎯 功能概述

网页抓取功能是90日语学习平台资源管理系统的核心功能之一，专门用于从日语学习网站自动抓取学习内容。

## 🏗️ 架构设计

```
前端界面 (React) → Laravel API → Python抓取脚本 → 数据库存储
```

### 技术栈
- **前端**: React + TypeScript + Tailwind CSS
- **后端**: Laravel PHP + MySQL
- **抓取器**: Python + BeautifulSoup + requests
- **队列**: Laravel Queue Jobs

## 📚 支持的网站

### 1. NHK Easy News
- **URL**: `https://www3.nhk.or.jp/news/easy/`
- **特点**: 简单日语新闻，适合初学者
- **提取内容**: 标题、正文、图片、音频
- **元数据**: 难度标记、发布时间

### 2. 每日新闻 (Mainichi)
- **URL**: `https://mainichi.jp/`
- **特点**: 标准日语新闻
- **提取内容**: 标题、正文、图片

### 3. 朝日新闻 (Asahi)
- **URL**: `https://asahi.com/`
- **特点**: 高质量日语新闻
- **提取内容**: 标题、正文、图片

### 4. 通用网站
- 支持任何日语学习相关网站
- 智能内容提取
- 自动发现相关链接

## 🔧 配置参数

### 基本配置
- **目标网址**: 支持多个URL，每行一个
- **最大页面数**: 限制抓取页面数量 (1-1000)
- **内容类型**: 课程、材料、词汇、新闻
- **抓取间隔**: 防止过频繁请求 (100-10000ms)

### 高级配置
- **包含图片**: 是否下载和保存图片
- **包含音频**: 是否下载和保存音频文件
- **自动发现**: 是否在页面中查找相关链接

## 📁 文件结构

```
project/
├── frontend-admin/src/pages/AdminResourceManager.tsx  # 前端界面
├── backend/
│   ├── app/Http/Controllers/Admin/ResourceController.php  # API控制器
│   ├── app/Jobs/ProcessWebScrapingJob.php             # 队列任务
│   └── app/Models/ImportTask.php                      # 任务模型
└── python/
    ├── web_scraper.py                                 # Python抓取脚本
    └── requirements.txt                               # Python依赖
```

## 🔄 工作流程

### 1. 任务创建
用户在前端界面配置抓取参数并提交

### 2. 队列调度
Laravel创建ImportTask记录并加入队列

### 3. Python执行
```bash
python web_scraper.py config.json
```

### 4. 内容提取
- 智能识别网站类型
- 提取标题、正文、媒体文件
- 生成结构化元数据

### 5. 数据存储
- 保存到resource_items表
- 下载媒体文件到本地
- 更新任务进度

## 📊 数据表结构

### import_tasks 表
```sql
- id: 任务ID
- type: 'web-scraping'
- name: 任务名称
- status: pending/running/completed/failed
- progress: 0-100
- config: JSON配置
- logs: 日志数组
```

### resource_items 表
```sql
- id: 资源ID
- name: 资源名称
- type: 资源类型
- source: 'web-scraping'
- source_url: 原始URL
- content: 文本内容
- metadata: JSON元数据
- media_files: JSON媒体文件信息
- import_task_id: 关联任务ID
```

## 🛠️ API接口

### 启动抓取任务
```http
POST /admin/resources/scraping/start
Content-Type: application/json

{
  "urls": "https://www3.nhk.or.jp/news/easy/\nhttps://mainichi.jp/",
  "max_pages": 10,
  "content_type": "course",
  "delay_ms": 1000,
  "include_images": true,
  "include_audio": false
}
```

### 获取任务列表
```http
GET /admin/resources/tasks
```

### 获取资源列表
```http
GET /admin/resources
```

### 任务控制
```http
POST /admin/resources/tasks/{id}/toggle  # 暂停/恢复
POST /admin/resources/tasks/{id}/cancel  # 取消
```

## 🎮 使用指南

### 1. 访问界面
访问 `http://localhost:3000/admin/resources` 进入资源管理页面

### 2. 配置抓取
- 选择"网页抓取"标签
- 输入目标网址（每行一个）
- 设置最大页面数和内容类型
- 配置抓取间隔和媒体选项

### 3. 启动任务
点击"开始抓取"按钮，系统将：
- 创建抓取任务
- 加入后台队列
- 开始Python脚本执行

### 4. 监控进度
在"任务管理"标签中可以：
- 查看实时进度
- 查看详细日志
- 暂停/恢复/取消任务

### 5. 查看结果
在"概览"标签中查看：
- 抓取的资源列表
- 统计数据
- 导入到内容管理

## 🔍 示例抓取配置

### NHK Easy News 抓取
```
URLs: https://www3.nhk.or.jp/news/easy/
最大页面数: 20
内容类型: 课程内容
抓取间隔: 2000ms
包含图片: ✓
包含音频: ✓
```

### 综合新闻抓取
```
URLs: 
https://www3.nhk.or.jp/news/easy/
https://mainichi.jp/
最大页面数: 50
内容类型: 新闻文章
抓取间隔: 1500ms
包含图片: ✓
包含音频: ✗
```

## ⚠️ 注意事项

### 1. 合规使用
- 遵守网站robots.txt规则
- 设置合理的抓取间隔
- 仅用于学习和研究目的

### 2. 性能优化
- 限制并发抓取数量
- 合理设置超时时间
- 定期清理临时文件

### 3. 错误处理
- 网络异常自动重试
- 解析失败跳过处理
- 详细错误日志记录

## 🚀 部署要求

### Python环境
```bash
pip install -r python/requirements.txt
```

### Laravel配置
```bash
php artisan queue:work  # 启动队列处理
php artisan migrate     # 运行数据库迁移
```

### 存储目录
确保以下目录可写：
- `storage/app/public/scraped-content/`
- `storage/app/temp/`

## 🎯 未来扩展

1. **更多网站支持**: 添加更多日语学习网站
2. **智能分类**: AI自动分类抓取内容
3. **质量评估**: 内容质量自动评分
4. **实时抓取**: WebSocket实时推送新内容
5. **分布式抓取**: 多机器并行抓取

## 📞 技术支持

如有问题，请查看：
1. 日志文件：`web_scraper.log`
2. Laravel日志：`storage/logs/laravel.log`
3. 数据库任务状态：`import_tasks`表 