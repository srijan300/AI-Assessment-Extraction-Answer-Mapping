import type { Assessment, Question, Answer, GradeResult } from "../types/assessment";

export interface HealthResponse {
  status: string;
  timestamp: string;
  geminiConfigured: boolean;
  configuredModel: string;
  sdkInitialized: boolean;
}

export interface JobStatusResponse {
  success: boolean;
  jobId: string;
  status: "queued" | "extracting_questions" | "extracting_answers" | "mapping_answers" | "grading" | "completed" | "failed";
  stageIndex: number;
  progress: number;
  stageMessage: string;
  error?: {
    code: string;
    message: string;
  } | null;
  assessmentId?: string | null;
  assessment?: Assessment | null;
}

export const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export async function getHealth(): Promise<HealthResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    if (!res.ok) {
      throw new Error(`Health check failed with status ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    console.error("[API] getHealth error:", err);
    return {
      status: "error",
      timestamp: new Date().toISOString(),
      geminiConfigured: false,
      configuredModel: "unknown",
      sdkInitialized: false,
    };
  }
}

export async function startAssessmentJob(
  questionPaper: File,
  answerSheet: File
): Promise<JobStatusResponse> {
  const formData = new FormData();
  formData.append("questionPaper", questionPaper);
  formData.append("answerSheet", answerSheet);

  const res = await fetch(`${API_BASE}/api/process`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data.success) {
    const errorMsg = data?.error?.message || "Failed to start assessment processing. Please check your files and try again.";
    throw new Error(errorMsg);
  }

  return data;
}

export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  const res = await fetch(`${API_BASE}/api/process/job/${jobId}`);
  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data.success) {
    const errorMsg = data?.error?.message || `Failed to fetch status for job '${jobId}'.`;
    throw new Error(errorMsg);
  }

  if (data.assessment) {
    if (data.assessment.answerSheetUrl && data.assessment.answerSheetUrl.startsWith("/")) {
      data.assessment.answerSheetUrl = `${API_BASE}${data.assessment.answerSheetUrl}`;
    }
    if (data.assessment.questionPaperUrl && data.assessment.questionPaperUrl.startsWith("/")) {
      data.assessment.questionPaperUrl = `${API_BASE}${data.assessment.questionPaperUrl}`;
    }
  }

  return data;
}

export async function retryAssessmentJob(jobId: string): Promise<JobStatusResponse> {
  const res = await fetch(`${API_BASE}/api/process/retry/${jobId}`, {
    method: "POST",
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data.success) {
    const errorMsg = data?.error?.message || "Failed to restart processing job.";
    throw new Error(errorMsg);
  }

  return data;
}

export async function fetchAssessmentById(id: string): Promise<Assessment> {
  const res = await fetch(`${API_BASE}/api/assessments/${id}`);
  if (!res.ok) {
    throw new Error(`Assessment '${id}' could not be found.`);
  }

  const assessment: Assessment = await res.json();
  if (assessment.answerSheetUrl && assessment.answerSheetUrl.startsWith("/")) {
    assessment.answerSheetUrl = `${API_BASE}${assessment.answerSheetUrl}`;
  }
  if (assessment.questionPaperUrl && assessment.questionPaperUrl.startsWith("/")) {
    assessment.questionPaperUrl = `${API_BASE}${assessment.questionPaperUrl}`;
  }
  return assessment;
}

export async function gradeAnswer(
  question: Question,
  answer: Answer,
  maximumMarks?: number
): Promise<GradeResult> {
  const res = await fetch(`${API_BASE}/api/grade`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, answer, maximumMarks }),
  });

  if (!res.ok) {
    throw new Error("Failed to evaluate student answer");
  }

  return await res.json();
}
