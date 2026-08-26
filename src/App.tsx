import React, { useState } from "react";
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

// Page Views
import { LoginPage } from "./pages/LoginPage";
import { HomePage } from "./pages/HomePage";
import { CoursesPage } from "./pages/CoursesPage";
import { AssignmentsPage } from "./pages/AssignmentsPage";
import { ExamsPage } from "./pages/ExamsPage";
import { UploadPage } from "./pages/UploadPage";
import { AssessmentPage } from "./pages/AssessmentPage";
import { LibraryPage } from "./pages/LibraryPage";
import { SettingsPage } from "./pages/SettingsPage";

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
          </Router>
        </AssessmentProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
