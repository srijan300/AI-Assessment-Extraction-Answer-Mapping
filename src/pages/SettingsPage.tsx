import React, { useState, useEffect } from "react";
import {
  Sun,
  Moon,
  Monitor,
  User,
  Sliders,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Building,
  School,
  Save,
  Check,
} from "lucide-react";
import { useTheme, type Theme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { getHealth, type HealthResponse } from "../lib/api";
import { Button } from "../components/ui/Button";

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { user, updateProfile } = useAuth();

  const [healthStatus, setHealthStatus] = useState<HealthResponse | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.70);
  const [autoOpenFirstAnswer, setAutoOpenFirstAnswer] = useState<boolean>(true);
  const [showAiFeedback, setShowAiFeedback] = useState<boolean>(true);

  // Profile Form Local State
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [schoolName, setSchoolName] = useState(user.schoolName || "Delhi Public School, Bokaro Steel City");
  const [classroom, setClassroom] = useState(user.classroom || "Grade 10 Mathematics");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
    setSchoolName(user.schoolName || "Delhi Public School, Bokaro Steel City");
    setClassroom(user.classroom || "Grade 10 Mathematics");
  }, [user]);

  const fetchHealthDiagnostics = async () => {
    setIsCheckingHealth(true);
    const data = await getHealth();
    setHealthStatus(data);
    setIsCheckingHealth(false);
  };

  useEffect(() => {
    fetchHealthDiagnostics();
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      schoolName,
      classroom,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="flex-1 bg-zinc-50/60 dark:bg-zinc-950 p-4 sm:p-8 font-sans transition-colors duration-200 space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Settings & Preferences
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Customize UI themes, profile details, classroom settings, and assessment preferences
        </p>
      </div>

      {/* 1. Account Profile Settings */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Account & Classroom Profile
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Update evaluator name, email, school institution, and classroom
              </p>
            </div>
          </div>

          {saveSuccess && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-fade-in">
              <Check className="w-4 h-4" />
              <span>Saved Successfully</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-zinc-400" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-zinc-400" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <School className="w-3.5 h-3.5 text-zinc-400" />
                <span>School / Institution Name</span>
              </label>
              <input
                type="text"
                required
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-zinc-400" />
                <span>Classroom / Section</span>
              </label>
              <input
                type="text"
                required
                value={classroom}
                onChange={(e) => setClassroom(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" size="md">
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </Button>
          </div>
        </form>
      </div>

      {/* 2. Appearance / Theme */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Appearance & Theme
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Choose your preferred interface theme
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2">
          {[
            { id: "light", label: "Light", icon: Sun },
            { id: "dark", label: "Dark", icon: Moon },
            { id: "system", label: "System", icon: Monitor },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = theme === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTheme(item.id as Theme)}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "border-orange-500 bg-orange-50/50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 shadow-sm"
                    : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Assessment Mapping Preferences */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Assessment Mapping Preferences
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Configure confidence thresholds for automated mapping
            </p>
          </div>
        </div>

        <div className="space-y-5 pt-2 text-xs">
          <div className="space-y-2">
            <div className="flex justify-between font-bold text-zinc-800 dark:text-zinc-200">
              <span>Mapping Confidence Threshold</span>
              <span className="font-mono text-orange-600 dark:text-orange-400">
                {Math.round(confidenceThreshold * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="0.95"
              step="0.05"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
              className="w-full accent-orange-500 cursor-pointer"
            />
            <p className="text-[11px] text-zinc-400">
              Mappings with confidence score below {Math.round(confidenceThreshold * 100)}% will be flagged as "Needs Review".
            </p>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-zinc-100 dark:border-zinc-800">
            <div>
              <p className="font-bold text-zinc-800 dark:text-zinc-200">
                Auto-select First Mapped Answer
              </p>
              <p className="text-[11px] text-zinc-400">
                Automatically jump to the first question answer region upon entering workspace
              </p>
            </div>
            <input
              type="checkbox"
              checked={autoOpenFirstAnswer}
              onChange={(e) => setAutoOpenFirstAnswer(e.target.checked)}
              className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between py-2 border-t border-zinc-100 dark:border-zinc-800">
            <div>
              <p className="font-bold text-zinc-800 dark:text-zinc-200">
                Display AI Feedback Callouts
              </p>
              <p className="text-[11px] text-zinc-400">
                Show awarded marks and AI feedback boxes in question detail cards
              </p>
            </div>
            <input
              type="checkbox"
              checked={showAiFeedback}
              onChange={(e) => setShowAiFeedback(e.target.checked)}
              className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 4. Safe AI Diagnostics */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                AI Service Diagnostics
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Check backend Gemini API service status
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchHealthDiagnostics}
            disabled={isCheckingHealth}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingHealth ? "animate-spin" : ""}`} />
            <span>Re-check</span>
          </Button>
        </div>

        {healthStatus && (
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-600 dark:text-zinc-400">
                Gemini API Service Status
              </span>
              {healthStatus.geminiConfigured ? (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Operational & Configured
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                  <AlertTriangle className="w-4 h-4" /> API Key Pending
                </span>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-zinc-200/60 dark:border-zinc-700/60 pt-2">
              <span className="font-semibold text-zinc-600 dark:text-zinc-400">
                SDK Engine Connection
              </span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                {healthStatus.sdkInitialized ? "Connected (Active SDK)" : "Standby"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
