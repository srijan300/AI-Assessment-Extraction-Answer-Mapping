import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCard } from "../components/upload/UploadCard";
import { Button } from "../components/ui/Button";
import type { FileItem } from "../types/assessment";
import { ArrowRight, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { startAssessmentJob } from "../lib/api";

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();

  const [qpFileItem, setQpFileItem] = useState<FileItem | null>(null);
  const [ansFileItem, setAnsFileItem] = useState<FileItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  useEffect(() => {
    const savedJobId = localStorage.getItem("active_assessment_job_id");
    if (savedJobId) {
      setActiveJobId(savedJobId);
    }
  }, []);

  const handleQpSelect = (file: File) => {
    setErrorMessage(null);
    setQpFileItem({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
    });
  };

  const handleAnsSelect = (file: File) => {
    setErrorMessage(null);
    setAnsFileItem({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
    });
  };

  const handleStartProcess = async () => {
    if (!qpFileItem || !ansFileItem) {
      setErrorMessage("Please upload both a Question Paper and a Student Answer Sheet.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const jobResponse = await startAssessmentJob(qpFileItem.file, ansFileItem.file);
      setIsSubmitting(false);

      if (jobResponse.jobId) {
        localStorage.setItem("active_assessment_job_id", jobResponse.jobId);
        navigate(`/exams/processing/${jobResponse.jobId}`);
      } else {
        throw new Error("Job creation failed: No job ID returned from server.");
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(
        err?.message || "An error occurred while launching processing job. Please verify file format and try again."
      );
    }
  };

  const isReady = Boolean(qpFileItem && ansFileItem && !isSubmitting);

  return (
    <div className="flex-1 bg-gradient-to-b from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex flex-col items-center justify-center p-4 sm:p-8 min-h-[calc(100vh-4rem)] font-sans transition-colors duration-200">
      <div className="max-w-3xl w-full flex flex-col items-center text-center space-y-6">
        
        {/* Active Job Notification Banner */}
        {activeJobId && (
          <div className="w-full max-w-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3 text-left">
              <Sparkles className="w-5 h-5 text-orange-500 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Assessment Processing in Progress
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                  Job #{activeJobId}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => navigate(`/exams/processing/${activeJobId}`)}
              className="bg-orange-600 hover:bg-orange-500 text-white font-bold"
            >
              <span>View Job Progress</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}

        {/* Central AI Avatar Graphic Badge */}
        <div className="relative flex items-center justify-center my-2">
          <div className="absolute w-28 h-28 rounded-full bg-orange-500/10 dark:bg-orange-500/20 animate-ping opacity-75" />
          <div className="absolute w-24 h-24 rounded-full bg-orange-400/20 dark:bg-orange-500/30 blur-sm" />

          <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-400 p-1 shadow-lg shadow-orange-500/30 flex items-center justify-center">
            <img
              src="/assets/ai_teacher_avatar.png"
              alt="AI Assessment Pipeline"
              className="w-full h-full object-cover rounded-full border-2 border-white/80 dark:border-zinc-900"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </div>
        </div>

        {/* Title Header with Highlighted Pill */}
        <div className="space-y-2 max-w-xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
            Upload{" "}
            <span className="bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-2xl inline-block border border-orange-200/80 dark:border-orange-800/60">
              Question Paper & Answer Sheets
            </span>
          </h1>
          <p className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Upload both files to get started with automated extraction & mapping
          </p>
        </div>

        {/* Dual Upload Dropzone Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl pt-2">
          <UploadCard
            title="Upload Question Paper"
            subtitle="PDF, PNG, JPG (Max 25MB)"
            fileItem={qpFileItem}
            onFileSelect={handleQpSelect}
            onFileRemove={() => setQpFileItem(null)}
          />

          <UploadCard
            title="Upload Answer Sheet"
            subtitle="PDF, PNG, JPG (Max 25MB)"
            fileItem={ansFileItem}
            onFileSelect={handleAnsSelect}
            onFileRemove={() => setAnsFileItem(null)}
          />
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center justify-center gap-2 text-rose-600 dark:text-rose-300 text-xs font-semibold w-full max-w-md">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* CTA Process Action */}
        <div className="space-y-3 pt-2">
          <Button
            size="lg"
            disabled={!isReady}
            onClick={handleStartProcess}
            className="w-56 shadow-md hover:scale-105 active:scale-95 transition-all font-bold text-sm bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Launching Job...</span>
              </>
            ) : (
              <>
                <span>Start Mapping</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
