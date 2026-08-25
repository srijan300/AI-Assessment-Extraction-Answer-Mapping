import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FilePlus,
  GraduationCap,
  Library,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  FolderOpen,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { useAuth } from "../context/AuthContext";
import { useAssessment } from "../context/AssessmentContext";

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { assessments } = useAssessment();

  const totalAssessments = assessments.length;
  const totalQuestions = assessments.reduce((sum, a) => sum + (a.questions?.length || 0), 0);
  const totalMapped = assessments.reduce(
    (sum, a) => sum + (a.summary?.answered || 0),
    0
  );
  const totalNeedsReview = assessments.reduce(
    (sum, a) => sum + (a.summary?.needsReview || 0),
    0
  );

  return (
    <div className="flex-1 bg-zinc-50/60 dark:bg-zinc-950 p-4 sm:p-8 font-sans transition-colors duration-200 space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Welcome back, <span className="text-orange-500">{user?.name || "Teacher"}</span> 👋
          </h1>
          <p className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">
            Multimodal AI Assessment Mapping Suite
          </p>
        </div>

        <Button
          size="lg"
          onClick={() => navigate("/exams/upload")}
          className="shadow-md shrink-0"
        >
          <FilePlus className="w-4 h-4" />
          <span>New Assessment</span>
        </Button>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => navigate("/exams/upload")}
          className="bg-orange-500 text-white rounded-3xl p-6 shadow-xs hover:bg-orange-600 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <FilePlus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Create New Assessment</h3>
            <p className="text-xs text-white/80 mt-1">
              Upload Question Paper and Student Answer Sheet to extract & map answers.
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold gap-1 group-hover:translate-x-1 transition-transform">
            <span>Start Upload</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div
          onClick={() => navigate("/exams")}
          className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xs hover:border-orange-500/50 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              View Assessments
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Access active assessment sessions and region mapping scorecards.
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-orange-600 dark:text-orange-400 gap-1 group-hover:translate-x-1 transition-transform">
            <span>Open Exams</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div
          onClick={() => navigate("/library")}
          className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xs hover:border-orange-500/50 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Library className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Document Library
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Browse uploaded question papers and student answer scans.
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-orange-600 dark:text-orange-400 gap-1 group-hover:translate-x-1 transition-transform">
            <span>Browse Library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Dynamic Session Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {totalAssessments}
            </span>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Total Assessments
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {totalQuestions}
            </span>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Questions Processed
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {totalMapped}
            </span>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Answers Mapped
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {totalNeedsReview}
            </span>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Needs Review
            </p>
          </div>
        </div>
      </div>

      {/* Recent Assessments Section / Empty State */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Recent Assessments
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Processed assessment mappings in current session
            </p>
          </div>
          {assessments.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => navigate("/exams")}>
              View All
            </Button>
          )}
        </div>

        {assessments.length === 0 ? (
          <div className="bg-zinc-50 dark:bg-zinc-800/40 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-10 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <FolderOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              No assessments yet
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">
              Upload a question paper and student answer sheet to run the automated answer extraction and region mapping pipeline.
            </p>
            <Button size="md" onClick={() => navigate("/exams/upload")} className="mt-2">
              <FilePlus className="w-4 h-4" />
              <span>Create Assessment</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {assessments.map((asm) => (
              <div
                key={asm.id}
                onClick={() => navigate(`/exams/${asm.id}`)}
                className="p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 hover:border-orange-500/50 bg-zinc-50/50 dark:bg-zinc-800/40 hover:bg-white dark:hover:bg-zinc-800 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-sm shrink-0">
                    📄
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {asm.title || "Uploaded Assessment"}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Processed on {asm.createdAt ? new Date(asm.createdAt).toLocaleTimeString() : "Today"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                    {asm.summary.answered}/{asm.summary.totalQuestions} Mapped
                  </span>
                  {asm.summary.needsReview > 0 ? (
                    <Badge variant="warning">Needs Review</Badge>
                  ) : (
                    <Badge variant="success">Completed</Badge>
                  )}
                  <Button size="sm" variant="ghost">
                    Open Workspace →
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
