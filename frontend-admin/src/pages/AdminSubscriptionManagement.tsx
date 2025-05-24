import { useState, useEffect } from 'react';import { useSidebar } from '@/contexts/SidebarContext';import { cn } from '@/lib/utils';import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import {
  BarChart3,
  Users,
  TrendingUp,
  CreditCard,
  Star,
  AlertTriangle,
  Gift,
  Edit,
  RefreshCw
} from 'lucide-react';
import { 
  SubscriptionService, 
  SubscriptionStats, 
  SubscriptionPlan, 
  User, 
  UpdateSubscriptionData,
  BatchUpdateSubscriptionData
} from '@/services/subscriptionService';
import AdminSidebar from '@/components/admin/AdminSidebar';
import TopNavbar from '@/components/admin/TopNavbar';
import PageHeader from '@/components/admin/PageHeader';
import StatsCard from '@/components/admin/StatsCard';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdminSubscriptionManagement = () => {  const { isCollapsed } = useSidebar();  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [expiringUsers, setExpiringUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [filterDays, setFilterDays] = useState('7');
  const [currentPage, setCurrentPage] = useState(1);

  // 批量更新表单状态
  const [batchForm, setBatchForm] = useState<BatchUpdateSubscriptionData>({
    user_ids: [],
    subscription_type: 'monthly',
    duration_days: undefined
  });

  // 单个编辑表单状态
  const [editForm, setEditForm] = useState<UpdateSubscriptionData>({
    subscription_type: 'monthly',
    duration_days: undefined
  });

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadExpiringUsers();
  }, [filterDays, currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, plansRes] = await Promise.all([
        SubscriptionService.getStats(),
        SubscriptionService.getPlans()
      ]);

      if (statsRes.success) {
        setStats(statsRes.data!);
      }

      if (plansRes.success) {
        setPlans(plansRes.data!);
      }
    } catch (error: any) {
      toast({
        title: '加载失败',
        description: error.message || '加载数据时发生错误',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadExpiringUsers = async () => {
    try {
      const response = await SubscriptionService.getExpiringSubscriptions({
        days: parseInt(filterDays),
        page: currentPage,
        per_page: 20
      });

      if (response.success) {
        setExpiringUsers(response.data!.data);
      }
    } catch (error: any) {
      toast({
        title: '加载失败',
        description: error.message || '加载即将到期用户失败',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateUserSubscription = async () => {
    if (!editingUser) return;

    try {
      const response = await SubscriptionService.updateUserSubscription(
        editingUser.id,
        editForm
      );

      if (response.success) {
        toast({
          title: '更新成功',
          description: '用户订阅已更新',
        });
        setEditDialogOpen(false);
        setEditingUser(null);
        loadExpiringUsers();
        loadData();
      }
    } catch (error: any) {
      toast({
        title: '更新失败',
        description: error.message || '更新用户订阅失败',
        variant: 'destructive',
      });
    }
  };

  const handleBatchUpdate = async () => {
    if (selectedUsers.length === 0) {
      toast({
        title: '请选择用户',
        description: '请至少选择一个用户进行批量操作',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await SubscriptionService.batchUpdateSubscription({
        ...batchForm,
        user_ids: selectedUsers
      });

      if (response.success) {
        toast({
          title: '批量更新成功',
          description: `成功更新 ${response.data!.affected_count} 个用户的订阅`,
        });
        setBatchDialogOpen(false);
        setSelectedUsers([]);
        loadExpiringUsers();
        loadData();
      }
    } catch (error: any) {
      toast({
        title: '批量更新失败',
        description: error.message || '批量更新订阅失败',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setEditForm({
      subscription_type: user.subscription_type,
      duration_days: undefined
    });
    setEditDialogOpen(true);
  };

  const openBatchDialog = () => {
    setBatchForm({
      user_ids: selectedUsers,
      subscription_type: 'monthly',
      duration_days: undefined
    });
    setBatchDialogOpen(true);
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    setSelectedUsers(expiringUsers.map(user => user.id));
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const getSubscriptionTypeBadge = (type: string) => {
    const colors = {
      free: 'secondary',
      monthly: 'default',
      quarterly: 'default',
      yearly: 'default',
      lifetime: 'default'
    } as const;

    const labels = {
      free: '免费',
      monthly: '月付',
      quarterly: '季付',
      yearly: '年付',
      lifetime: '终身'
    };

    return (
      <Badge variant={colors[type as keyof typeof colors] || 'default'}>
        {labels[type as keyof typeof labels] || type}
      </Badge>
    );
  };

  // 构建图表数据
  const pieChartData = stats ? [
    { name: '免费用户', value: stats.free_users, color: COLORS[0] },
    { name: '月付用户', value: stats.monthly_users, color: COLORS[1] },
    { name: '季付用户', value: stats.quarterly_users, color: COLORS[2] },
    { name: '年付用户', value: stats.yearly_users, color: COLORS[3] },
    { name: '终身用户', value: stats.lifetime_users, color: COLORS[4] },
  ].filter(item => item.value > 0) : [];

    if (loading) {    return (      <div className="flex min-h-screen bg-gray-50">        <AdminSidebar activePath="/admin/subscriptions" />        <div className={cn(          "main-content flex-1 flex flex-col transition-all duration-300",          isCollapsed && "collapsed"        )}>          <TopNavbar />          <main className="flex-1 p-6 overflow-auto">            <div className="flex items-center justify-center h-64">              <RefreshCw className="h-8 w-8 animate-spin" />            </div>          </main>        </div>      </div>    );  }

    return (    <div className="flex min-h-screen bg-gray-50">      <AdminSidebar activePath="/admin/subscriptions" />      <div className={cn(        "main-content flex-1 flex flex-col transition-all duration-300",        isCollapsed && "collapsed"      )}>        <TopNavbar />                <main className="flex-1 p-6 overflow-auto">
          <PageHeader 
            title="订阅管理" 
            description="管理用户订阅、查看统计数据和分析订阅趋势"
          >
            <Button onClick={loadData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新数据
            </Button>
          </PageHeader>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">概览统计</TabsTrigger>
              <TabsTrigger value="plans">订阅计划</TabsTrigger>
              <TabsTrigger value="expiring">即将到期</TabsTrigger>
              <TabsTrigger value="referrals">推荐计划</TabsTrigger>
            </TabsList>

            {/* 概览统计 */}
            <TabsContent value="overview" className="space-y-6">
              {/* 统计卡片 */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                  title="总用户数"
                  value={stats?.total_users.toLocaleString() || '0'}
                  icon={<Users className="h-5 w-5" />}
                  trend={{ value: 12, isPositive: true }}
                />
                <StatsCard
                  title="付费用户"
                  value={stats?.premium_users.toLocaleString() || '0'}
                  icon={<Star className="h-5 w-5" />}
                  trend={{ value: 8, isPositive: true }}
                />
                <StatsCard
                  title="总收入"
                  value={formatCurrency(stats?.total_revenue || 0)}
                  icon={<CreditCard className="h-5 w-5" />}
                  trend={{ value: 15, isPositive: true }}
                />
                <StatsCard
                  title="转化率"
                  value={`${stats?.conversion_rate || 0}%`}
                  icon={<TrendingUp className="h-5 w-5" />}
                  trend={{ value: 2.3, isPositive: true }}
                />
              </div>

              {/* 收入统计 */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      收入分布
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">月付收入</span>
                        <span className="font-medium">{formatCurrency(stats?.monthly_revenue || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">季付收入</span>
                        <span className="font-medium">{formatCurrency(stats?.quarterly_revenue || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">年付收入</span>
                        <span className="font-medium">{formatCurrency(stats?.yearly_revenue || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">终身收入</span>
                        <span className="font-medium">{formatCurrency(stats?.lifetime_revenue || 0)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>用户类型分布</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            dataKey="value"
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number) => [value.toLocaleString(), '用户数']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 每日新增付费用户趋势 */}
              {stats?.daily_stats && stats.daily_stats.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>最近30天新增付费用户趋势</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stats.daily_stats}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={(value) => new Date(value).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
                          />
                          <YAxis />
                          <Tooltip 
                            labelFormatter={(value) => new Date(value).toLocaleDateString('zh-CN')}
                            formatter={(value: number, name: string) => [
                              name === 'count' ? value.toLocaleString() + ' 人' : formatCurrency(value),
                              name === 'count' ? '新增用户' : '收入'
                            ]}
                          />
                          <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
                          <Line type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* 订阅计划 */}
            <TabsContent value="plans" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>订阅计划管理</CardTitle>
                  <CardDescription>管理所有可用的订阅计划</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>计划名称</TableHead>
                        <TableHead>代码</TableHead>
                        <TableHead>价格</TableHead>
                        <TableHead>时长</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>排序</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {plans.map((plan) => (
                        <TableRow key={plan.id}>
                          <TableCell className="font-medium">{plan.name}</TableCell>
                          <TableCell>{plan.code}</TableCell>
                          <TableCell>{formatCurrency(plan.price)}</TableCell>
                          <TableCell>{plan.duration_days} 天</TableCell>
                          <TableCell>
                            <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                              {plan.is_active ? '启用' : '禁用'}
                            </Badge>
                          </TableCell>
                          <TableCell>{plan.sort_order}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 即将到期 */}
            <TabsContent value="expiring" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    即将到期的订阅
                  </CardTitle>
                  <CardDescription>
                    管理即将到期的用户订阅，进行续费提醒或手动续期
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* 筛选和操作栏 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="filter-days">到期天数：</Label>
                        <Select value={filterDays} onValueChange={setFilterDays}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">3天内</SelectItem>
                            <SelectItem value="7">7天内</SelectItem>
                            <SelectItem value="14">14天内</SelectItem>
                            <SelectItem value="30">30天内</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {selectedUsers.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            已选择 {selectedUsers.length} 个用户
                          </span>
                          <Button 
                            onClick={openBatchDialog}
                            size="sm"
                          >
                            批量操作
                          </Button>
                          <Button 
                            onClick={clearSelection}
                            variant="outline" 
                            size="sm"
                          >
                            取消选择
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        onClick={selectAllUsers}
                        variant="outline" 
                        size="sm"
                      >
                        全选
                      </Button>
                      <Button 
                        onClick={loadExpiringUsers}
                        variant="outline" 
                        size="sm"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedUsers.length === expiringUsers.length && expiringUsers.length > 0}
                            onCheckedChange={selectedUsers.length === expiringUsers.length ? clearSelection : selectAllUsers}
                          />
                        </TableHead>
                        <TableHead>用户</TableHead>
                        <TableHead>订阅类型</TableHead>
                        <TableHead>到期时间</TableHead>
                        <TableHead>总消费</TableHead>
                        <TableHead>学习进度</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expiringUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedUsers.includes(user.id)}
                              onCheckedChange={() => toggleUserSelection(user.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getSubscriptionTypeBadge(user.subscription_type)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {formatDate(user.subscription_expires_at)}
                              <div className="text-xs text-red-500">
                                {user.subscription_expires_at && 
                                  `${Math.ceil((new Date(user.subscription_expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} 天后到期`
                                }
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{formatCurrency(user.total_spent)}</TableCell>
                          <TableCell>
                            {user.learning_progress ? (
                              <div className="text-sm">
                                <div>第 {user.learning_progress.current_day} 天</div>
                                <div className="text-xs text-gray-500">
                                  {user.learning_progress.total_study_minutes} 分钟
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              onClick={() => openEditDialog(user)}
                              variant="outline"
                              size="sm"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {expiringUsers.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      暂无即将到期的订阅用户
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 推荐计划 */}
            <TabsContent value="referrals" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    推荐计划统计
                  </CardTitle>
                  <CardDescription>查看推荐计划的统计数据和佣金信息</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="p-4 border rounded-lg">
                      <div className="text-2xl font-bold">0</div>
                      <div className="text-sm text-gray-600">总推荐数</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-2xl font-bold">0</div>
                      <div className="text-sm text-gray-600">成功推荐</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{formatCurrency(0)}</div>
                      <div className="text-sm text-gray-600">待支付佣金</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{formatCurrency(0)}</div>
                      <div className="text-sm text-gray-600">总佣金</div>
                    </div>
                  </div>
                  
                  <div className="mt-6 text-center text-gray-500">
                    推荐计划功能即将上线
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* 批量更新对话框 */}
          <Dialog open={batchDialogOpen} onOpenChange={setBatchDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>批量更新订阅</DialogTitle>
                <DialogDescription>
                  将对选中的 {selectedUsers.length} 个用户进行批量订阅更新操作
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="batch-subscription-type">订阅类型</Label>
                  <Select 
                    value={batchForm.subscription_type} 
                    onValueChange={(value: any) => setBatchForm(prev => ({ ...prev, subscription_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">免费</SelectItem>
                      <SelectItem value="monthly">月付</SelectItem>
                      <SelectItem value="quarterly">季付</SelectItem>
                      <SelectItem value="yearly">年付</SelectItem>
                      <SelectItem value="lifetime">终身</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {batchForm.subscription_type !== 'free' && batchForm.subscription_type !== 'lifetime' && (
                  <div>
                    <Label htmlFor="batch-duration">自定义时长（天）</Label>
                    <Input
                      id="batch-duration"
                      type="number"
                      min="1"
                      value={batchForm.duration_days || ''}
                      onChange={(e) => setBatchForm(prev => ({ 
                        ...prev, 
                        duration_days: e.target.value ? parseInt(e.target.value) : undefined 
                      }))}
                      placeholder="留空使用计划默认时长"
                    />
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setBatchDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleBatchUpdate}>
                  确认更新
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* 单个编辑对话框 */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>编辑用户订阅</DialogTitle>
                <DialogDescription>
                  更新 {editingUser?.name} 的订阅信息
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-subscription-type">订阅类型</Label>
                  <Select 
                    value={editForm.subscription_type} 
                    onValueChange={(value: any) => setEditForm(prev => ({ ...prev, subscription_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">免费</SelectItem>
                      <SelectItem value="monthly">月付</SelectItem>
                      <SelectItem value="quarterly">季付</SelectItem>
                      <SelectItem value="yearly">年付</SelectItem>
                      <SelectItem value="lifetime">终身</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {editForm.subscription_type !== 'free' && editForm.subscription_type !== 'lifetime' && (
                  <div>
                    <Label htmlFor="edit-duration">自定义时长（天）</Label>
                    <Input
                      id="edit-duration"
                      type="number"
                      min="1"
                      value={editForm.duration_days || ''}
                      onChange={(e) => setEditForm(prev => ({ 
                        ...prev, 
                        duration_days: e.target.value ? parseInt(e.target.value) : undefined 
                      }))}
                      placeholder="留空使用计划默认时长"
                    />
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleUpdateUserSubscription}>
                  确认更新
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default AdminSubscriptionManagement; 