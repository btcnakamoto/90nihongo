
import React, { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, BookOpen, Bell, FileText } from "lucide-react";

// 模拟内容数据
const mockContent = [
  { id: 1, title: "生活场景：餐厅点餐", type: "对话", level: "N4", status: "已发布", author: "张老师", updateDate: "2023-12-10" },
  { id: 2, title: "职场日语：自我介绍", type: "视频", level: "N3", status: "已发布", author: "李老师", updateDate: "2023-12-05" },
  { id: 3, title: "语法要点：て形的用法", type: "文章", level: "N5", status: "审核中", author: "王老师", updateDate: "2023-12-08" },
  { id: 4, title: "旅游场景：酒店入住", type: "对话", level: "N4", status: "草稿", author: "赵老师", updateDate: "2023-12-01" },
  { id: 5, title: "商务日语：会议用语", type: "文章", level: "N2", status: "已发布", author: "张老师", updateDate: "2023-12-09" },
  { id: 6, title: "日常表达：天气描述", type: "听力", level: "N5", status: "审核中", author: "李老师", updateDate: "2023-12-07" },
];

const contentTypes = ["全部", "对话", "视频", "文章", "听力", "练习"];
const contentLevels = ["全部", "N5", "N4", "N3", "N2", "N1"];
const contentStatus = ["全部", "已发布", "审核中", "草稿"];

const AdminContentManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredContent, setFilteredContent] = useState(mockContent);
  const [selectedType, setSelectedType] = useState("全部");
  const [selectedLevel, setSelectedLevel] = useState("全部");
  const [selectedStatus, setSelectedStatus] = useState("全部");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    filterContent();
  };

  const filterContent = () => {
    let results = mockContent;
    
    if (searchTerm) {
      results = results.filter(content => 
        content.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedType !== "全部") {
      results = results.filter(content => content.type === selectedType);
    }
    
    if (selectedLevel !== "全部") {
      results = results.filter(content => content.level === selectedLevel);
    }
    
    if (selectedStatus !== "全部") {
      results = results.filter(content => content.status === selectedStatus);
    }
    
    setFilteredContent(results);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar activePath="/admin/content" />
      
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-nihongo-darkBlue">内容管理</h1>
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
          <div className="mb-6 flex justify-between items-center">
            <div className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5 text-nihongo-indigo" />
              <h2 className="text-lg font-medium">内容库</h2>
            </div>
            
            <div className="flex space-x-4">
              <form onSubmit={handleSearch} className="flex items-center">
                <Input 
                  type="text" 
                  placeholder="搜索内容标题..." 
                  className="w-64 mr-2"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button type="submit" variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
              
              <Button variant="outline" className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                筛选
              </Button>
              
              <Button className="bg-nihongo-indigo hover:bg-nihongo-darkBlue">
                新建内容
              </Button>
            </div>
          </div>
          
          <div className="mb-4 flex space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-nihongo-gray">内容类型:</span>
              <div className="flex space-x-2">
                {contentTypes.map(type => (
                  <Button 
                    key={type}
                    variant={selectedType === type ? "default" : "outline"} 
                    size="sm"
                    className={selectedType === type ? "bg-nihongo-indigo" : ""}
                    onClick={() => {
                      setSelectedType(type);
                      setTimeout(filterContent, 0);
                    }}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-nihongo-gray">难度级别:</span>
              <div className="flex space-x-2">
                {contentLevels.map(level => (
                  <Button 
                    key={level}
                    variant={selectedLevel === level ? "default" : "outline"} 
                    size="sm"
                    className={selectedLevel === level ? "bg-nihongo-indigo" : ""}
                    onClick={() => {
                      setSelectedLevel(level);
                      setTimeout(filterContent, 0);
                    }}
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-nihongo-gray">状态:</span>
              <div className="flex space-x-2">
                {contentStatus.map(status => (
                  <Button 
                    key={status}
                    variant={selectedStatus === status ? "default" : "outline"} 
                    size="sm"
                    className={selectedStatus === status ? "bg-nihongo-indigo" : ""}
                    onClick={() => {
                      setSelectedStatus(status);
                      setTimeout(filterContent, 0);
                    }}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">ID</TableHead>
                  <TableHead className="w-[300px]">标题</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>级别</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建者</TableHead>
                  <TableHead>更新日期</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContent.map((content) => (
                  <TableRow key={content.id}>
                    <TableCell className="font-medium">{content.id}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4 text-nihongo-gray" />
                        {content.title}
                      </div>
                    </TableCell>
                    <TableCell>{content.type}</TableCell>
                    <TableCell>{content.level}</TableCell>
                    <TableCell>
                      <div className={`px-2 py-1 rounded-full text-xs inline-block ${
                        content.status === "已发布" ? "bg-green-100 text-green-800" : 
                        content.status === "审核中" ? "bg-yellow-100 text-yellow-800" : 
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {content.status}
                      </div>
                    </TableCell>
                    <TableCell>{content.author}</TableCell>
                    <TableCell>{content.updateDate}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">编辑</Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        删除
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-4 flex justify-between items-center text-sm text-nihongo-gray">
            <div>显示 1-6 个内容，共 6 个内容</div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled>上一页</Button>
              <Button variant="outline" size="sm" className="bg-nihongo-indigo text-white hover:bg-nihongo-darkBlue">1</Button>
              <Button variant="outline" size="sm" disabled>下一页</Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminContentManagement;
