import type { Assessment, Question, Answer, GradeResult } from "../types/assessment";

export interface HealthResponse {
  status: string;
  timestamp: string;
  geminiConfigured: boolean;
  configuredModel: string;
  sdkInitialized: boolean;
}

export async function getHealth(): Promise<HealthResponse> {
  try {
    const res = await fetch("/api/health");
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

  const res = await fetch("/api/process", {
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

  return await res.json();
}

export async function gradeAnswer(
  question: Question,
  answer: Answer,
  maximumMarks?: number
): Promise<GradeResult> {
  const res = await fetch("/api/grade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, answer, maximumMarks }),
  });

  if (!res.ok) {
    throw new Error("Failed to evaluate student answer");
  }

  return await res.json();
}
