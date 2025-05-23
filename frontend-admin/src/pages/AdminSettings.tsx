
import React, { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Bell, Settings, Shield, Globe, Moon, Sun, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminSettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // 网站基本设置
  const [siteName, setSiteName] = useState("90天日语");
  const [siteDescription, setSiteDescription] = useState("学习日语最高效的平台");
  const [siteLanguage, setSiteLanguage] = useState("zh-CN");
  
  // 通知设置
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [systemNotifications, setSystemNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  
  // 安全设置
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [passwordExpiry, setPasswordExpiry] = useState("never");
  const [sessionTimeout, setSessionTimeout] = useState("30");
  
  // 界面设置
  const [theme, setTheme] = useState("light");
  const [itemsPerPage, setItemsPerPage] = useState("10");
  
  // 保存设置
  const handleSave = (section: string) => {
    setIsLoading(true);
    
    // 模拟保存操作
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "设置已保存",
        description: `${section}设置已成功更新`,
      });
    }, 800);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar activePath="/admin/settings" />
      
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-nihongo-darkBlue">系统设置</h1>
            <div className="flex items-center space-x-4">
              <button className="text-nihongo-gray hover:text-nihongo-darkBlue p-2 rounded-full hover:bg-gray-100 transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <div className="w-10 h-10 rounded-full bg-nihongo-indigo flex items-center justify-center text-white font-medium">
                A
              </div>
            </div>
          </div>
        </header>
        
        <main className="px-8 py-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                基本设置
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                通知设置
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                安全设置
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Moon className="h-4 w-4" />
                界面设置
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>基本设置</CardTitle>
                  <CardDescription>
                    配置您的网站基本信息和显示内容
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="siteName">网站名称</Label>
                      <Input 
                        id="siteName" 
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                        placeholder="输入网站名称"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="siteDescription">网站描述</Label>
                      <Input 
                        id="siteDescription" 
                        value={siteDescription}
                        onChange={(e) => setSiteDescription(e.target.value)}
                        placeholder="简短描述您的网站"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="siteLanguage">默认语言</Label>
                      <Select value={siteLanguage} onValueChange={setSiteLanguage}>
                        <SelectTrigger id="siteLanguage">
                          <SelectValue placeholder="选择默认语言" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="zh-CN">简体中文</SelectItem>
                          <SelectItem value="zh-TW">繁體中文</SelectItem>
                          <SelectItem value="en-US">English (US)</SelectItem>
                          <SelectItem value="ja-JP">日本語</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={() => handleSave("基本")} disabled={isLoading}>
                    {isLoading ? "保存中..." : "保存设置"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>通知设置</CardTitle>
                  <CardDescription>
                    管理系统通知和电子邮件提醒
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="emailNotifications">电子邮件通知</Label>
                        <p className="text-sm text-muted-foreground">
                          接收重要事件的电子邮件通知
                        </p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="systemNotifications">系统通知</Label>
                        <p className="text-sm text-muted-foreground">
                          在系统内显示通知提醒
                        </p>
                      </div>
                      <Switch
                        id="systemNotifications"
                        checked={systemNotifications}
                        onCheckedChange={setSystemNotifications}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="marketingEmails">营销邮件</Label>
                        <p className="text-sm text-muted-foreground">
                          接收产品更新和营销信息
                        </p>
                      </div>
                      <Switch
                        id="marketingEmails"
                        checked={marketingEmails}
                        onCheckedChange={setMarketingEmails}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={() => handleSave("通知")} disabled={isLoading}>
                    {isLoading ? "保存中..." : "保存设置"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>安全设置</CardTitle>
                  <CardDescription>
                    管理账户安全和登录选项
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="twoFactorAuth">双重认证</Label>
                        <p className="text-sm text-muted-foreground">
                          启用两步验证以增强账户安全
                        </p>
                      </div>
                      <Switch
                        id="twoFactorAuth"
                        checked={twoFactorAuth}
                        onCheckedChange={setTwoFactorAuth}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="grid gap-2">
                      <Label htmlFor="passwordExpiry">密码过期时间</Label>
                      <Select value={passwordExpiry} onValueChange={setPasswordExpiry}>
                        <SelectTrigger id="passwordExpiry">
                          <SelectValue placeholder="选择密码过期时间" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="never">永不过期</SelectItem>
                          <SelectItem value="30days">30天</SelectItem>
                          <SelectItem value="60days">60天</SelectItem>
                          <SelectItem value="90days">90天</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="sessionTimeout">会话超时（分钟）</Label>
                      <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                        <SelectTrigger id="sessionTimeout">
                          <SelectValue placeholder="选择会话超时时间" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15分钟</SelectItem>
                          <SelectItem value="30">30分钟</SelectItem>
                          <SelectItem value="60">60分钟</SelectItem>
                          <SelectItem value="120">120分钟</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={() => handleSave("安全")} disabled={isLoading}>
                    {isLoading ? "保存中..." : "保存设置"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>界面设置</CardTitle>
                  <CardDescription>
                    自定义系统界面和显示偏好
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label>主题模式</Label>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant={theme === "light" ? "default" : "outline"}
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => setTheme("light")}
                        >
                          <Sun className="h-4 w-4" />
                          亮色模式
                        </Button>
                        <Button
                          variant={theme === "dark" ? "default" : "outline"}
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => setTheme("dark")}
                        >
                          <Moon className="h-4 w-4" />
                          暗色模式
                        </Button>
                        <Button
                          variant={theme === "system" ? "default" : "outline"}
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => setTheme("system")}
                        >
                          <Globe className="h-4 w-4" />
                          跟随系统
                        </Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid gap-2">
                      <Label htmlFor="itemsPerPage">每页显示条目数</Label>
                      <Select value={itemsPerPage} onValueChange={setItemsPerPage}>
                        <SelectTrigger id="itemsPerPage">
                          <SelectValue placeholder="选择每页显示条目数" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10条/页</SelectItem>
                          <SelectItem value="20">20条/页</SelectItem>
                          <SelectItem value="50">50条/页</SelectItem>
                          <SelectItem value="100">100条/页</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={() => handleSave("界面")} disabled={isLoading}>
                    {isLoading ? "保存中..." : "保存设置"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default AdminSettings;
