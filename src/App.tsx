import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TeacherDashboard from "./pages/TeacherDashboard";
import CreateExam from "./pages/CreateExam";
import ExamDetails from "./pages/ExamDetails";
import StudentDashboard from "./pages/StudentDashboard";
import StudentResults from "./pages/StudentResults";
import StudentPerformance from "./pages/StudentPerformance";
import ExamAttempt from "./pages/ExamAttempt";
import ExamResult from "./pages/ExamResult";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const HomeRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/teacher" element={<ProtectedRoute allowedRole="teacher"><TeacherDashboard /></ProtectedRoute>} />
              <Route path="/teacher/create" element={<ProtectedRoute allowedRole="teacher"><CreateExam /></ProtectedRoute>} />
              <Route path="/teacher/exam/:examId" element={<ProtectedRoute allowedRole="teacher"><ExamDetails /></ProtectedRoute>} />
              <Route path="/student" element={<ProtectedRoute allowedRole="student"><StudentDashboard /></ProtectedRoute>} />
              <Route path="/student/results" element={<ProtectedRoute allowedRole="student"><StudentResults /></ProtectedRoute>} />
              <Route path="/student/performance" element={<ProtectedRoute allowedRole="student"><StudentPerformance /></ProtectedRoute>} />
              <Route path="/exam/:examId" element={<ProtectedRoute allowedRole="student"><ExamAttempt /></ProtectedRoute>} />
              <Route path="/result/:resultId" element={<ProtectedRoute allowedRole="student"><ExamResult /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
