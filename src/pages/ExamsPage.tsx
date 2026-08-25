import React from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, FilePlus, ArrowRight, FolderOpen } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { useAssessment } from "../context/AssessmentContext";

export const ExamsPage: React.FC = () => {
  const navigate = useNavigate();
  const { assessments } = useAssessment();

  return (
    <div className="flex-1 bg-zinc-50/60 dark:bg-zinc-950 p-4 sm:p-8 font-sans transition-colors duration-200 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Exams & Assessments
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Upload question papers and student answer sheets to process region mappings
          </p>
        </div>

        <Button size="lg" onClick={() => navigate("/exams/upload")} className="shadow-md">
          <FilePlus className="w-4 h-4" />
          <span>Create Assessment</span>
        </Button>
      </div>

      {assessments.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto my-12 space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900 flex items-center justify-center text-orange-500">
            <FolderOpen className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              No assessments yet
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Upload a question paper and answer sheet to get started with automated extraction and answer region mapping.
            </p>
          </div>
          <Button size="md" onClick={() => navigate("/exams/upload")} className="mt-2">
            <FilePlus className="w-4 h-4" />
            <span>Create Assessment</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {assessments.map((exam) => (
            <div
              key={exam.id}
              onClick={() => navigate(`/exams/${exam.id}`)}
              className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xs hover:border-orange-500/50 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {exam.title || "Uploaded Assessment"}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Processed on {exam.createdAt ? new Date(exam.createdAt).toLocaleString() : "Today"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  {exam.summary.answered}/{exam.summary.totalQuestions} Questions Mapped
                </span>
                {exam.summary.needsReview > 0 ? (
                  <Badge variant="warning">Needs Review</Badge>
                ) : (
                  <Badge variant="success">Completed</Badge>
                )}
                <Button size="sm" variant="ghost">
                  <span>Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
