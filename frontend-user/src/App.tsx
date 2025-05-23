import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// 页面组件
import LoginPage from '@/pages/auth/login';
import RegisterPage from '@/pages/auth/register';
import Dashboard from '@/pages/Dashboard';
import Navigation from "@/components/Navigation";
import DailyLesson from "./pages/DailyLesson";
import Listening from "./pages/Listening";
import Speaking from "./pages/Speaking";
import Vocabulary from "./pages/Vocabulary";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";

function MainLayout() {
  return (
    <>
      <Navigation />
      <main><Outlet /></main>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 公开路由 */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          
          {/* 受保护路由，统一用 MainLayout 包裹 */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/daily-lesson" element={<DailyLesson />} />
            <Route path="/listening" element={<Listening />} />
            <Route path="/speaking" element={<Speaking />} />
            <Route path="/vocabulary" element={<Vocabulary />} />
          </Route>
          
          {/* 404页面 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
