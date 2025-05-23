import React, { useState, useMemo } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import TopNavbar from "@/components/admin/TopNavbar";
import PageHeader from "@/components/admin/PageHeader";
import { useSidebar } from "@/contexts/SidebarContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { 
  Search, 
  Filter, 
  Users, 
  UserPlus,
  MoreHorizontal,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  AlertCircle,
  Calendar,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Activity,
  Download,
  Upload,
  RefreshCw,
  Eye
} from "lucide-react";

// 用户类型定义
interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  level: string;
  registerDate: string;
  lastLoginDate: string;
  status: "活跃" | "休眠" | "新注册" | "已禁用";
  avatar?: string;
  location?: string;
  studyDays: number;
  completedLessons: number;
  points: number;
  isVip: boolean;
}

// 模拟用户数据
const mockUsers: User[] = [
  { 
    id: 1, 
    name: "张三", 
    email: "zhangsan@example.com", 
    phone: "13800138001",
    level: "N3", 
    registerDate: "2023-10-12", 
    lastLoginDate: "2024-01-15",
    status: "活跃",
    location: "北京",
    studyDays: 45,
    completedLessons: 128,
    points: 2500,
    isVip: true
  },
  { 
    id: 2, 
    name: "李四", 
    email: "lisi@example.com", 
    phone: "13900139002",
    level: "N4", 
    registerDate: "2023-09-05", 
    lastLoginDate: "2024-01-14",
    status: "活跃",
    location: "上海",
    studyDays: 60,
    completedLessons: 95,
    points: 1800,
    isVip: false
  },
  { 
    id: 3, 
    name: "王五", 
    email: "wangwu@example.com", 
    level: "N2", 
    registerDate: "2023-11-20", 
    lastLoginDate: "2023-12-25",
    status: "休眠",
    location: "广州",
    studyDays: 30,
    completedLessons: 156,
    points: 3200,
    isVip: true
  },
  { 
    id: 4, 
    name: "赵六", 
    email: "zhaoliu@example.com", 
    phone: "13700137004",
    level: "N3", 
    registerDate: "2023-10-30", 
    lastLoginDate: "2024-01-13",
    status: "活跃",
    location: "深圳",
    studyDays: 25,
    completedLessons: 78,
    points: 1500,
    isVip: false
  },
  { 
    id: 5, 
    name: "陈七", 
    email: "chenqi@example.com", 
    level: "N5", 
    registerDate: "2024-01-01", 
    lastLoginDate: "2024-01-15",
    status: "新注册",
    location: "杭州",
    studyDays: 15,
    completedLessons: 25,
    points: 500,
    isVip: false
  },
  { 
    id: 6, 
    name: "黄八", 
    email: "huangba@example.com", 
    level: "N4", 
    registerDate: "2023-08-15", 
    lastLoginDate: "2023-11-30",
    status: "休眠",
    location: "成都",
    studyDays: 40,
    completedLessons: 67,
    points: 1200,
    isVip: false
  },
  { 
    id: 7, 
    name: "刘九", 
    email: "liujiu@example.com", 
    level: "N1", 
    registerDate: "2023-06-10", 
    lastLoginDate: "2024-01-10",
    status: "活跃",
    location: "南京",
    studyDays: 180,
    completedLessons: 320,
    points: 8500,
    isVip: true
  },
  { 
    id: 8, 
    name: "吴十", 
    email: "wushi@example.com", 
    level: "N2", 
    registerDate: "2023-12-01", 
    lastLoginDate: "2024-01-12",
    status: "已禁用",
    location: "武汉",
    studyDays: 20,
    completedLessons: 45,
    points: 800,
    isVip: false
  }
];

const AdminUserManagement = () => {
  const { isCollapsed } = useSidebar();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [vipFilter, setVipFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>("registerDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  const pageSize = 10;

  // 筛选和搜索用户
  const filteredUsers = useMemo(() => {
    let filtered = mockUsers.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      const matchesLevel = levelFilter === "all" || user.level === levelFilter;
      const matchesVip = vipFilter === "all" || 
                        (vipFilter === "vip" && user.isVip) || 
                        (vipFilter === "normal" && !user.isVip);
      
      return matchesSearch && matchesStatus && matchesLevel && matchesVip;
    });

    // 排序
    filtered.sort((a, b) => {
      let aValue = a[sortBy as keyof User];
      let bValue = b[sortBy as keyof User];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }
      
      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [searchTerm, statusFilter, levelFilter, vipFilter, sortBy, sortOrder]);

  // 分页
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // 统计数据
  const stats = useMemo(() => {
    const total = mockUsers.length;
    const active = mockUsers.filter(u => u.status === "活跃").length;
    const dormant = mockUsers.filter(u => u.status === "休眠").length;
    const newUsers = mockUsers.filter(u => u.status === "新注册").length;
    const vipUsers = mockUsers.filter(u => u.isVip).length;
    
    return { total, active, dormant, newUsers, vipUsers };
  }, []);

  const handleSelectUser = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map(user => user.id));
    }
  };

  const getStatusBadge = (status: User['status']) => {
    const variants = {
      "活跃": "default",
      "休眠": "secondary", 
      "新注册": "outline",
      "已禁用": "destructive"
    } as const;
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsUserDetailOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar activePath="/admin/users" />
      
      <div className={cn(
        "main-content flex-1 flex flex-col transition-all duration-300",
        isCollapsed && "collapsed"
      )}>
        {/* 统一顶部导航栏 */}
        <TopNavbar />
        
        {/* 页面标题区域 */}
        <PageHeader 
          title="用户管理" 
          description="管理平台用户账户和权限"
        >
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            导出数据
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            导入用户
          </Button>
          <Button size="sm" className="bg-nihongo-indigo hover:bg-nihongo-darkBlue">
            <UserPlus className="h-4 w-4 mr-2" />
            添加用户
          </Button>
        </PageHeader>

        {/* 主要内容区域 */}
        <main className="flex-1 p-6 overflow-auto">
          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总用户数</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">+12% 较上月</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">活跃用户</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active}</div>
                <p className="text-xs text-muted-foreground">+8% 较上月</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">休眠用户</CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.dormant}</div>
                <p className="text-xs text-muted-foreground">-3% 较上月</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">新注册</CardTitle>
                <Activity className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.newUsers}</div>
                <p className="text-xs text-muted-foreground">+25% 较上月</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">VIP用户</CardTitle>
                <GraduationCap className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.vipUsers}</div>
                <p className="text-xs text-muted-foreground">+15% 较上月</p>
              </CardContent>
            </Card>
          </div>

          {/* 筛选和搜索区域 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">筛选和搜索</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[300px]">
                  <label className="text-sm font-medium mb-2 block">搜索用户</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="搜索用户名或邮箱..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">状态</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部状态</SelectItem>
                      <SelectItem value="活跃">活跃</SelectItem>
                      <SelectItem value="休眠">休眠</SelectItem>
                      <SelectItem value="新注册">新注册</SelectItem>
                      <SelectItem value="已禁用">已禁用</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">日语水平</label>
                  <Select value={levelFilter} onValueChange={setLevelFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部水平</SelectItem>
                      <SelectItem value="N1">N1</SelectItem>
                      <SelectItem value="N2">N2</SelectItem>
                      <SelectItem value="N3">N3</SelectItem>
                      <SelectItem value="N4">N4</SelectItem>
                      <SelectItem value="N5">N5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">会员类型</label>
                  <Select value={vipFilter} onValueChange={setVipFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部用户</SelectItem>
                      <SelectItem value="vip">VIP用户</SelectItem>
                      <SelectItem value="normal">普通用户</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setLevelFilter("all");
                    setVipFilter("all");
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重置
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 批量操作栏 */}
          {selectedUsers.length > 0 && (
            <Card className="mb-4 border-blue-200 bg-blue-50">
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    已选择 {selectedUsers.length} 个用户
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">批量导出</Button>
                    <Button size="sm" variant="outline">批量禁用</Button>
                    <Button size="sm" variant="outline">批量启用</Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedUsers([])}
                    >
                      取消选择
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 用户表格 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>用户列表</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    显示 {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, filteredUsers.length)} 项，共 {filteredUsers.length} 项
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>用户信息</TableHead>
                      <TableHead>联系方式</TableHead>
                      <TableHead>日语水平</TableHead>
                      <TableHead>学习数据</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>注册时间</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={() => handleSelectUser(user.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-nihongo-indigo to-nihongo-blue flex items-center justify-center text-white font-medium text-sm">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {user.name}
                                {user.isVip && (
                                  <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                                    VIP
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">ID: {user.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Phone className="h-3 w-3" />
                                {user.phone}
                              </div>
                            )}
                            {user.location && (
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <MapPin className="h-3 w-3" />
                                {user.location}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium">
                            {user.level}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div>学习 {user.studyDays} 天</div>
                            <div>完成 {user.completedLessons} 课</div>
                            <div className="text-nihongo-indigo font-medium">{user.points} 积分</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(user.status)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {user.registerDate}
                            </div>
                            <div className="text-gray-500">
                              最后登录: {user.lastLoginDate}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewUser(user)}>
                                <Eye className="h-4 w-4 mr-2" />
                                查看详情
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                编辑信息
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Ban className="h-4 w-4 mr-2" />
                                {user.status === "已禁用" ? "启用账户" : "禁用账户"}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                删除用户
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* 分页 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    第 {currentPage} 页，共 {totalPages} 页
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                      上一页
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                      下一页
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* 用户详情弹窗 */}
      <Dialog open={isUserDetailOpen} onOpenChange={setIsUserDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>用户详情</DialogTitle>
            <DialogDescription>
              查看用户的详细信息和学习数据
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">基本信息</TabsTrigger>
                <TabsTrigger value="study">学习数据</TabsTrigger>
                <TabsTrigger value="activity">活动记录</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">用户名</label>
                    <p className="text-sm text-gray-900">{selectedUser.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">邮箱</label>
                    <p className="text-sm text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">手机号</label>
                    <p className="text-sm text-gray-900">{selectedUser.phone || "未填写"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">地区</label>
                    <p className="text-sm text-gray-900">{selectedUser.location || "未填写"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">日语水平</label>
                    <p className="text-sm text-gray-900">{selectedUser.level}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">会员状态</label>
                    <p className="text-sm text-gray-900">{selectedUser.isVip ? "VIP用户" : "普通用户"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">账户状态</label>
                    <div className="mt-1">{getStatusBadge(selectedUser.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">注册时间</label>
                    <p className="text-sm text-gray-900">{selectedUser.registerDate}</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="study" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">学习天数</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-nihongo-indigo">
                        {selectedUser.studyDays}
                      </div>
                      <p className="text-xs text-gray-500">连续学习</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">完成课程</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {selectedUser.completedLessons}
                      </div>
                      <p className="text-xs text-gray-500">已完成</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">积分总数</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-600">
                        {selectedUser.points}
                      </div>
                      <p className="text-xs text-gray-500">累计获得</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">最后登录</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm font-medium">
                        {selectedUser.lastLoginDate}
                      </div>
                      <p className="text-xs text-gray-500">最近活动</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="activity" className="space-y-4">
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>活动记录功能开发中...</p>
                  <p className="text-sm">将显示用户的登录记录、学习轨迹等信息</p>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUserManagement;
