import { assessmentStorage } from "./storage.js";
import { extractQuestionsFromPaper } from "./gemini/extractQuestions.js";
import { extractAnswersFromSheet } from "./gemini/extractAnswers.js";
import { mapQuestionsToAnswers } from "./gemini/mapAnswers.js";
import { batchGradeMappedAnswers } from "./gemini/gradeAnswers.js";
import type { Assessment } from "../schemas/assessment.js";

export async function runAssessmentJob(jobId: string): Promise<void> {
  const job = assessmentStorage.getJob(jobId);
  if (!job) {
    console.error(`[JobProcessor Error] Job '${jobId}' not found.`);
    return;
  }

  const startTime = Date.now();
  console.log(`[JobProcessor] Starting Job '${jobId}' (QP: ${job.qpFile.filename}, AS: ${job.ansFile.filename})`);

  try {
    // Stage 1: Extract Questions from Question Paper
    if (!job.intermediate?.questions || job.intermediate.questions.length === 0) {
      assessmentStorage.updateJob(jobId, {
        status: "extracting_questions",
        stageIndex: 1,
        progress: 20,
        stageMessage: "Extracting questions from question paper...",
      });

      const qpStart = Date.now();
      const questions = await extractQuestionsFromPaper(
        job.qpFile.buffer,
        job.qpFile.mimeType,
        job.qpFile.filename
      );
      const qpDuration = ((Date.now() - qpStart) / 1000).toFixed(1);
      console.log(`[JobProcessor] job=${jobId} stage=extract_questions complete count=${questions.length} duration=${qpDuration}s`);

      if (!questions || questions.length === 0) {
        throw new Error("Could not extract any questions from the uploaded Question Paper. Please verify file content.");
      }

      job.intermediate = { ...job.intermediate, questions };
      assessmentStorage.updateJob(jobId, { intermediate: job.intermediate });
    }

    const questions = job.intermediate!.questions!;

    // Stage 2: Extract Handwritten Answers from Answer Sheet
    if (!job.intermediate?.answers || job.intermediate.answers.length === 0) {
      assessmentStorage.updateJob(jobId, {
        status: "extracting_answers",
        stageIndex: 2,
        progress: 45,
        stageMessage: "Extracting handwritten responses from answer sheet...",
      });

      const ansStart = Date.now();
      const { answers, pageCount } = await extractAnswersFromSheet(
        job.ansFile.buffer,
        job.ansFile.mimeType,
        job.ansFile.filename
      );
      const ansDuration = ((Date.now() - ansStart) / 1000).toFixed(1);
      console.log(`[JobProcessor] job=${jobId} stage=extract_answers complete count=${answers.length} pages=${pageCount} duration=${ansDuration}s`);

      job.intermediate = { ...job.intermediate, answers, pageCount };
      assessmentStorage.updateJob(jobId, { intermediate: job.intermediate });
    }

    const answers = job.intermediate!.answers!;
    const pageCount = job.intermediate!.pageCount || 1;

    // Stage 3: Map Questions to Answers across all physical pages
    assessmentStorage.updateJob(jobId, {
      status: "mapping_answers",
      stageIndex: 3,
      progress: 70,
      stageMessage: "Mapping student answers to extracted questions...",
    });

    const mapStart = Date.now();
    const { mappings, unmatchedAnswers, finalAnswers } = mapQuestionsToAnswers(questions, answers, pageCount);
    const mapDuration = ((Date.now() - mapStart) / 1000).toFixed(1);
    console.log(`[JobProcessor] job=${jobId} stage=mapping_answers complete mappings=${mappings.length} duration=${mapDuration}s`);

    // Compute Summary Statistics
    const totalQuestions = questions.length;
    const answered = mappings.filter((m) => m.status === "answered").length;
    const unanswered = mappings.filter((m) => m.status === "unanswered").length;
    const needsReview = mappings.filter((m) => m.status === "needs_review").length;

    const assessmentId = `assessment_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const cleanTitle = job.qpFile.filename.replace(/\.[^/.]+$/, "").replace(/^\[.*?\]\s*/, "");

    const assessment: Assessment = {
      id: assessmentId,
      title: `${cleanTitle} Assessment`,
      createdAt: new Date().toISOString(),
      answerSheetUrl: `/api/assessments/${assessmentId}/answer-sheet`,
      answerSheetMimeType: job.ansFile.mimeType,
      questionPaperUrl: `/api/assessments/${assessmentId}/question-paper`,
      questionPaperMimeType: job.qpFile.mimeType,
      questions,
      answers: finalAnswers,
      mappings,
      unmatchedAnswers,
      summary: {
        totalQuestions,
        answered,
        unanswered,
        needsReview,
      },
      answerSheetPagesCount: Math.max(1, pageCount),
    };

    // Save Assessment to Storage
    assessmentStorage.save({
      id: assessmentId,
      assessment,
      questionPaper: job.qpFile,
      answerSheet: job.ansFile,
      createdAt: new Date().toISOString(),
    });

    // Stage 4: AI Grading Evaluation
    assessmentStorage.updateJob(jobId, {
      status: "grading",
      stageIndex: 4,
      progress: 85,
      stageMessage: "Evaluating mathematical solutions and feedback...",
    });

    const gradeStart = Date.now();
    try {
      await batchGradeMappedAnswers(questions, finalAnswers, mappings);
      assessmentStorage.updateAssessment(assessmentId, assessment);
      console.log(`[JobProcessor] job=${jobId} stage=grading complete duration=${((Date.now() - gradeStart) / 1000).toFixed(1)}s`);
    } catch (gradeErr: any) {
      console.warn(`[JobProcessor Warning] Grading deferred for job=${jobId}:`, gradeErr?.message || gradeErr);
    }

    // Stage 5: Job Completed
    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[JobProcessor] job=${jobId} status=completed totalDuration=${totalDuration}s`);

    assessmentStorage.updateJob(jobId, {
      status: "completed",
      stageIndex: 5,
      progress: 100,
      stageMessage: "Assessment processing complete!",
      assessmentId,
      assessment,
    });
  } catch (err: any) {
    const errorMsg = err?.message || "An unexpected error occurred while processing the document.";
    console.error(`[JobProcessor Error] job=${jobId} failed:`, errorMsg);
    assessmentStorage.updateJob(jobId, {
      status: "failed",
      stageMessage: "Processing failed",
      error: {
        code: err?.code || "PROCESSING_FAILED",
        message: errorMsg,
      },
    });
  }
}
