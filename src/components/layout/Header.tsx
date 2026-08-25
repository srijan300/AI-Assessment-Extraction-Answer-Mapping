import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  ArrowLeft,
  ChevronDown,
  Sun,
  Moon,
  Monitor,
  Sliders,
} from "lucide-react";
import { useTheme, type Theme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

interface HeaderProps {
  onToggleMobileSidebar?: () => void;
  title?: string;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  title,
  onBack,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme, effectiveTheme } = useTheme();
  const { user } = useAuth();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getBreadcrumb = () => {
    if (title) return title;
    const path = location.pathname;
    if (path.startsWith("/exams/upload")) return "Upload & Map Assessment";
    if (path.startsWith("/exams/")) return "Assessment Workspace";
    if (path.startsWith("/exams")) return "Exams & Assessments";
    if (path.startsWith("/courses")) return "My Courses";
    if (path.startsWith("/assignments")) return "Assignments";
    if (path.startsWith("/library")) return "My Library";
    if (path.startsWith("/settings")) return "Settings";
    if (path.startsWith("/home")) return "Dashboard";
    return "Dashboard";
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200/80 dark:border-zinc-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 transition-colors duration-200">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {onBack && (
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-base font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">
            {getBreadcrumb()}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Theme Toggle */}
        <button
          onClick={() => setTheme(effectiveTheme === "dark" ? "light" : "dark")}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title={`Switch to ${effectiveTheme === "dark" ? "Light" : "Dark"} mode`}
        >
          {effectiveTheme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-zinc-600" />
          )}
        </button>

        {/* User Profile Pill */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="flex items-center gap-2 pl-2 sm:pl-3 pr-1 py-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors select-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-orange-500 flex items-center justify-center text-white font-bold text-xs shadow-xs">
              {user ? user.name.slice(0, 1).toUpperCase() : "T"}
            </div>
            <span className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-100 hidden sm:inline">
              {user ? user.name : "Teacher"}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl py-2 z-50 text-xs font-medium space-y-1">
              <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800">
                <p className="font-bold text-zinc-900 dark:text-zinc-100">
                  {user?.name || "Teacher"}
                </p>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">
                  {user?.email || "teacher@evaluator.org"}
                </p>
              </div>

              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate("/settings");
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left"
              >
                <Sliders className="w-3.5 h-3.5 text-zinc-400" />
                <span>Settings</span>
              </button>

              {/* Theme Mode Selector */}
              <div className="px-4 py-2 border-t border-b border-zinc-100 dark:border-zinc-800 space-y-1.5">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                  Theme
                </span>
                <div className="grid grid-cols-3 gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                  {(["light", "dark", "system"] as Theme[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`flex items-center justify-center gap-1 py-1 rounded-lg text-[11px] font-bold capitalize transition-colors ${
                        theme === t
                          ? "bg-white dark:bg-zinc-700 text-orange-600 dark:text-orange-400 shadow-xs"
                          : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                      }`}
                    >
                      {t === "light" && <Sun className="w-3 h-3" />}
                      {t === "dark" && <Moon className="w-3 h-3" />}
                      {t === "system" && <Monitor className="w-3 h-3" />}
                      <span>{t}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
