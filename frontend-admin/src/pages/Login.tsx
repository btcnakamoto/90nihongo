import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useNavigate } from "react-router-dom";
import { adminAuthApi } from "@/lib/api";

const Login: React.FC = () => {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const response = await adminAuthApi.login(account, password);
      
      if (response.success) {
        // 保存token和管理员信息
        login(response.token, response.admin);
        navigate("/admin"); // 跳转到管理端首页
      } else {
        setError(response.message || "登录失败");
      }
    } catch (err: any) {
      console.error('Login error:', err);
      
      // 处理不同类型的错误
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.errors?.account) {
        setError(err.response.data.errors.account[0]);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("登录失败，请检查网络连接");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-sm p-8 shadow-lg">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-nihongo-darkBlue mb-2">管理员登录</h2>
          <p className="text-sm text-nihongo-gray">
            <span className="text-nihongo-red font-bold">90</span>天日语管理系统
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="用户名或邮箱"
              value={account}
              onChange={e => setAccount(e.target.value)}
              required
              disabled={loading}
              className="w-full"
            />
          </div>
          
          <div>
            <Input
              type="password"
              placeholder="密码"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full"
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full bg-nihongo-indigo hover:bg-nihongo-darkBlue" 
            disabled={loading}
          >
            {loading ? "登录中..." : "登录"}
          </Button>
        </form>
        
        <div className="mt-6 text-center text-xs text-nihongo-gray">
          <p>仅限管理员访问</p>
        </div>
      </Card>
    </div>
  );
};

export default Login; 