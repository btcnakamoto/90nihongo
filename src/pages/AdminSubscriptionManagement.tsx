import React, { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import TopNavbar from "@/components/admin/TopNavbar";
import PageHeader from "@/components/admin/PageHeader";
import { useSidebar } from "@/contexts/SidebarContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { 
  CreditCard, 
  Users, 
  DollarSign, 
  TrendingUp,
  Star,
  Clock,
  Gift,
  Crown,
  RefreshCw,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Award
} from "lucide-react";

// 导入API服务和类型
import { 
  SubscriptionService, 
  type SubscriptionStats, 
  type SubscriptionPlan,
  type ReferralStats
} from "@/services/subscriptionService";

const AdminSubscriptionManagement = () => {
  const { isCollapsed } = useSidebar();
  const { toast } = useToast();
  
  // 状态管理
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // 加载数据
  const loadData = async () => {
    try {
      setLoading(true);
      
      const [statsResponse, plansResponse, referralResponse] = await Promise.all([
        SubscriptionService.getStats(),
        SubscriptionService.getPlans(),
        SubscriptionService.getReferralStats(),
      ]);

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }

      if (plansResponse.success && plansResponse.data) {
        setPlans(plansResponse.data);
      }

      if (referralResponse.success && referralResponse.data) {
        setReferralStats(referralResponse.data);
      }
    } catch (error: any) {
      console.error('加载数据失败:', error);
      toast({
        title: "加载失败",
        description: error.message || "获取订阅数据失败",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 格式化货币
  const formatCurrency = (amount: number) => {
    return `¥${amount.toFixed(2)}`;
  };

  // 获取计划图标
  const getPlanIcon = (code: string) => {
    switch (code) {
      case 'monthly': return <Calendar className="h-4 w-4" />;
      case 'quarterly': return <Star className="h-4 w-4" />;
      case 'yearly': return <Crown className="h-4 w-4" />;
      case 'lifetime': return <Award className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar activePath="/admin/subscriptions" />
      
      <div className={cn(
        "main-content flex-1 flex flex-col transition-all duration-300",
        isCollapsed && "collapsed"
      )}>
        {/* 统一顶部导航栏 */}
        <TopNavbar />
        
        {/* 页面标题区域 */}
        <PageHeader 
          title="订阅管理" 
          description="管理用户订阅计划和收入统计"
        >
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            刷新数据
          </Button>
        </PageHeader>

        {/* 主要内容区域 */}
        <main className="flex-1 p-6 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">概览统计</TabsTrigger>
              <TabsTrigger value="plans">订阅计划</TabsTrigger>
              <TabsTrigger value="referrals">推荐计划</TabsTrigger>
              <TabsTrigger value="analytics">数据分析</TabsTrigger>
            </TabsList>

            {/* 概览统计标签页 */}
            <TabsContent value="overview" className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-nihongo-indigo" />
                  <span className="ml-2">加载中...</span>
                </div>
              ) : stats ? (
                <>
                  {/* 核心指标卡片 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">总收入</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(stats.total_revenue)}
                        </div>
                        <p className="text-xs text-muted-foreground">累计收入</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">付费用户</CardTitle>
                        <Crown className="h-4 w-4 text-purple-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                          {stats.premium_users}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          转化率 {stats.conversion_rate}%
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">免费用户</CardTitle>
                        <Users className="h-4 w-4 text-blue-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                          {stats.free_users}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          占比 {((stats.free_users / stats.total_users) * 100).toFixed(1)}%
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">即将到期</CardTitle>
                        <Clock className="h-4 w-4 text-orange-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                          {stats.expiring_soon}
                        </div>
                        <p className="text-xs text-muted-foreground">7天内到期</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* 订阅类型分布 */}
                  <Card>
                    <CardHeader>
                      <CardTitle>订阅类型分布</CardTitle>
                      <CardDescription>各类型订阅用户数量统计</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">月会员</span>
                            <span className="text-sm text-muted-foreground">{stats.monthly_users}</span>
                          </div>
                          <Progress 
                            value={(stats.monthly_users / stats.total_users) * 100} 
                            className="h-2"
                          />
                          <div className="text-xs text-muted-foreground">
                            收入: {formatCurrency(stats.monthly_revenue)}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">季度会员</span>
                            <span className="text-sm text-muted-foreground">{stats.quarterly_users}</span>
                          </div>
                          <Progress 
                            value={(stats.quarterly_users / stats.total_users) * 100} 
                            className="h-2"
                          />
                          <div className="text-xs text-muted-foreground">
                            收入: {formatCurrency(stats.quarterly_revenue)}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">年会员</span>
                            <span className="text-sm text-muted-foreground">{stats.yearly_users}</span>
                          </div>
                          <Progress 
                            value={(stats.yearly_users / stats.total_users) * 100} 
                            className="h-2"
                          />
                          <div className="text-xs text-muted-foreground">
                            收入: {formatCurrency(stats.yearly_revenue)}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">终身会员</span>
                            <span className="text-sm text-muted-foreground">{stats.lifetime_users}</span>
                          </div>
                          <Progress 
                            value={(stats.lifetime_users / stats.total_users) * 100} 
                            className="h-2"
                          />
                          <div className="text-xs text-muted-foreground">
                            收入: {formatCurrency(stats.lifetime_revenue)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">暂无统计数据</p>
                </div>
              )}
            </TabsContent>

            {/* 订阅计划标签页 */}
            <TabsContent value="plans" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>订阅计划配置</CardTitle>
                  <CardDescription>管理系统的订阅计划和定价</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {plans.map((plan) => (
                      <Card key={plan.id} className={cn(
                        "relative",
                        plan.is_popular && "border-nihongo-indigo shadow-lg"
                      )}>
                        {plan.is_popular && (
                          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                            <Badge className="bg-nihongo-indigo">推荐</Badge>
                          </div>
                        )}
                        <CardHeader className="text-center pb-4">
                          <div className="flex items-center justify-center mb-2">
                            {getPlanIcon(plan.code)}
                          </div>
                          <CardTitle className="text-lg">{plan.name}</CardTitle>
                          <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                          <div className="mb-4">
                            <div className="text-3xl font-bold text-nihongo-indigo">
                              {formatCurrency(plan.price)}
                            </div>
                            {plan.original_price && plan.original_price > plan.price && (
                              <div className="text-sm text-gray-500 line-through">
                                {formatCurrency(plan.original_price)}
                              </div>
                            )}
                            <div className="text-sm text-gray-600">
                              {plan.duration_days ? `${plan.duration_days}天` : '终身'}
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-left">
                            {plan.features.slice(0, 5).map((feature, index) => (
                              <div key={index} className="flex items-center text-sm">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                {feature}
                              </div>
                            ))}
                            {plan.features.length > 5 && (
                              <div className="text-xs text-gray-500">
                                +{plan.features.length - 5} 更多功能
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 推荐计划标签页 */}
            <TabsContent value="referrals" className="space-y-6">
              {referralStats && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">总推荐数</CardTitle>
                        <Gift className="h-4 w-4 text-blue-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{referralStats.total_programs}</div>
                        <p className="text-xs text-muted-foreground">
                          成功推荐 {referralStats.approved_programs}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">佣金总额</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(referralStats.total_commission)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          待发放 {formatCurrency(referralStats.pending_commission)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">已发放佣金</CardTitle>
                        <DollarSign className="h-4 w-4 text-purple-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                          {formatCurrency(referralStats.paid_commission)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          已支付 {referralStats.paid_programs} 笔
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* 顶级推荐人 */}
                  <Card>
                    <CardHeader>
                      <CardTitle>顶级推荐人</CardTitle>
                      <CardDescription>推荐成效最佳的用户</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>用户</TableHead>
                            <TableHead>成功推荐</TableHead>
                            <TableHead>总佣金</TableHead>
                            <TableHead>操作</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {referralStats.top_referrers.map((referrer) => (
                            <TableRow key={referrer.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{referrer.name}</div>
                                  <div className="text-sm text-gray-500">{referrer.email}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {referrer.successful_referrals} 人
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium text-green-600">
                                {formatCurrency(referrer.total_commission)}
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm">
                                  查看详情
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* 数据分析标签页 */}
            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>收入趋势分析</CardTitle>
                  <CardDescription>近30天付费用户和收入变化</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats && stats.daily_stats.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-500">总新增付费用户</div>
                          <div className="text-2xl font-bold">
                            {stats.daily_stats.reduce((sum, day) => sum + day.count, 0)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">总收入</div>
                          <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(stats.daily_stats.reduce((sum, day) => sum + day.revenue, 0))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">每日数据详情</h4>
                        <div className="max-h-64 overflow-y-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>日期</TableHead>
                                <TableHead>新增用户</TableHead>
                                <TableHead>收入</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {stats.daily_stats.map((day, index) => (
                                <TableRow key={index}>
                                  <TableCell>{day.date}</TableCell>
                                  <TableCell>{day.count}</TableCell>
                                  <TableCell className="text-green-600">
                                    {formatCurrency(day.revenue)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">暂无数据分析</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default AdminSubscriptionManagement; 