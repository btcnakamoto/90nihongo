# 管理端认证API使用说明

## 🚀 可用的认证接口

### 1. 登录
```http
POST /admin/login
Content-Type: application/json

{
    "account": "admin@example.com", // 邮箱或用户名
    "password": "password"
}
```

**响应示例:**
```json
{
    "success": true,
    "message": "登录成功",
    "token": "1|abc123...",
    "admin": {
        "id": 1,
        "username": "admin",
        "email": "admin@example.com",
        "role": "super_admin",
        "status": true,
        "is_super_admin": true
    }
}
```

### 2. 登出（当前设备）
```http
POST /admin/logout
Authorization: Bearer {token}
```

**响应示例:**
```json
{
    "success": true,
    "message": "已成功登出"
}
```

### 3. 全部登出（所有设备）
```http
POST /admin/logout-all
Authorization: Bearer {token}
```

**响应示例:**
```json
{
    "success": true,
    "message": "已从所有设备登出"
}
```

### 4. 获取当前管理员信息
```http
GET /admin/me
Authorization: Bearer {token}
```

**响应示例:**
```json
{
    "success": true,
    "admin": {
        "id": 1,
        "username": "admin",
        "email": "admin@example.com",
        "role": "super_admin",
        "status": true,
        "is_super_admin": true,
        "created_at": "2025-01-01T00:00:00.000000Z",
        "email_verified_at": null
    }
}
```

### 5. 刷新Token
```http
POST /admin/refresh
Authorization: Bearer {token}
```

**响应示例:**
```json
{
    "success": true,
    "message": "Token已刷新",
    "token": "2|def456..."
}
```

## 📝 前端使用示例

### JavaScript/Axios 示例

```javascript
// 管理端认证服务
class AdminAuthService {
    constructor() {
        this.baseURL = 'http://localhost:8000/admin';
        this.token = localStorage.getItem('admin_token');
    }

    // 设置请求头
    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': this.token ? `Bearer ${this.token}` : ''
        };
    }

    // 登录
    async login(account, password) {
        try {
            const response = await axios.post(`${this.baseURL}/login`, {
                account,
                password
            });
            
            if (response.data.success) {
                this.token = response.data.token;
                localStorage.setItem('admin_token', this.token);
                localStorage.setItem('admin_info', JSON.stringify(response.data.admin));
            }
            
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    }

    // 登出
    async logout() {
        try {
            const response = await axios.post(`${this.baseURL}/logout`, {}, {
                headers: this.getHeaders()
            });
            
            // 清除本地存储
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_info');
            this.token = null;
            
            return response.data;
        } catch (error) {
            // 即使API调用失败，也要清除本地token
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_info');
            this.token = null;
            throw error.response?.data || { message: '登出失败' };
        }
    }

    // 全部登出
    async logoutAll() {
        try {
            const response = await axios.post(`${this.baseURL}/logout-all`, {}, {
                headers: this.getHeaders()
            });
            
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_info');
            this.token = null;
            
            return response.data;
        } catch (error) {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_info');
            this.token = null;
            throw error.response?.data || { message: '登出失败' };
        }
    }

    // 获取当前管理员信息
    async getMe() {
        try {
            const response = await axios.get(`${this.baseURL}/me`, {
                headers: this.getHeaders()
            });
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    }

    // 检查是否已登录
    isLoggedIn() {
        return !!this.token;
    }

    // 获取存储的管理员信息
    getAdminInfo() {
        const info = localStorage.getItem('admin_info');
        return info ? JSON.parse(info) : null;
    }
}

// 使用示例
const adminAuth = new AdminAuthService();

// 登录
adminAuth.login('admin@example.com', 'password')
    .then(result => {
        console.log('登录成功:', result);
        // 跳转到管理端首页
        window.location.href = '/admin/dashboard';
    })
    .catch(error => {
        console.error('登录失败:', error);
        alert(error.message || '登录失败');
    });

// 登出
adminAuth.logout()
    .then(result => {
        console.log('登出成功:', result);
        // 跳转到登录页
        window.location.href = '/admin/login';
    })
    .catch(error => {
        console.error('登出失败:', error);
        // 即使失败也跳转到登录页
        window.location.href = '/admin/login';
    });
```

## 🔒 安全注意事项

1. **Token存储**: 建议使用httpOnly cookie而不是localStorage（更安全）
2. **HTTPS**: 生产环境必须使用HTTPS
3. **Token刷新**: 长时间操作前建议刷新token
4. **错误处理**: 401错误时自动跳转到登录页
5. **权限验证**: 前端UI根据角色显示/隐藏功能

## 🛡️ 错误处理

### 常见错误码
- `401`: 未认证或token过期
- `403`: 权限不足
- `422`: 验证失败
- `500`: 服务器错误

### 错误响应格式
```json
{
    "success": false,
    "message": "错误信息",
    "errors": {
        "field": ["具体错误"]
    }
}
``` 