# 学习资源管理功能

## 功能概述

这个资源管理功能为90日语学习平台提供了一个专门的管理界面，用于获取、处理和管理各种日语学习材料资源。

## 主要功能

### 1. 网页内容抓取
- **功能描述**: 从指定网站自动抓取日语学习内容
- **支持网站**: NHK新闻简单日语、朝日新闻、毎日新闻等
- **配置选项**:
  - 目标网址（支持多个URL）
  - 最大页面数限制
  - 内容类型选择（课程、材料、词汇、新闻）
  - 抓取间隔设置
  - 是否包含图片和音频

### 2. 文件批量上传
- **支持格式**: TXT, CSV, JSON, MP3, MP4, PDF
- **处理能力**: 最大100MB单文件，支持多文件同时上传
- **自动处理**: 根据文件类型自动转换为学习资源

### 3. 外部API导入
- **功能描述**: 从外部API批量导入学习资源
- **支持格式**: JSON, XML, CSV
- **批量处理**: 支持大批量数据的分批导入
- **连接测试**: 导入前自动测试API连接

### 4. 任务管理
- **实时监控**: 查看所有运行中的导入任务
- **进度跟踪**: 实时显示任务进度和处理状态
- **任务控制**: 支持暂停、恢复、取消任务
- **日志查看**: 详细的任务执行日志

### 5. 资源统计
- **总览信息**: 总资源数、运行中任务、今日导入量、成功率
- **资源列表**: 最近导入的资源及其状态
- **性能指标**: 导入成功率和效率统计

## 技术架构

### 前端组件
- **页面位置**: `frontend-admin/src/pages/AdminResourceManager.tsx`
- **路由**: `/admin/resources`
- **UI框架**: React + TypeScript + Tailwind CSS
- **组件库**: shadcn/ui

### 后端API
- **控制器**: `backend/app/Http/Controllers/Admin/ResourceController.php`
- **路由前缀**: `/admin/resources`
- **认证**: 需要管理员权限

### 数据模型
- **ImportTask**: 导入任务管理
- **ResourceItem**: 资源项目管理

### 队列作业
- **ProcessWebScrapingJob**: 处理网页抓取任务
- **ProcessFileUploadJob**: 处理文件上传任务
- **ProcessApiImportJob**: 处理API导入任务

## API接口

### 资源管理
```
GET    /admin/resources              # 获取资源列表
GET    /admin/resources/stats        # 获取统计信息
DELETE /admin/resources/{id}         # 删除资源
```

### 任务管理
```
GET    /admin/resources/tasks        # 获取任务列表
GET    /admin/resources/tasks/{id}   # 获取任务详情
PATCH  /admin/resources/tasks/{id}/toggle  # 暂停/恢复任务
DELETE /admin/resources/tasks/{id}   # 取消任务
```

### 导入操作
```
POST   /admin/resources/web-scraping # 启动网页抓取
POST   /admin/resources/file-upload  # 文件上传
POST   /admin/resources/api-import   # API导入
```

## 使用指南

### 1. 网页抓取使用步骤
1. 进入资源管理页面
2. 切换到"网页抓取"标签
3. 输入目标网址（每行一个）
4. 配置抓取参数
5. 点击"开始抓取"
6. 在"任务管理"中监控进度

### 2. 文件上传使用步骤
1. 切换到"文件上传"标签
2. 拖拽文件或点击选择文件
3. 确认文件列表
4. 点击"开始上传"
5. 系统自动处理并转换文件

### 3. API导入使用步骤
1. 切换到"API导入"标签
2. 填写API端点和密钥
3. 选择数据格式和批次大小
4. 点击"开始导入"
5. 系统自动测试连接并导入数据

## 集成现有工具

### 与content_importer.py集成
资源管理功能可以与现有的`content_importer.py`工具集成：

```python
# 在ProcessWebScrapingJob中调用
import subprocess
result = subprocess.run([
    'python', 'content_importer.py',
    '--scraped-dir', scraped_dir,
    '--output-dir', output_dir
], capture_output=True, text=True)
```

### 与demo_content.py集成
可以利用现有的演示内容生成功能：

```python
# 生成演示数据
python demo_content.py --count 100 --type course
```

## 数据库表结构

### import_tasks表
```sql
CREATE TABLE import_tasks (
    id BIGINT PRIMARY KEY,
    type VARCHAR(255),           -- 任务类型
    name VARCHAR(255),           -- 任务名称
    status VARCHAR(255),         -- 任务状态
    progress DECIMAL(5,2),       -- 进度百分比
    total_items INT,             -- 总项目数
    items_processed INT,         -- 已处理项目数
    config JSON,                 -- 任务配置
    logs JSON,                   -- 日志记录
    started_at TIMESTAMP,        -- 开始时间
    completed_at TIMESTAMP,      -- 完成时间
    error_message TEXT,          -- 错误信息
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### resource_items表
```sql
CREATE TABLE resource_items (
    id BIGINT PRIMARY KEY,
    task_id BIGINT,              -- 关联任务ID
    name VARCHAR(255),           -- 资源名称
    type VARCHAR(255),           -- 资源类型
    source VARCHAR(255),         -- 来源
    status VARCHAR(255),         -- 状态
    progress DECIMAL(5,2),       -- 进度
    file_path VARCHAR(255),      -- 文件路径
    file_size BIGINT,            -- 文件大小
    content LONGTEXT,            -- 文本内容
    metadata JSON,               -- 元数据
    count INT,                   -- 项目数量
    error_message TEXT,          -- 错误信息
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## 部署说明

### 1. 前端部署
```bash
cd frontend-admin
npm install
npm run build
```

### 2. 后端部署
```bash
cd backend
composer install
php artisan migrate
php artisan queue:work  # 启动队列处理
```

### 3. 权限配置
确保存储目录有写入权限：
```bash
chmod -R 755 storage/
chmod -R 755 public/uploads/
```

## 扩展功能

### 1. 支持更多网站
可以通过修改`ProcessWebScrapingJob`来支持更多日语学习网站。

### 2. 自定义处理器
可以为不同类型的文件创建专门的处理器。

### 3. 定时任务
可以设置定时任务自动抓取最新内容。

### 4. 内容质量检查
可以添加内容质量评估和过滤功能。

## 注意事项

1. **网页抓取**: 请遵守目标网站的robots.txt和使用条款
2. **文件大小**: 大文件上传可能需要调整PHP配置
3. **队列处理**: 确保队列服务正常运行
4. **存储空间**: 定期清理临时文件和日志
5. **API限制**: 注意外部API的调用频率限制

## 故障排除

### 常见问题
1. **任务卡住**: 检查队列服务是否运行
2. **文件上传失败**: 检查文件大小和格式
3. **API连接失败**: 验证API密钥和网络连接
4. **权限错误**: 检查文件系统权限

### 日志查看
```bash
# Laravel日志
tail -f storage/logs/laravel.log

# 队列日志
php artisan queue:failed
```

## 更新日志

### v1.0.0 (2024-01-15)
- 初始版本发布
- 支持网页抓取、文件上传、API导入
- 实现任务管理和进度监控
- 添加资源统计功能 