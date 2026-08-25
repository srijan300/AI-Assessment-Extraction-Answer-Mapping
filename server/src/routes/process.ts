import { Router, Request, Response } from "express";
import multer from "multer";
import { extractQuestionsFromPaper } from "../services/gemini/extractQuestions.js";
import { extractAnswersFromSheet } from "../services/gemini/extractAnswers.js";
import { mapQuestionsToAnswers } from "../services/gemini/mapAnswers.js";
import { gradeStudentAnswer } from "../services/gemini/gradeAnswers.js";
import { Assessment } from "../schemas/assessment.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
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

      // Validate MIME types
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

      console.log(`[Process Pipeline] Received files: QP=${qpFile.originalname} (${qpFile.size}B), AS=${ansFile.originalname} (${ansFile.size}B)`);

      // Stage 1 & 2: Extract Questions
      const questions = await extractQuestionsFromPaper(
        qpFile.buffer,
        qpFile.mimetype,
        qpFile.originalname
      );

      // Stage 3 & 4: Extract Answers & Regions
      const { answers, pageCount } = await extractAnswersFromSheet(
        ansFile.buffer,
        ansFile.mimetype,
        ansFile.originalname
      );

      // Stage 5 & 6: Map Answers
      const { mappings, unmatchedAnswers } = mapQuestionsToAnswers(questions, answers);

      // Stage 7: Grade Mapped Answers in Parallel
      await Promise.all(
        mappings.map(async (map) => {
          if (map.answerId && map.status !== "unanswered") {
            const q = questions.find((item) => item.id === map.questionId);
            const a = answers.find((item) => item.id === map.answerId);

            if (q && a) {
              try {
                const gradeRes = await gradeStudentAnswer(q, a);
                map.awardedMarks = gradeRes.awardedMarks;
                map.aiFeedback = gradeRes.aiFeedback;
                map.correctness = gradeRes.correctness;
              } catch (gradeErr) {
                console.warn(`[Process Pipeline] Grading skipped for ${q.id}:`, gradeErr);
              }
            }
          }
        })
      );

      // Compute Summary Statistics
      const totalQuestions = questions.length;
      const answered = mappings.filter((m) => m.status === "answered").length;
      const unanswered = mappings.filter((m) => m.status === "unanswered").length;
      const needsReview = mappings.filter((m) => m.status === "needs_review").length;

      const assessment: Assessment = {
        id: `assessment_${Date.now()}`,
        title: `${qpFile.originalname.replace(/\.[^/.]+$/, "")} Assessment`,
        createdAt: new Date().toISOString(),
        questions,
        answers,
        mappings,
        unmatchedAnswers,
        summary: {
          totalQuestions,
          answered,
          unanswered,
          needsReview,
        },
        answerSheetPagesCount: pageCount || 2,
      };

      console.log(`[Process Pipeline] Complete: ${totalQuestions} Total, ${answered} Answered, ${unanswered} Unanswered, ${needsReview} Needs Review`);

      res.json(assessment);
    } catch (err: any) {
      console.error("Error processing assessment:", err);
      res.status(500).json({
        error: "We couldn't process the assessment. Please verify your document files and try again.",
      });
    }
  }
);
