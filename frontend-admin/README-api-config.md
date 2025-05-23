# API配置最佳实践

## 🔧 环境变量配置

### 当前配置
```typescript
// src/lib/api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
```

### 环境变量文件

创建 `.env` 文件（已创建）：
```bash
# API配置
VITE_API_BASE_URL=http://localhost:8000

# 应用配置
VITE_APP_TITLE=90天日语管理系统
VITE_APP_VERSION=1.0.0

# 开发配置
VITE_APP_DEBUG=true
```

## 🌍 不同环境配置

### 开发环境 (.env)
```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_DEBUG=true
```

### 测试环境 (.env.staging)
```bash
VITE_API_BASE_URL=https://api-staging.yourdomain.com
VITE_APP_DEBUG=false
```

### 生产环境 (.env.production)
```bash
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_APP_DEBUG=false
```

## ✅ 最佳实践优势

### 1. **环境隔离**
- 开发、测试、生产环境使用不同的API地址
- 避免硬编码，提高灵活性

### 2. **安全性**
- 敏感配置不提交到代码仓库
- `.env` 文件应添加到 `.gitignore`

### 3. **可维护性**
- 配置集中管理
- 部署时无需修改代码

### 4. **调试能力**
- 开发环境自动打印API配置
- 请求和响应日志记录

## 🛠️ 使用方法

### 本地开发
```bash
# 1. 复制环境变量文件
cp .env.example .env

# 2. 修改配置
# 编辑 .env 文件设置正确的API地址

# 3. 启动开发服务器
npm run dev
```

### 生产部署
```bash
# 1. 设置生产环境变量
export VITE_API_BASE_URL=https://api.yourdomain.com

# 2. 构建项目
npm run build

# 3. 部署到服务器
npm run preview
```

## 📋 配置验证

启动应用后，在浏览器控制台可以看到：
```
🔧 API Configuration: {
  baseURL: "http://localhost:8000",
  environment: "development"
}
```

## 🔍 API调试

开发环境下自动记录：
- 🚀 API请求日志
- ✅ API响应日志  
- ❌ API错误日志

## ⚠️ 注意事项

1. **Vite环境变量规则**：
   - 必须以 `VITE_` 开头才能在客户端使用
   - 构建时会被静态替换

2. **安全考虑**：
   - 不要在环境变量中存储敏感信息（如API密钥）
   - 客户端环境变量是公开的

3. **类型安全**：
   ```typescript
   // 可以添加类型定义
   interface ImportMetaEnv {
     readonly VITE_API_BASE_URL: string;
     readonly VITE_APP_TITLE: string;
   }
   ```

## 🔄 迁移指南

### 从硬编码迁移：
```typescript
// ❌ 硬编码方式
const API_BASE_URL = 'http://localhost:8000';

// ✅ 环境变量方式
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
```

这样配置后，您就可以轻松在不同环境间切换，无需修改代码！🎯 