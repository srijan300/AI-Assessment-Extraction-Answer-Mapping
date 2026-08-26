import { Router, Request, Response } from "express";
import multer from "multer";
import { extractQuestionsFromPaper } from "../services/gemini/extractQuestions.js";
import { extractAnswersFromSheet } from "../services/gemini/extractAnswers.js";
import { mapQuestionsToAnswers } from "../services/gemini/mapAnswers.js";
import { batchGradeMappedAnswers } from "../services/gemini/gradeAnswers.js";
import { Assessment } from "../schemas/assessment.js";
import { assessmentStorage } from "../services/storage.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB file limit
});

export const processRouter = Router();

processRouter.post(
  "/process",
  upload.fields([
    { name: "questionPaper", maxCount: 1 },
    { name: "answerSheet", maxCount: 1 },
  ]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

      if (!files || !files["questionPaper"]?.[0] || !files["answerSheet"]?.[0]) {
        res.status(400).json({
          error: "Please upload both a Question Paper and a Student Answer Sheet.",
        });
        return;
      }

      const qpFile = files["questionPaper"][0];
      const ansFile = files["answerSheet"][0];

      const allowedTypes = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
      ];

      if (!allowedTypes.includes(qpFile.mimetype)) {
        res.status(400).json({
          error: "Question Paper must be a valid PDF or Image (PNG, JPG, JPEG).",
        });
        return;
      }

      if (!allowedTypes.includes(ansFile.mimetype)) {
        res.status(400).json({
          error: "Answer Sheet must be a valid PDF or Image (PNG, JPG, JPEG).",
        });
        return;
      }

      const assessmentId = `assessment_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      console.log(`[Process Pipeline] Processing Assessment ${assessmentId}: QP=${qpFile.originalname}, AS=${ansFile.originalname}`);

      // Stage 1 & 2: Extract Questions and Handwritten Answers concurrently
      const [questions, { answers, pageCount }] = await Promise.all([
        extractQuestionsFromPaper(qpFile.buffer, qpFile.mimetype, qpFile.originalname),
        extractAnswersFromSheet(ansFile.buffer, ansFile.mimetype, ansFile.originalname),
      ]);

      // Stage 3: Map Questions to Answers across all pages
      const { mappings, unmatchedAnswers, finalAnswers } = mapQuestionsToAnswers(questions, answers, pageCount);

      // Compute Summary Statistics
      const totalQuestions = questions.length;
      const answered = mappings.filter((m) => m.status === "answered").length;
      const unanswered = mappings.filter((m) => m.status === "unanswered").length;
      const needsReview = mappings.filter((m) => m.status === "needs_review").length;

      const cleanTitle = qpFile.originalname.replace(/\.[^/.]+$/, "").replace(/^\[.*?\]\s*/, "");

      const assessment: Assessment = {
        id: assessmentId,
        title: `${cleanTitle} Assessment`,
        createdAt: new Date().toISOString(),
        answerSheetUrl: `/api/assessments/${assessmentId}/answer-sheet`,
        answerSheetMimeType: ansFile.mimetype,
        questionPaperUrl: `/api/assessments/${assessmentId}/question-paper`,
        questionPaperMimeType: qpFile.mimetype,
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

      // Save to persistent in-memory store
      assessmentStorage.save({
        id: assessmentId,
        assessment,
        questionPaper: {
          buffer: qpFile.buffer,
          mimeType: qpFile.mimetype,
          filename: qpFile.originalname,
        },
        answerSheet: {
          buffer: ansFile.buffer,
          mimeType: ansFile.mimetype,
          filename: ansFile.originalname,
        },
        createdAt: new Date().toISOString(),
      });

      // Trigger background AI grading asynchronously
      batchGradeMappedAnswers(questions, finalAnswers, mappings)
        .then(() => {
          assessmentStorage.updateAssessment(assessmentId, assessment);
          console.log(`[Process Pipeline] Async AI grading finished for ${assessmentId}.`);
        })
        .catch((err) => {
          console.warn(`[Process Pipeline Warning] Async AI grading deferred:`, err?.message || err);
        });

      console.log(`[Process Pipeline] Ready: ${totalQuestions} Questions, ${answered} Answered, ${unanswered} Unanswered, ${needsReview} Needs Review.`);
      res.json(assessment);
    } catch (err: any) {
      console.error("Error processing assessment:", err);
      res.status(500).json({
        error: "We couldn't process the assessment. Please verify your document files and try again.",
      });
    }
  }
);
