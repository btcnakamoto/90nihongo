/**
 * 系统设置页面
 * 
 * 功能描述：管理系统的各种配置选项
 * 输入参数：无
 * 返回值：React组件
 * 用途说明：提供系统设置的用户界面，支持分组管理和实时保存
 * 作者：nakamotochen
 * 创建时间：2024-01-21
 */

import React, { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bell, Settings, Shield, Globe, Moon, Sun, MessageSquare, Loader2, AlertCircle, CheckCircle2, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import settingsService, { AllSettings, SettingsGroup, SettingItem } from "@/services/settingsService";
import { useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";

const AdminSettings = () => {
  const { toast } = useToast();
  const { isCollapsed } = useSidebar();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allSettings, setAllSettings] = useState<AllSettings>({});
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState("general");

  // 设置分组配置
  const settingGroups = [
    { key: 'general', label: '基本设置', icon: Settings, description: '网站基本信息和显示内容' },
    { key: 'notification', label: '通知设置', icon: Bell, description: '系统通知和电子邮件提醒' },
    { key: 'security', label: '安全设置', icon: Shield, description: '安全策略和访问控制' },
    { key: 'appearance', label: '界面设置', icon: Moon, description: '界面主题和显示选项' },
  ];

  // 加载设置数据
  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('开始加载设置数据...');
      const settings = await settingsService.getAllSettings();
      console.log('获取到的设置数据:', settings);
      
      setAllSettings(settings);
      
      // 初始化表单数据
      const initialFormData: Record<string, any> = {};
      Object.keys(settings).forEach(group => {
        Object.keys(settings[group]).forEach(key => {
          initialFormData[key] = settings[group][key].value;
        });
      });
      setFormData(initialFormData);
      console.log('初始化表单数据:', initialFormData);
    } catch (err: any) {
      console.error('加载设置失败:', err);
      setError(err.message);
      toast({
        title: "加载失败",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 保存设置
  const handleSave = async (group: string) => {
    try {
      setIsSaving(true);
      
      // 获取该分组的设置数据
      const groupSettings: Record<string, any> = {};
      if (allSettings[group]) {
        Object.keys(allSettings[group]).forEach(key => {
          groupSettings[key] = formData[key];
        });
      }

      const result = await settingsService.updateGroupSettings(group, groupSettings);
      
      toast({
        title: "保存成功",
        description: `成功更新 ${result.updated.length} 个设置项`,
      });

      // 重新加载设置以确保数据同步
      await loadSettings();
    } catch (err: any) {
      toast({
        title: "保存失败",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 重置设置
  const handleReset = async (group?: string) => {
    try {
      setIsResetting(true);
      await settingsService.resetSettings(group);
      
      toast({
        title: "重置成功",
        description: group ? `${group} 分组设置已重置为默认值` : "所有设置已重置为默认值",
      });

      // 重新加载设置
      await loadSettings();
    } catch (err: any) {
      toast({
        title: "重置失败",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  // 更新表单数据
  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 渲染设置项
  const renderSettingItem = (key: string, setting: SettingItem) => {
    const value = formData[key];

    switch (setting.type) {
      case 'boolean':
        return (
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor={key}>{setting.label}</Label>
              {setting.description && (
                <p className="text-sm text-muted-foreground">
                  {setting.description}
                </p>
              )}
            </div>
            <Switch
              id={key}
              checked={Boolean(value)}
              onCheckedChange={(checked) => updateFormData(key, checked)}
            />
          </div>
        );

      case 'integer':
        if (setting.options?.allowed_values) {
          return (
            <div className="grid gap-2">
              <Label htmlFor={key}>{setting.label}</Label>
              {setting.description && (
                <p className="text-sm text-muted-foreground">
                  {setting.description}
                </p>
              )}
              <Select value={String(value)} onValueChange={(val) => updateFormData(key, parseInt(val))}>
                <SelectTrigger id={key}>
                  <SelectValue placeholder={`选择${setting.label}`} />
                </SelectTrigger>
                <SelectContent>
                  {setting.options.allowed_values.map((option: string) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }
        return (
          <div className="grid gap-2">
            <Label htmlFor={key}>{setting.label}</Label>
            {setting.description && (
              <p className="text-sm text-muted-foreground">
                {setting.description}
              </p>
            )}
            <Input
              id={key}
              type="number"
              value={value || ''}
              onChange={(e) => updateFormData(key, parseInt(e.target.value) || 0)}
              placeholder={`输入${setting.label}`}
            />
          </div>
        );

      case 'string':
        if (setting.options?.allowed_values) {
          return (
            <div className="grid gap-2">
              <Label htmlFor={key}>{setting.label}</Label>
              {setting.description && (
                <p className="text-sm text-muted-foreground">
                  {setting.description}
                </p>
              )}
              <Select value={value} onValueChange={(val) => updateFormData(key, val)}>
                <SelectTrigger id={key}>
                  <SelectValue placeholder={`选择${setting.label}`} />
                </SelectTrigger>
                <SelectContent>
                  {setting.options.allowed_values.map((option: string) => (
                    <SelectItem key={option} value={option}>
                      {getLanguageLabel(option) || option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }
        return (
          <div className="grid gap-2">
            <Label htmlFor={key}>{setting.label}</Label>
            {setting.description && (
              <p className="text-sm text-muted-foreground">
                {setting.description}
              </p>
            )}
            <Input
              id={key}
              value={value || ''}
              onChange={(e) => updateFormData(key, e.target.value)}
              placeholder={`输入${setting.label}`}
            />
          </div>
        );

      default:
        return (
          <div className="grid gap-2">
            <Label htmlFor={key}>{setting.label}</Label>
            {setting.description && (
              <p className="text-sm text-muted-foreground">
                {setting.description}
              </p>
            )}
            <Input
              id={key}
              value={value || ''}
              onChange={(e) => updateFormData(key, e.target.value)}
              placeholder={`输入${setting.label}`}
            />
          </div>
        );
    }
  };

  // 获取语言标签
  const getLanguageLabel = (code: string) => {
    const labels: Record<string, string> = {
      'zh-CN': '简体中文',
      'zh-TW': '繁體中文',
      'en-US': 'English (US)',
      'ja-JP': '日本語',
    };
    return labels[code];
  };

  // 渲染设置分组
  const renderSettingsGroup = (groupKey: string) => {
    const group = allSettings[groupKey];
    const groupConfig = settingGroups.find(g => g.key === groupKey);
    
    if (!group || !groupConfig) {
      return (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              暂无 {groupConfig?.label || groupKey} 设置项
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <groupConfig.icon className="h-5 w-5" />
            {groupConfig.label}
          </CardTitle>
          <CardDescription>
            {groupConfig.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {Object.entries(group).map(([key, setting], index) => (
              <div key={key}>
                {renderSettingItem(key, setting)}
                {index < Object.entries(group).length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => handleReset(groupKey)}
            disabled={isResetting}
            className="flex items-center gap-2"
          >
            {isResetting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            重置为默认值
          </Button>
          <Button 
            onClick={() => handleSave(groupKey)} 
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {isSaving ? "保存中..." : "保存设置"}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  useEffect(() => {
    loadSettings();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar activePath="/admin/settings" />
        <div className={cn("main-content flex-1 flex items-center justify-center", isCollapsed && "collapsed")}>
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>加载设置中...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar activePath="/admin/settings" />
      
      <div className={cn("main-content flex-1 overflow-auto", isCollapsed && "collapsed")}>
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
          {error && (
            <Alert className="mb-6" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2"
                  onClick={loadSettings}
                >
                  重试
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              {settingGroups.map(group => (
                <TabsTrigger key={group.key} value={group.key} className="flex items-center gap-2">
                  <group.icon className="h-4 w-4" />
                  {group.label}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {settingGroups.map(group => (
              <TabsContent key={group.key} value={group.key}>
                {renderSettingsGroup(group.key)}
              </TabsContent>
            ))}
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default AdminSettings;