import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ui/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import Layout from "./components/ui/Layout";
import './index.css';
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

// Lazy Loaded Pages
const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Assessment = lazy(() => import("./pages/Assessment"));
const Results = lazy(() => import("./pages/Results"));
const PathsPage = lazy(() => import("./pages/PathsPage"));
const QuizzesPage = lazy(() => import("./pages/QuizzesPage"));
const PathwayView = lazy(() => import("./pages/PathwayView"));
const CoursesPage = lazy(() => import("./pages/CoursesPage"));
const QuizRunner = lazy(() => import("./pages/QuizRunner"));
const CertificateView = lazy(() => import("./pages/CertificateView"));
const MyCertificates = lazy(() => import("./pages/MyCertificates"));
const PostJob = lazy(() => import("./pages/PostJob"));
const Applications = lazy(() => import("./pages/Applications"));
const CompanyProfile = lazy(() => import("./pages/CompanyProfile"));
const PrepCenter = lazy(() => import("./pages/PrepCenter"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const ProblemsPage = lazy(() => import("./pages/ProblemsPage"));
const ProblemDetail = lazy(() => import("./pages/ProblemDetail"));
const ContestsPage = lazy(() => import("./pages/ContestsPage"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));

// Admin Pages (separate dashboard)
const AdminLayout = lazy(() => import("./components/ui/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminCourses = lazy(() => import("./pages/admin/AdminCourses"));
const AdminProblems = lazy(() => import("./pages/admin/AdminProblems"));
const AdminContests = lazy(() => import("./pages/admin/AdminContests"));
const AdminStudents = lazy(() => import("./pages/admin/AdminStudents"));
const AdminJobs = lazy(() => import("./pages/admin/AdminJobs"));

const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center">
    <motion.div 
      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className="w-16 h-16 bg-accent/20 rounded-3xl flex items-center justify-center border border-accent/30 shadow-glow"
    >
      <Sparkles className="text-accent" />
    </motion.div>
    <p className="text-xs font-black uppercase tracking-[0.3em] text-accent/60">Loading Neural Nodes...</p>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
      <ToastProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<AuthPage />} />

            {/* Protected App Routes (Nested under shared Layout) */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/assessment" element={<Assessment />} />
              <Route path="/results/:id" element={<Results />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/course/:id" element={<CourseDetail />} />
              <Route path="/paths" element={<PathsPage />} />
              <Route path="/paths/:id" element={<PathwayView />} />
              <Route path="/quizzes" element={<QuizzesPage />} />
              <Route path="/quiz/:id" element={<QuizRunner />} />
              <Route path="/certificate/:id" element={<CertificateView />} />
              <Route path="/my-certificates" element={<MyCertificates />} />
              <Route path="/applications" element={<Applications />} />
              <Route path="/prep" element={<PrepCenter />} />
              <Route path="/problems" element={<ProblemsPage />} />
              <Route path="/problem/:id" element={<ProblemDetail />} />
              <Route path="/contests" element={<ContestsPage />} />
              <Route path="/profile" element={<CompanyProfile />} />
              <Route path="/post-job" element={<PostJob />} />
            </Route>

            {/* Admin Dashboard — Separate layout with its own sidebar */}
            <Route element={<ProtectedRoute reqRole="ADMIN"><AdminLayout /></ProtectedRoute>}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/courses" element={<AdminCourses />} />
              <Route path="/admin/problems" element={<AdminProblems />} />
              <Route path="/admin/contests" element={<AdminContests />} />
              <Route path="/admin/students" element={<AdminStudents />} />
              <Route path="/admin/jobs" element={<AdminJobs />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      </ToastProvider>
     </AuthProvider>
    </ThemeProvider>
  )
}

export default App;
