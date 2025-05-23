import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    japanese_level: 'N3',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.password_confirmation) {
      toast({
        variant: "destructive",
        title: "密码不匹配",
        description: "请确保两次输入的密码相同",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/register', formData);
      toast({
        title: "注册成功",
        description: "请使用您的账号密码登录",
      });
      navigate('/auth/login');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "注册失败",
        description: error.response?.data?.message || "请检查您的输入信息",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>注册</CardTitle>
          <CardDescription>创建您的90天日语账号</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                placeholder="请输入用户名"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="password_confirmation">确认密码</Label>
              <Input
                id="password_confirmation"
                type="password"
                placeholder="请再次输入密码"
                value={formData.password_confirmation}
                onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="japanese_level">日语水平</Label>
              <Select
                value={formData.japanese_level}
                onValueChange={(value) => setFormData({ ...formData, japanese_level: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择您的日语水平" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="N5">N5 (初级)</SelectItem>
                  <SelectItem value="N4">N4 (基础)</SelectItem>
                  <SelectItem value="N3">N3 (中级)</SelectItem>
                  <SelectItem value="N2">N2 (高级)</SelectItem>
                  <SelectItem value="N1">N1 (精通)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "注册中..." : "注册"}
            </Button>
            <div className="text-sm text-center text-gray-500">
              已有账号？
              <Link to="/auth/login" className="text-primary hover:underline">
                立即登录
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 