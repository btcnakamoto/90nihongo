/**
 * 功能描述：分类管理页面
 * 输入参数：无
 * 返回值：React组件
 * 用途说明：管理学习内容的分类，包括课程分类、词汇分类等
 * 作者：nakamotochen
 * 创建时间：2024-12-19
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, FolderOpen } from "lucide-react";

interface Category {
  id: number;
  name: string;
  description: string;
  type: 'course' | 'vocabulary' | 'exercise';
  itemCount: number;
  createdAt: string;
}

const AdminCategoryManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  // 模拟数据
  const [categories] = useState<Category[]>([
    {
      id: 1,
      name: "日常会话",
      description: "日常生活中的基础对话内容",
      type: "course",
      itemCount: 25,
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      name: "商务日语",
      description: "职场和商务场景的日语表达",
      type: "course",
      itemCount: 18,
      createdAt: "2024-01-20"
    },
    {
      id: 3,
      name: "基础词汇",
      description: "N5-N3级别的基础词汇",
      type: "vocabulary",
      itemCount: 500,
      createdAt: "2024-01-10"
    },
    {
      id: 4,
      name: "听力练习",
      description: "各种场景的听力训练题目",
      type: "exercise",
      itemCount: 42,
      createdAt: "2024-01-25"
    }
  ]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'course': return 'bg-blue-100 text-blue-800';
      case 'vocabulary': return 'bg-green-100 text-green-800';
      case 'exercise': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'course': return '课程';
      case 'vocabulary': return '词汇';
      case 'exercise': return '练习';
      default: return '未知';
    }
  };

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || category.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">分类管理</h1>
          <p className="text-muted-foreground">
            管理学习内容的分类和组织结构
          </p>
        </div>
        <Button className="bg-nihongo-blue hover:bg-nihongo-darkBlue">
          <Plus className="mr-2 h-4 w-4" />
          新建分类
        </Button>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardHeader>
          <CardTitle>搜索和筛选</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索分类名称或描述..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md"
            >
              <option value="all">所有类型</option>
              <option value="course">课程</option>
              <option value="vocabulary">词汇</option>
              <option value="exercise">练习</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 分类列表 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCategories.map((category) => (
          <Card key={category.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-nihongo-blue" />
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </div>
                <Badge className={getTypeColor(category.type)}>
                  {getTypeName(category.type)}
                </Badge>
              </div>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">内容数量</span>
                  <span className="font-medium">{category.itemCount} 项</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">创建时间</span>
                  <span>{category.createdAt}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="mr-1 h-3 w-3" />
                    编辑
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">没有找到分类</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "没有匹配的分类，请尝试其他搜索条件" : "还没有创建任何分类"}
            </p>
            <Button className="bg-nihongo-blue hover:bg-nihongo-darkBlue">
              <Plus className="mr-2 h-4 w-4" />
              创建第一个分类
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminCategoryManagement;
