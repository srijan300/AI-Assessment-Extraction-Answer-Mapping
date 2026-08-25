export interface AnswerRegion {
  page: number; // 1-indexed page
  box: {
    ymin: number; // 0 - 1000
    xmin: number; // 0 - 1000
    ymax: number; // 0 - 1000
    xmax: number; // 0 - 1000
  };
}

export type BoundingBoxRegion = AnswerRegion;

export interface Question {
  id: string;
  number: string; // e.g. "1", "2", "11 (a)", "11 (b)"
  text: string;
  page: number;
  order: number;
  marks?: number | null;
  subPart?: string | null;
}

export interface Answer {
  id: string;
  text: string;
  detectedQuestionNumber?: string | null;
  confidence: number;
  regions: AnswerRegion[];
}

export interface AnswerMapping {
  questionId: string;
  answerId: string | null;
  confidence: number;
  status: "answered" | "unanswered" | "needs_review";
  mappingMethod?: "explicit_number" | "semantic_match" | "context_match" | "position_match" | "unmatched";
  awardedMarks?: number | null;
  aiFeedback?: string | null;
  correctness?: string | null;
}

export type Mapping = AnswerMapping;

export interface GradeResult {
  awardedMarks: number;
  maximumMarks: number;
  correctness: string;
  aiFeedback: string;
  confidence?: number;
}

export interface AssessmentSummary {
  totalQuestions: number;
  answered: number;
  unanswered: number;
  needsReview: number;
}

export interface Assessment {
  id: string;
  createdAt?: string;
  title?: string;
  subject?: string;
  createdDate?: string;
  questionPaperPagesCount?: number;
  answerSheetPagesCount: number;
  answerSheetUrl?: string;
  answerSheetMimeType?: string;
  questionPaperUrl?: string;
  questionPaperMimeType?: string;
  questions: Question[];
  answers: Answer[];
  mappings: AnswerMapping[];
  unmatchedAnswers: Answer[];
  summary: AssessmentSummary;
  answerSheetPageImages?: string[];
}

export interface FileItem {
  file: File;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
  pageCount?: number;
}
