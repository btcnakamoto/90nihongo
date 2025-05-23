import React, { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import SidebarToggle from "@/components/admin/SidebarToggle";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Database,
  Download,
  Trash2,
  Plus,
  RefreshCw,
  Clock,
  HardDrive,
  Settings,
  FileText,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import axios from "axios";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";

interface BackupFile {
  id: number;
  filename: string;
  filepath: string;
  description: string | null;
  size: number;
  size_human: string;
  tables_count: number;
  database_name: string;
  database_driver: string;
  status: string;
  created_at: string;
  created_at_human: string;
  backup_duration: string;
}

interface DatabaseStatus {
  name: string;
  driver: string;
  host: string;
  port: number;
  tables_count: number;
  size: number;
  size_human: string;
}

interface BackupResponse {
  code: number;
  message: string;
  data: BackupFile[] | DatabaseStatus | any;
}

const AdminDatabaseBackup = () => {
  const { getAuthHeaders } = useAdminAuth();
  const { isCollapsed } = useSidebar();
  const { toast } = useToast();
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  // 获取数据库状态
  const fetchDatabaseStatus = async () => {
    try {
      const response = await axios.get<BackupResponse>(
        `${API_BASE}/admin/database/status`,
        { headers: getAuthHeaders() }
      );
      
      if (response.data.code === 200) {
        setDatabaseStatus(response.data.data.database);
      } else {
        toast({
          title: "获取数据库状态失败",
          description: response.data.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "获取数据库状态失败",
        description: error.response?.data?.message || "网络错误",
        variant: "destructive",
      });
    }
  };

  // 获取备份列表
  const fetchBackups = async () => {
    setLoading(true);
    try {
      const response = await axios.get<BackupResponse>(
        `${API_BASE}/admin/database/backups`,
        { headers: getAuthHeaders() }
      );
      
      if (response.data.code === 200) {
        setBackups(response.data.data);
      } else {
        toast({
          title: "获取备份列表失败",
          description: response.data.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "获取备份列表失败",
        description: error.response?.data?.message || "网络错误",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 创建备份
  const createBackup = async () => {
    setCreateLoading(true);
    try {
      const response = await axios.post<BackupResponse>(
        `${API_BASE}/admin/database/backups`,
        { description: description.trim() || undefined },
        { headers: getAuthHeaders() }
      );
      
      if (response.data.code === 200) {
        toast({
          title: "备份创建成功",
          description: `备份文件 ${response.data.data.filename} 创建成功`,
        });
        setShowCreateDialog(false);
        setDescription("");
        fetchBackups();
      } else {
        toast({
          title: "备份创建失败",
          description: response.data.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "备份创建失败",
        description: error.response?.data?.message || "网络错误",
        variant: "destructive",
      });
    } finally {
      setCreateLoading(false);
    }
  };

  // 下载备份
  const downloadBackup = async (filename: string) => {
    try {
      const response = await axios.get(
        `${API_BASE}/admin/database/backups/${filename}/download`,
        {
          headers: getAuthHeaders(),
          responseType: 'blob',
        }
      );
      
      // 创建下载链接
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "下载成功",
        description: `备份文件 ${filename} 已开始下载`,
      });
    } catch (error: any) {
      toast({
        title: "下载失败",
        description: error.response?.data?.message || "网络错误",
        variant: "destructive",
      });
    }
  };

  // 删除备份
  const deleteBackup = async (filename: string) => {
    try {
      const response = await axios.delete<BackupResponse>(
        `${API_BASE}/admin/database/backups/${filename}`,
        { headers: getAuthHeaders() }
      );
      
      if (response.data.code === 200) {
        toast({
          title: "删除成功",
          description: `备份文件 ${filename} 已删除`,
        });
        fetchBackups();
      } else {
        toast({
          title: "删除失败",
          description: response.data.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "删除失败",
        description: error.response?.data?.message || "网络错误",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchDatabaseStatus();
    fetchBackups();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar activePath="/admin/database" />
      
      <div className={cn(
        "main-content overflow-auto",
        isCollapsed && "collapsed"
      )}>
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarToggle />
              <h1 className="text-2xl font-bold text-nihongo-darkBlue flex items-center gap-2">
                <Database className="h-6 w-6" />
                数据库备份管理
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={fetchBackups}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                刷新
              </Button>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    创建备份
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>创建数据库备份</DialogTitle>
                    <DialogDescription>
                      为当前数据库创建一个新的备份文件。您可以添加描述来标识这个备份。
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="description">备份描述 (可选)</Label>
                      <Input
                        id="description"
                        placeholder="例如：发布前备份、重要更新前备份..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        maxLength={255}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateDialog(false)}
                      disabled={createLoading}
                    >
                      取消
                    </Button>
                    <Button onClick={createBackup} disabled={createLoading}>
                      {createLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          创建中...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          创建备份
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>
        
        <main className="px-8 py-6 space-y-6">
          {/* 数据库状态卡片 */}
          {databaseStatus && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-nihongo-darkBlue mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                数据库状态
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <Database className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">数据库名称</p>
                    <p className="font-semibold text-nihongo-darkBlue">{databaseStatus.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">数据库类型</p>
                    <p className="font-semibold text-nihongo-darkBlue">{databaseStatus.driver.toUpperCase()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                  <FileText className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">表数量</p>
                    <p className="font-semibold text-nihongo-darkBlue">{databaseStatus.tables_count} 个</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
                  <HardDrive className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">数据库大小</p>
                    <p className="font-semibold text-nihongo-darkBlue">{databaseStatus.size_human}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 备份文件列表 */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-nihongo-darkBlue flex items-center gap-2">
                <FileText className="h-5 w-5" />
                备份文件列表
                <span className="text-sm font-normal text-gray-500">
                  ({backups.length} 个备份)
                </span>
              </h2>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-nihongo-indigo" />
                <p className="text-gray-500">加载备份列表中...</p>
              </div>
            ) : backups.length === 0 ? (
              <div className="p-8 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无备份文件</h3>
                <p className="text-gray-500 mb-4">点击"创建备份"按钮来创建您的第一个数据库备份</p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  创建备份
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>文件名</TableHead>
                    <TableHead>描述</TableHead>
                    <TableHead>大小</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backups.map((backup) => (
                    <TableRow key={backup.filename}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-nihongo-indigo" />
                          {backup.filename}
                        </div>
                      </TableCell>
                      <TableCell>{backup.description || "无"}</TableCell>
                      <TableCell>{backup.size_human}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span title={backup.created_at}>
                            {backup.created_at_human}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadBackup(backup.filename)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>删除备份文件</AlertDialogTitle>
                                <AlertDialogDescription>
                                  确定要删除备份文件 "{backup.filename}" 吗？
                                  <br />
                                  <strong>此操作不可撤销！</strong>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteBackup(backup.filename)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  删除
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDatabaseBackup; 