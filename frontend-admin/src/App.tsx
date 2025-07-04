import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUserManagement from "./pages/AdminUserManagement";
import AdminContentManagementOptimized from "./pages/AdminContentManagementOptimized";
import AdminCourseDetail from "./pages/AdminCourseDetail";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminSettings from "./pages/AdminSettings";
import AdminDatabaseBackup from "./pages/AdminDatabaseBackup";
import AdminSubscriptionManagement from "./pages/AdminSubscriptionManagement";
import AdminResourceManager from "./pages/AdminResourceManager";
import ResourceOverview from "./pages/ResourceOverview";
import AdminWebScraping from "./pages/AdminWebScraping";
import AdminFileUpload from "./pages/AdminFileUpload";
import AdminAPIImport from "./pages/AdminAPIImport";
import AdminBilibiliExtractor from "./pages/AdminBilibiliExtractor";
import AdminTaskManagement from "./pages/AdminTaskManagement";
import AdminCategoryManagement from "./pages/AdminCategoryManagement";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import AuthDebug from "./pages/AuthDebug";
import { AdminAuthProvider, useAdminAuth } from "./contexts/AdminAuthContext";
import { SidebarProvider } from "./contexts/SidebarContext";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading } = useAdminAuth();
  
  // 显示加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nihongo-blue mx-auto mb-4"></div>
          <p className="text-gray-600">验证登录状态...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AdminAuthProvider>
        <SidebarProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/auth-debug" element={<AuthDebug />} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute><AdminUserManagement /></ProtectedRoute>} />
              <Route path="/admin/subscriptions" element={<ProtectedRoute><AdminSubscriptionManagement /></ProtectedRoute>} />
              <Route path="/admin/content" element={<ProtectedRoute><AdminContentManagementOptimized /></ProtectedRoute>} />
              <Route path="/admin/content/courses" element={<ProtectedRoute><AdminContentManagementOptimized /></ProtectedRoute>} />
              <Route path="/admin/content/courses/:id" element={<ProtectedRoute><AdminCourseDetail /></ProtectedRoute>} />
              <Route path="/admin/content/materials" element={<ProtectedRoute><AdminContentManagementOptimized /></ProtectedRoute>} />
              <Route path="/admin/content/vocabulary" element={<ProtectedRoute><AdminContentManagementOptimized /></ProtectedRoute>} />
              <Route path="/admin/content/exercises" element={<ProtectedRoute><AdminContentManagementOptimized /></ProtectedRoute>} />
              <Route path="/admin/categories" element={<ProtectedRoute><AdminCategoryManagement /></ProtectedRoute>} />
              <Route path="/admin/analytics" element={<ProtectedRoute><AdminAnalytics /></ProtectedRoute>} />
              <Route path="/admin/resources" element={<ProtectedRoute><AdminResourceManager /></ProtectedRoute>} />
              <Route path="/admin/resources/overview" element={<ProtectedRoute><ResourceOverview /></ProtectedRoute>} />
              <Route path="/admin/resources/scraping" element={<ProtectedRoute><AdminWebScraping /></ProtectedRoute>} />
              <Route path="/admin/resources/upload" element={<ProtectedRoute><AdminFileUpload /></ProtectedRoute>} />
              <Route path="/admin/resources/api-import" element={<ProtectedRoute><AdminAPIImport /></ProtectedRoute>} />
              <Route path="/admin/resources/bilibili" element={<ProtectedRoute><AdminBilibiliExtractor /></ProtectedRoute>} />
              <Route path="/admin/resources/tasks" element={<ProtectedRoute><AdminTaskManagement /></ProtectedRoute>} />
              <Route path="/admin/database" element={<ProtectedRoute><AdminDatabaseBackup /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SidebarProvider>
      </AdminAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
