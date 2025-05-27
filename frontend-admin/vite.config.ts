import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8081,
    // 启用SPA路由回退，确保刷新页面时能正确处理前端路由
    historyApiFallback: true,
    proxy: {
      // API代理 - 将/api开头的请求代理到后端
      '^/api/.*': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      // 管理端API代理 - 只代理API请求，不代理前端路由
      '^/admin/login$': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '^/admin/logout$': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '^/admin/logout-all$': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '^/admin/me$': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '^/admin/refresh$': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '^/admin/users.*': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '^/admin/content.*': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '^/admin/materials.*': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '^/admin/database.*': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '^/admin/subscriptions.*': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '^/admin/stats$': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      // 资源管理API - 使用函数来精确匹配
      '/admin/resources': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        bypass: function (req, res, options) {
          const url = req.url;
          if (!url) return null;
          
          // 如果是前端路由（不是API端点），则不代理
          const frontendRoutes = [
            '/admin/resources/overview',
            '/admin/resources/scraping', 
            '/admin/resources/upload',
            '/admin/resources/api-import',
            '/admin/resources/bilibili',
            '/admin/resources/tasks'
          ];
          
          // 检查是否是前端路由
          for (const route of frontendRoutes) {
            if (url === route || url.startsWith(route + '/')) {
              return url; // 返回原URL，不代理
            }
          }
          
          // 检查是否是API端点
          const apiPatterns = [
            /^\/admin\/resources$/,
            /^\/admin\/resources\/stats$/,
            /^\/admin\/resources\/tasks$/,
            /^\/admin\/resources\/tasks\/[^\/]+$/,
            /^\/admin\/resources\/web-scraping$/,
            /^\/admin\/resources\/file-upload$/,
            /^\/admin\/resources\/api-import$/,
            /^\/admin\/resources\/bilibili\/video-info$/,
            /^\/admin\/resources\/bilibili\/extract$/,
            /^\/admin\/resources\/bilibili\/jobs/,
            /^\/admin\/resources\/bilibili\/system-status$/,
            /^\/admin\/resources\/[0-9]+$/
          ];
          
          // 如果匹配API模式，则代理
          for (const pattern of apiPatterns) {
            if (pattern.test(url)) {
              return null; // 代理到后端
            }
          }
          
          // 其他情况不代理
          return url;
        }
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
