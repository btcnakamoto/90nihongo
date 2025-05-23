import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    let data;
    try {
      const response = await api.post('/login', formData);
      data = response;
      login(data.token);
      console.log('本地token', localStorage.getItem('token'));
      toast({
        title: "登录成功",
        description: "欢迎回来！",
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "登录失败",
        description: error.response?.data?.message || "请检查您的邮箱和密码",
      });
      return;
    } finally {
      setIsLoading(false);
    }
    if (!data || !data.token) {
      toast({
        variant: "destructive",
        title: "登录失败",
        description: "服务器未返回 token，请联系管理员",
      });
      return;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>登录</CardTitle>
          <CardDescription>登录您的90天日语账号</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="请输入邮箱"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="请输入密码"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "登录中..." : "登录"}
            </Button>
            <div className="text-sm text-center text-gray-500">
              还没有账号？
              <Link to="/auth/register" className="text-primary hover:underline">
                立即注册
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 