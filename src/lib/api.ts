import type { Assessment, Question, Answer, GradeResult } from "../types/assessment";

export interface HealthResponse {
  status: string;
  timestamp: string;
  geminiConfigured: boolean;
  configuredModel: string;
  sdkInitialized: boolean;
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

export async function processAssessment(
  questionPaper: File,
  answerSheet: File
): Promise<Assessment> {
  const formData = new FormData();
  formData.append("questionPaper", questionPaper);
  formData.append("answerSheet", answerSheet);

  const res = await fetch(`${API_BASE}/api/process`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(
      errorJson.error ||
        "Failed to process assessment documents. Please check file format and try again."
    );
  }

  const assessment: Assessment = await res.json();
  // Ensure URLs are prefixed with API_BASE if relative
  if (assessment.answerSheetUrl && assessment.answerSheetUrl.startsWith("/")) {
    assessment.answerSheetUrl = `${API_BASE}${assessment.answerSheetUrl}`;
  }
  if (assessment.questionPaperUrl && assessment.questionPaperUrl.startsWith("/")) {
    assessment.questionPaperUrl = `${API_BASE}${assessment.questionPaperUrl}`;
  }
  return assessment;
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
