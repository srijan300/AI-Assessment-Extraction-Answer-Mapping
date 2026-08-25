import { z } from "zod";

export const AnswerRegionSchema = z.object({
  page: z.number().int().min(1),
  box: z.object({
    ymin: z.number().min(0).max(1000),
    xmin: z.number().min(0).max(1000),
    ymax: z.number().min(0).max(1000),
    xmax: z.number().min(0).max(1000),
  }),
});

export const QuestionSchema = z.object({
  id: z.string(),
  number: z.string(), // e.g. "1", "11 (a)", "11 (b)"
  text: z.string(),
  page: z.number().int().min(1).default(1),
  order: z.number().int().default(1),
  marks: z.number().nullable().optional(),
  subPart: z.string().nullable().optional(),
});

export const AnswerSchema = z.object({
  id: z.string(),
  text: z.string(),
  detectedQuestionNumber: z.string().nullable().optional(),
  confidence: z.number().min(0).max(1).default(0.85),
  regions: z.array(AnswerRegionSchema),
});

export const AnswerMappingSchema = z.object({
  questionId: z.string(),
  answerId: z.string().nullable(),
  confidence: z.number().min(0).max(1),
  status: z.enum(["answered", "unanswered", "needs_review"]),
  mappingMethod: z.enum([
    "explicit_number",
    "semantic_match",
    "context_match",
    "position_match",
    "unmatched",
  ]),
  awardedMarks: z.number().nullable().optional(),
  aiFeedback: z.string().nullable().optional(),
  correctness: z.string().nullable().optional(),
});

export const AssessmentSummarySchema = z.object({
  totalQuestions: z.number().int(),
  answered: z.number().int(),
  unanswered: z.number().int(),
  needsReview: z.number().int(),
});

export const AssessmentSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  createdAt: z.string(),
  answerSheetUrl: z.string().optional(),
  answerSheetMimeType: z.string().optional(),
  questionPaperUrl: z.string().optional(),
  questionPaperMimeType: z.string().optional(),
  questions: z.array(QuestionSchema),
  answers: z.array(AnswerSchema),
  mappings: z.array(AnswerMappingSchema),
  unmatchedAnswers: z.array(AnswerSchema).default([]),
  summary: AssessmentSummarySchema,
  answerSheetPagesCount: z.number().int().default(1),
  answerSheetPageImages: z.array(z.string()).optional(),
});

export const GradeRequestSchema = z.object({
  question: QuestionSchema,
  answer: AnswerSchema,
  maximumMarks: z.number().default(5),
});

export const GradeResultSchema = z.object({
  awardedMarks: z.number(),
  maximumMarks: z.number(),
  correctness: z.string(),
  aiFeedback: z.string(),
  confidence: z.number().min(0).max(1),
});

export type AnswerRegion = z.infer<typeof AnswerRegionSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type Answer = z.infer<typeof AnswerSchema>;
export type AnswerMapping = z.infer<typeof AnswerMappingSchema>;
export type Assessment = z.infer<typeof AssessmentSchema>;
export type GradeResult = z.infer<typeof GradeResultSchema>;
