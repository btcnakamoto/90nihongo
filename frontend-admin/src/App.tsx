
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Dashboard from "./pages/Dashboard";
import DailyLesson from "./pages/DailyLesson";
import Listening from "./pages/Listening";
import Speaking from "./pages/Speaking";
import Vocabulary from "./pages/Vocabulary";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/" element={<><Navigation /><Dashboard /></>} />
          <Route path="/daily" element={<><Navigation /><DailyLesson /></>} />
          <Route path="/listening" element={<><Navigation /><Listening /></>} />
          <Route path="/speaking" element={<><Navigation /><Speaking /></>} />
          <Route path="/vocabulary" element={<><Navigation /><Vocabulary /></>} />
          <Route path="*" element={<><Navigation /><NotFound /></>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
