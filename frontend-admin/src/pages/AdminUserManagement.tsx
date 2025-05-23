
import React, { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Users, Bell } from "lucide-react";

// 模拟用户数据
const mockUsers = [
  { id: 1, name: "张三", email: "zhangsan@example.com", level: "N3", registerDate: "2023-10-12", status: "活跃" },
  { id: 2, name: "李四", email: "lisi@example.com", level: "N4", registerDate: "2023-09-05", status: "活跃" },
  { id: 3, name: "王五", email: "wangwu@example.com", level: "N2", registerDate: "2023-11-20", status: "休眠" },
  { id: 4, name: "赵六", email: "zhaoliu@example.com", level: "N3", registerDate: "2023-10-30", status: "活跃" },
  { id: 5, name: "陈七", email: "chenqi@example.com", level: "N5", registerDate: "2023-12-01", status: "新注册" },
  { id: 6, name: "黄八", email: "huangba@example.com", level: "N4", registerDate: "2023-08-15", status: "休眠" },
];

const AdminUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(mockUsers);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const results = mockUsers.filter(
      user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(results);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar activePath="/admin/users" />
      
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-nihongo-darkBlue">用户管理</h1>
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
              <Users className="mr-2 h-5 w-5 text-nihongo-indigo" />
              <h2 className="text-lg font-medium">用户列表</h2>
            </div>
            
            <div className="flex space-x-4">
              <form onSubmit={handleSearch} className="flex items-center">
                <Input 
                  type="text" 
                  placeholder="搜索用户名或邮箱..." 
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
                添加用户
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>用户名</TableHead>
                  <TableHead>邮箱</TableHead>
                  <TableHead>日语水平</TableHead>
                  <TableHead>注册日期</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.level}</TableCell>
                    <TableCell>{user.registerDate}</TableCell>
                    <TableCell>
                      <div className={`px-2 py-1 rounded-full text-xs inline-block ${
                        user.status === "活跃" ? "bg-green-100 text-green-800" : 
                        user.status === "休眠" ? "bg-gray-100 text-gray-800" : 
                        "bg-blue-100 text-blue-800"
                      }`}>
                        {user.status}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">编辑</Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        禁用
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-4 flex justify-between items-center text-sm text-nihongo-gray">
            <div>显示 1-6 个用户，共 6 个用户</div>
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

export default AdminUserManagement;
