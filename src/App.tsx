import React, { useState, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { AssessmentProvider } from "./context/AssessmentContext";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { Loader2 } from "lucide-react";

// Lazy-loaded Page Views for Code Splitting & Performance Optimization
const LoginPage = lazy(() => import("./pages/LoginPage").then(m => ({ default: m.LoginPage })));
const HomePage = lazy(() => import("./pages/HomePage").then(m => ({ default: m.HomePage })));
const CoursesPage = lazy(() => import("./pages/CoursesPage").then(m => ({ default: m.CoursesPage })));
const AssignmentsPage = lazy(() => import("./pages/AssignmentsPage").then(m => ({ default: m.AssignmentsPage })));
const ExamsPage = lazy(() => import("./pages/ExamsPage").then(m => ({ default: m.ExamsPage })));
const UploadPage = lazy(() => import("./pages/UploadPage").then(m => ({ default: m.UploadPage })));
const ProcessingJobPage = lazy(() => import("./pages/ProcessingJobPage").then(m => ({ default: m.ProcessingJobPage })));
const AssessmentPage = lazy(() => import("./pages/AssessmentPage").then(m => ({ default: m.AssessmentPage })));
const LibraryPage = lazy(() => import("./pages/LibraryPage").then(m => ({ default: m.LibraryPage })));
const SettingsPage = lazy(() => import("./pages/SettingsPage").then(m => ({ default: m.SettingsPage })));

const LoadingFallback: React.FC = () => (
  <div className="flex-1 flex items-center justify-center p-12 bg-zinc-50 dark:bg-zinc-950">
    <div className="flex items-center gap-3 text-orange-500 font-semibold text-xs">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span>Loading page...</span>
    </div>
  </div>
);

// Main App Layout Wrapper with Sidebar & Top Navigation
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onBack={() => navigate(-1)}
        />
        <main className="flex-1 flex flex-col overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AssessmentProvider>
          <Router>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public Login Route */}
                <Route path="/login" element={<LoginPage />} />

                {/* Authenticated Dashboard & Assessment Routes */}
                <Route
                  path="/home"
                  element={
                    <AppLayout>
                      <HomePage />
                    </AppLayout>
                  }
                />

                <Route
                  path="/courses"
                  element={
                    <AppLayout>
                      <CoursesPage />
                    </AppLayout>
                  }
                />

                <Route
                  path="/assignments"
                  element={
                    <AppLayout>
                      <AssignmentsPage />
                    </AppLayout>
                  }
                />

                <Route
                  path="/exams"
                  element={
                    <AppLayout>
                      <ExamsPage />
                    </AppLayout>
                  }
                />

                <Route
                  path="/exams/upload"
                  element={
                    <AppLayout>
                      <UploadPage />
                    </AppLayout>
                  }
                />

                <Route
                  path="/exams/processing/:jobId"
                  element={
                    <AppLayout>
                      <ProcessingJobPage />
                    </AppLayout>
                  }
                />

                <Route
                  path="/exams/:examId"
                  element={
                    <AppLayout>
                      <AssessmentPage />
                    </AppLayout>
                  }
                />

                <Route
                  path="/exams/assessment/:examId"
                  element={
                    <AppLayout>
                      <AssessmentPage />
                    </AppLayout>
                  }
                />

                <Route
                  path="/library"
                  element={
                    <AppLayout>
                      <LibraryPage />
                    </AppLayout>
                  }
                />

                <Route
                  path="/settings"
                  element={
                    <AppLayout>
                      <SettingsPage />
                    </AppLayout>
                  }
                />

                {/* Default Catch-all Redirect */}
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="*" element={<Navigate to="/home" replace />} />
              </Routes>
            </Suspense>
          </Router>
        </AssessmentProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
