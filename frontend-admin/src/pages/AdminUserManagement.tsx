import React, { useState, useEffect, useMemo } from "react";
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
import { useToast } from "@/hooks/use-toast";
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
  Eye,
  UserCheck,
  UserX,
  Loader2
} from "lucide-react";

// 导入API服务和类型
import { 
  UserService, 
  type User, 
  type UserStats, 
  type UserListParams,
  type UserCreateData,
  type UserUpdateData,
  type PaginatedResponse
} from "@/services/userService";

const AdminUserManagement = () => {
  const { isCollapsed } = useSidebar();
  const { toast } = useToast();
  
  // 状态管理
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  
  // 分页和筛选状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [perPage] = useState(15);
  
  // 筛选参数
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // 加载用户列表
  const loadUsers = async (params?: Partial<UserListParams>) => {
    try {
      setLoading(true);
      
      const queryParams: UserListParams = {
        page: currentPage,
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder,
        ...params
      };

      if (searchTerm.trim()) {
        queryParams.search = searchTerm.trim();
      }
      
      if (statusFilter !== "all") {
        queryParams.status = statusFilter as any;
      }
      
      if (levelFilter !== "all") {
        queryParams.japanese_level = levelFilter as any;
      }

      const response = await UserService.getUsers(queryParams);
      
      if (response.success && response.data) {
        setUsers(response.data.data);
        setCurrentPage(response.data.current_page);
        setTotalPages(response.data.last_page);
        setTotalUsers(response.data.total);
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      console.error('加载用户列表失败:', error);
      toast({
        title: "加载失败",
        description: error.message || "获取用户列表失败",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 加载统计信息
  const loadStats = async () => {
    try {
      const response = await UserService.getUserStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error: any) {
      console.error('加载统计信息失败:', error);
    }
  };

  // 初始化数据
  useEffect(() => {
    loadUsers();
    loadStats();
  }, [currentPage, sortBy, sortOrder]);

  // 搜索和筛选变化时重新加载
  useEffect(() => {
    if (currentPage === 1) {
      loadUsers();
    } else {
      setCurrentPage(1);
    }
  }, [searchTerm, statusFilter, levelFilter]);

  // 查看用户详情
  const handleViewUser = async (user: User) => {
    try {
      const response = await UserService.getUser(user.id);
      if (response.success && response.data) {
        setSelectedUser(response.data);
        setIsUserDetailOpen(true);
      }
    } catch (error: any) {
      toast({
        title: "获取用户详情失败",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // 编辑用户
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditUserOpen(true);
  };

  // 删除用户
  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('确定要删除这个用户吗？此操作不可撤销。')) {
      return;
    }

    try {
      const response = await UserService.deleteUser(userId);
      if (response.success) {
        toast({
          title: "删除成功",
          description: "用户已成功删除",
        });
        loadUsers();
        loadStats();
      }
    } catch (error: any) {
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // 切换用户状态
  const handleToggleUserStatus = async (user: User) => {
    try {
      const response = await UserService.updateUser(user.id, { 
        is_active: !user.is_active 
      });
      
      if (response.success) {
        toast({
          title: "状态更新成功",
          description: `用户已${!user.is_active ? '激活' : '停用'}`,
        });
        loadUsers();
        loadStats();
      }
    } catch (error: any) {
      toast({
        title: "状态更新失败",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // 批量操作
  const handleBatchAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedUsers.length === 0) {
      toast({
        title: "请选择用户",
        description: "请先选择要操作的用户",
        variant: "destructive",
      });
      return;
    }

    const actionText = {
      activate: '激活',
      deactivate: '停用',
      delete: '删除'
    }[action];

    if (!window.confirm(`确定要${actionText}选中的 ${selectedUsers.length} 个用户吗？`)) {
      return;
    }

    try {
      const response = await UserService.batchAction({
        action,
        user_ids: selectedUsers
      });

      if (response.success) {
        toast({
          title: "批量操作成功",
          description: `已成功${actionText} ${selectedUsers.length} 个用户`,
        });
        setSelectedUsers([]);
        loadUsers();
        loadStats();
      }
    } catch (error: any) {
      toast({
        title: "批量操作失败",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // 选择用户
  const handleSelectUser = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // 全选/取消全选
  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  // 获取状态标记
  const getStatusBadge = (user: User) => {
    if (!user.is_active) {
      return <Badge variant="secondary">已停用</Badge>;
    }
    
    if (user.last_login_at) {
      const lastLoginDate = new Date(user.last_login_at);
      const daysSinceLogin = Math.floor((Date.now() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLogin <= 1) {
        return <Badge variant="default">活跃</Badge>;
      } else if (daysSinceLogin <= 7) {
        return <Badge variant="outline">一般</Badge>;
      } else {
        return <Badge variant="secondary">休眠</Badge>;
      }
    }
    
    return <Badge variant="outline">新用户</Badge>;
  };

  // 分页控制
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
          <Button variant="outline" size="sm" onClick={() => loadUsers()}>
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            刷新
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            导出数据
          </Button>
          <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-nihongo-indigo hover:bg-nihongo-darkBlue">
                <UserPlus className="h-4 w-4 mr-2" />
                添加用户
              </Button>
            </DialogTrigger>
            <CreateUserDialog 
              onSuccess={() => {
                setIsCreateUserOpen(false);
                loadUsers();
                loadStats();
              }}
            />
          </Dialog>
        </PageHeader>

        {/* 主要内容区域 */}
        <main className="flex-1 p-6 overflow-auto">
          {/* 统计卡片 */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">总用户数</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_users}</div>
                  <p className="text-xs text-muted-foreground">注册用户总数</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">活跃用户</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.active_users}</div>
                  <p className="text-xs text-muted-foreground">正常状态</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">停用用户</CardTitle>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.inactive_users}</div>
                  <p className="text-xs text-muted-foreground">已停用</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">今日新增</CardTitle>
                  <Activity className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.new_users_today}</div>
                  <p className="text-xs text-muted-foreground">本周 {stats.new_users_this_week}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">本月新增</CardTitle>
                  <GraduationCap className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.new_users_this_month}</div>
                  <p className="text-xs text-muted-foreground">月度增长</p>
                </CardContent>
              </Card>
            </div>
          )}
          
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
                      placeholder="搜索用户名、邮箱..." 
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
                      <SelectItem value="active">活跃</SelectItem>
                      <SelectItem value="inactive">停用</SelectItem>
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

                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setLevelFilter("all");
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
                    <Button size="sm" variant="outline" onClick={() => handleBatchAction('activate')}>
                      <UserCheck className="h-4 w-4 mr-1" />
                      批量激活
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBatchAction('deactivate')}>
                      <UserX className="h-4 w-4 mr-1" />
                      批量停用
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBatchAction('delete')}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      批量删除
              </Button>
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
                    显示 {((currentPage - 1) * perPage) + 1}-{Math.min(currentPage * perPage, totalUsers)} 项，共 {totalUsers} 项
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-nihongo-indigo" />
                  <span className="ml-2">加载中...</span>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">暂无用户数据</h3>
                  <p className="text-gray-500">没有找到符合条件的用户</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedUsers.length === users.length && users.length > 0}
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
                      {users.map((user) => (
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
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-gray-500">@{user.username}</div>
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
                              {user.email_verified_at && (
                                <div className="text-xs text-green-600">已验证邮箱</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-medium">
                              {user.japanese_level}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1 text-sm">
                              <div>学习 {user.learning_progress.current_day} 天</div>
                              <div>累计 {Math.floor(user.learning_progress.total_study_minutes / 60)} 小时</div>
                              <div>连续 {user.learning_progress.consecutive_days} 天</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(user)}
                          </TableCell>
                    <TableCell>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(user.created_at).toLocaleDateString('zh-CN')}
                              </div>
                              {user.last_login_at && (
                                <div className="text-gray-500">
                                  最后登录: {new Date(user.last_login_at).toLocaleDateString('zh-CN')}
                                </div>
                              )}
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
                                <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  编辑信息
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleUserStatus(user)}>
                                  {user.is_active ? (
                                    <>
                                      <Ban className="h-4 w-4 mr-2" />
                                      停用账户
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      激活账户
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => handleDeleteUser(user.id)}
                                >
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
              )}
              
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
                      onClick={() => handlePageChange(currentPage - 1)}
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
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
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
      {selectedUser && (
        <UserDetailDialog 
          user={selectedUser}
          open={isUserDetailOpen}
          onOpenChange={setIsUserDetailOpen}
        />
      )}

      {/* 编辑用户弹窗 */}
      {selectedUser && (
        <EditUserDialog 
          user={selectedUser}
          open={isEditUserOpen}
          onOpenChange={setIsEditUserOpen}
          onSuccess={() => {
            setIsEditUserOpen(false);
            loadUsers();
            loadStats();
          }}
        />
      )}
    </div>
  );
};

// 创建用户对话框组件
const CreateUserDialog = ({ onSuccess }: { onSuccess: () => void }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UserCreateData>({
    name: '',
    username: '',
    email: '',
    password: '',
    japanese_level: 'N3',
    daily_study_minutes: 60,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await UserService.createUser(formData);
      if (response.success) {
        toast({
          title: "用户创建成功",
          description: `用户 ${formData.name} 已成功创建`,
        });
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "创建失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>添加新用户</DialogTitle>
        <DialogDescription>
          创建一个新的用户账户
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">姓名</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">用户名</label>
          <Input
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">邮箱</label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">密码</label>
          <Input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
            minLength={8}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">日语水平</label>
          <Select 
            value={formData.japanese_level} 
            onValueChange={(value: any) => setFormData({...formData, japanese_level: value})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="N5">N5</SelectItem>
              <SelectItem value="N4">N4</SelectItem>
              <SelectItem value="N3">N3</SelectItem>
              <SelectItem value="N2">N2</SelectItem>
              <SelectItem value="N1">N1</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            创建用户
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

// 用户详情对话框组件
const UserDetailDialog = ({ 
  user, 
  open, 
  onOpenChange 
}: { 
  user: User; 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>用户详情</DialogTitle>
          <DialogDescription>
            查看用户的详细信息和学习数据
          </DialogDescription>
        </DialogHeader>
        
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
                <p className="text-sm text-gray-900">{user.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium">用户名</label>
                <p className="text-sm text-gray-900">@{user.username}</p>
              </div>
              <div>
                <label className="text-sm font-medium">邮箱</label>
                <p className="text-sm text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium">邮箱验证</label>
                <p className="text-sm text-gray-900">
                  {user.email_verified_at ? '已验证' : '未验证'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">日语水平</label>
                <p className="text-sm text-gray-900">{user.japanese_level}</p>
              </div>
              <div>
                <label className="text-sm font-medium">账户状态</label>
                <p className="text-sm text-gray-900">
                  {user.is_active ? '正常' : '已停用'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">注册时间</label>
                <p className="text-sm text-gray-900">
                  {new Date(user.created_at).toLocaleString('zh-CN')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">最后登录</label>
                <p className="text-sm text-gray-900">
                  {user.last_login_at 
                    ? new Date(user.last_login_at).toLocaleString('zh-CN')
                    : '从未登录'
                  }
                </p>
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
                    {user.learning_progress.current_day}
                  </div>
                  <p className="text-xs text-gray-500">90天计划</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">学习时长</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {Math.floor(user.learning_progress.total_study_minutes / 60)}h
                  </div>
                  <p className="text-xs text-gray-500">累计小时</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">连续天数</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {user.learning_progress.consecutive_days}
                  </div>
                  <p className="text-xs text-gray-500">连续学习</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">综合评分</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round((
                      user.learning_progress.listening_score +
                      user.learning_progress.speaking_score +
                      user.learning_progress.vocabulary_score +
                      user.learning_progress.grammar_score
                    ) / 4)}
                  </div>
                  <p className="text-xs text-gray-500">平均分数</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-sm">
                  <span>听力</span>
                  <span>{user.learning_progress.listening_score}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${user.learning_progress.listening_score}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>口语</span>
                  <span>{user.learning_progress.speaking_score}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${user.learning_progress.speaking_score}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>词汇</span>
                  <span>{user.learning_progress.vocabulary_score}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${user.learning_progress.vocabulary_score}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>语法</span>
                  <span>{user.learning_progress.grammar_score}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full" 
                    style={{ width: `${user.learning_progress.grammar_score}%` }}
                  ></div>
                </div>
              </div>
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
      </DialogContent>
    </Dialog>
  );
};

// 编辑用户对话框组件
const EditUserDialog = ({ 
  user, 
  open, 
  onOpenChange, 
  onSuccess 
}: { 
  user: User; 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  onSuccess: () => void;
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UserUpdateData>({
    name: user.name,
    username: user.username,
    email: user.email,
    japanese_level: user.japanese_level,
    daily_study_minutes: user.daily_study_minutes,
    is_active: user.is_active,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await UserService.updateUser(user.id, formData);
      if (response.success) {
        toast({
          title: "用户更新成功",
          description: `用户 ${formData.name} 信息已更新`,
        });
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "更新失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>编辑用户</DialogTitle>
          <DialogDescription>
            更新用户信息
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">姓名</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">用户名</label>
            <Input
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">邮箱</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">日语水平</label>
            <Select 
              value={formData.japanese_level} 
              onValueChange={(value: any) => setFormData({...formData, japanese_level: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="N5">N5</SelectItem>
                <SelectItem value="N4">N4</SelectItem>
                <SelectItem value="N3">N3</SelectItem>
                <SelectItem value="N2">N2</SelectItem>
                <SelectItem value="N1">N1</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">每日学习时间（分钟）</label>
            <Input
              type="number"
              min="15"
              max="480"
              value={formData.daily_study_minutes}
              onChange={(e) => setFormData({...formData, daily_study_minutes: parseInt(e.target.value)})}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({...formData, is_active: checked as boolean})}
            />
            <label className="text-sm font-medium">账户激活</label>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              更新用户
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminUserManagement;
