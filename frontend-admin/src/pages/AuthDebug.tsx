/**
 * 功能描述：认证调试页面
 * 输入参数：无
 * 返回值：React组件
 * 用途说明：用于调试和测试用户认证功能，显示当前认证状态和相关信息
 * 作者：nakamotochen
 * 创建时间：2024-12-19
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { 
  Shield, 
  User, 
  Key, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  AlertTriangle,
  Info
} from "lucide-react";

const AuthDebug = () => {
  const { isAuthenticated, isLoading, user, token, login, logout } = useAdminAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [testResults, setTestResults] = useState<any>({});

  useEffect(() => {
    // 收集调试信息
    const info = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      localStorage: {
        hasToken: !!localStorage.getItem('admin_token'),
        tokenLength: localStorage.getItem('admin_token')?.length || 0,
      },
      sessionStorage: {
        hasData: Object.keys(sessionStorage).length > 0,
        keys: Object.keys(sessionStorage),
      },
      cookies: document.cookie,
      url: window.location.href,
    };
    setDebugInfo(info);
  }, []);

  const testApiConnection = async () => {
    try {
      const response = await fetch('/api/admin/test', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      setTestResults({
        ...testResults,
        apiConnection: {
          status: response.status,
          ok: response.ok,
          timestamp: new Date().toISOString(),
        }
      });
    } catch (error) {
      setTestResults({
        ...testResults,
        apiConnection: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        }
      });
    }
  };

  const testLogin = async () => {
    try {
      const result = await login('admin@test.com', 'password');
      setTestResults({
        ...testResults,
        login: {
          success: !!result,
          timestamp: new Date().toISOString(),
        }
      });
    } catch (error) {
      setTestResults({
        ...testResults,
        login: {
          error: error instanceof Error ? error.message : 'Login failed',
          timestamp: new Date().toISOString(),
        }
      });
    }
  };

  const clearStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      {/* 页面标题 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
          <Shield className="h-8 w-8 text-nihongo-blue" />
          认证调试工具
        </h1>
        <p className="text-muted-foreground mt-2">
          用于调试和测试管理员认证功能
        </p>
      </div>

      {/* 当前认证状态 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            当前认证状态
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                {isAuthenticated ? (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-500" />
                )}
              </div>
              <p className="text-sm font-medium">认证状态</p>
              <Badge variant={isAuthenticated ? "default" : "destructive"}>
                {isAuthenticated ? "已认证" : "未认证"}
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                {isLoading ? (
                  <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
                ) : (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                )}
              </div>
              <p className="text-sm font-medium">加载状态</p>
              <Badge variant={isLoading ? "secondary" : "default"}>
                {isLoading ? "加载中" : "已完成"}
              </Badge>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Key className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-sm font-medium">Token状态</p>
              <Badge variant={token ? "default" : "destructive"}>
                {token ? "存在" : "不存在"}
              </Badge>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
              <p className="text-sm font-medium">会话状态</p>
              <Badge variant="outline">
                活跃
              </Badge>
            </div>
          </div>

          {user && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                当前用户: {user.email || user.name || 'Unknown'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 调试信息 */}
      <Card>
        <CardHeader>
          <CardTitle>系统调试信息</CardTitle>
          <CardDescription>当前浏览器和存储状态</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">本地存储</h4>
              <div className="bg-muted p-3 rounded text-sm">
                <p>Token存在: {debugInfo.localStorage?.hasToken ? '是' : '否'}</p>
                <p>Token长度: {debugInfo.localStorage?.tokenLength || 0}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">会话存储</h4>
              <div className="bg-muted p-3 rounded text-sm">
                <p>数据项数量: {debugInfo.sessionStorage?.keys?.length || 0}</p>
                <p>键名: {debugInfo.sessionStorage?.keys?.join(', ') || '无'}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">当前URL</h4>
              <div className="bg-muted p-3 rounded text-sm break-all">
                {debugInfo.url}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 测试工具 */}
      <Card>
        <CardHeader>
          <CardTitle>测试工具</CardTitle>
          <CardDescription>执行各种认证相关的测试</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={testApiConnection} variant="outline">
              测试API连接
            </Button>
            <Button onClick={testLogin} variant="outline">
              测试登录
            </Button>
            <Button onClick={logout} variant="outline">
              测试登出
            </Button>
          </div>

          {Object.keys(testResults).length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">测试结果</h4>
              <div className="bg-muted p-3 rounded text-sm">
                <pre>{JSON.stringify(testResults, null, 2)}</pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 危险操作 */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            危险操作
          </CardTitle>
          <CardDescription>
            这些操作会影响当前会话，请谨慎使用
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={clearStorage} 
            variant="destructive"
            className="w-full"
          >
            清除所有存储数据并刷新页面
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthDebug;
