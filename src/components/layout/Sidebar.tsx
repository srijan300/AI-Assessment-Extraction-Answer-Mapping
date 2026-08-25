import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  BookOpen,
  FileCheck,
  GraduationCap,
  Library,
  Settings,
  X,
  UserCheck,
} from "lucide-react";

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen = false,
  onMobileClose,
}) => {
  const navItems = [
    { to: "/home", label: "Home", icon: LayoutGrid },
    { to: "/courses", label: "My Courses", icon: BookOpen },
    { to: "/assignments", label: "Assignments", icon: FileCheck },
    { to: "/exams", label: "Exams", icon: GraduationCap },
    { to: "/library", label: "My Library", icon: Library },
  ];

  const sidebarContent = (
    <div className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200/80 dark:border-zinc-800 flex flex-col justify-between p-4 h-full font-sans transition-colors duration-200">
      {/* Brand & Logo */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-xs">
              V
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Veda<span className="text-orange-500">AI</span>
            </span>
          </div>

          {onMobileClose && (
            <button
              onClick={onMobileClose}
              className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 font-semibold"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-orange-500" : "text-zinc-400 dark:text-zinc-500"
                      }`}
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / Settings & Neutral Evaluator Badge */}
      <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <NavLink
          to="/settings"
          onClick={onMobileClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isActive
                ? "text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 font-semibold"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Settings
                className={`w-4 h-4 ${
                  isActive ? "text-orange-500" : "text-zinc-400 dark:text-zinc-500"
                }`}
              />
              <span>Settings</span>
            </>
          )}
        </NavLink>

        {/* Neutral Role Card */}
        <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl p-3 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-900 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
              Teacher Portal
            </h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
              Assessment Evaluator
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block h-screen sticky top-0 shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            onClick={onMobileClose}
            className="fixed inset-0 bg-zinc-900/60 backdrop-blur-xs transition-opacity"
          />
          <div className="relative flex-1 max-w-xs w-full h-full z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
