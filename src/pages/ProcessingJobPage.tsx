import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobStatus, retryAssessmentJob } from "../lib/api";
import { ProcessingScreen } from "../components/processing/ProcessingScreen";
import { useAssessment } from "../context/AssessmentContext";
import { AlertTriangle, RotateCcw, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/Button";

export const ProcessingJobPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { addAssessment } = useAssessment();

  const [stageIndex, setStageIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(5);
  const [stageMessage, setStageMessage] = useState<string>("Initializing job...");
  const [errorInfo, setErrorInfo] = useState<{ code?: string; message?: string } | null>(null);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollIntervalMsRef = useRef<number>(2000);

  useEffect(() => {
    if (!jobId) {
      navigate("/exams/upload");
      return;
    }

    localStorage.setItem("active_assessment_job_id", jobId);

    let isSubscribed = true;

    const pollStatus = async () => {
      try {
        const res = await getJobStatus(jobId);
        if (!isSubscribed) return;

        setStageIndex(res.stageIndex);
        setProgress(res.progress);
        setStageMessage(res.stageMessage);

        if (res.status === "completed" && res.assessment) {
          localStorage.removeItem("active_assessment_job_id");
          addAssessment(res.assessment);
          setTimeout(() => {
            if (isSubscribed) {
              navigate(`/exams/assessment/${res.assessmentId}`);
            }
          }, 600);
          return;
        }

        if (res.status === "failed") {
          setErrorInfo(res.error || { message: "Assessment processing encountered an error." });
          return;
        }

        // Progressive polling interval (2s -> 3s -> 5s)
        pollIntervalMsRef.current = Math.min(5000, pollIntervalMsRef.current + 1000);
        timerRef.current = setTimeout(pollStatus, pollIntervalMsRef.current);
      } catch (err: any) {
        if (!isSubscribed) return;
        setErrorInfo({
          code: "POLLING_ERROR",
          message: err?.message || "Lost connection to processing server.",
        });
      }
    };

    pollStatus();

    return () => {
      isSubscribed = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [jobId, navigate, addAssessment]);

  const handleRetry = async () => {
    if (!jobId) return;
    setIsRetrying(true);
    setErrorInfo(null);
    try {
      await retryAssessmentJob(jobId);
      setStageIndex(0);
      setProgress(5);
      setStageMessage("Retrying processing...");
      pollIntervalMsRef.current = 2000;
      setIsRetrying(false);
      window.location.reload();
    } catch (err: any) {
      setIsRetrying(false);
      setErrorInfo({
        code: "RETRY_FAILED",
        message: err?.message || "Failed to restart processing job.",
      });
    }
  };

  if (errorInfo) {
    return (
      <div className="flex-1 bg-gradient-to-b from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex flex-col items-center justify-center p-6 min-h-[calc(100vh-4rem)] font-sans transition-colors duration-200">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-rose-200/80 dark:border-rose-900/60 rounded-3xl p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Processing Failed
            </h2>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/40 p-3 rounded-2xl border border-rose-200/60 dark:border-rose-900/40">
              {errorInfo.message || "An unexpected error occurred during document extraction."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                localStorage.removeItem("active_assessment_job_id");
                navigate("/exams/upload");
              }}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Upload</span>
            </Button>

            <Button
              size="md"
              disabled={isRetrying}
              onClick={handleRetry}
              className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-bold"
            >
              <RotateCcw className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`} />
              <span>Retry Job</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProcessingScreen
      stageIndex={stageIndex}
      progress={progress}
      stageMessage={stageMessage}
    />
  );
};
