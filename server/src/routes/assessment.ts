import { Router, Request, Response } from "express";
import { assessmentStorage } from "../services/storage.js";
import { batchGradeMappedAnswers } from "../services/gemini/gradeAnswers.js";

export const assessmentRouter = Router();

// GET /api/assessments/:id - Fetch full assessment JSON by ID
assessmentRouter.get(
  "/assessments/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = String(req.params.id);
      const assessment = assessmentStorage.getAssessment(id);

      if (!assessment) {
        res.status(404).json({ error: "Assessment not found" });
        return;
      }

      res.json(assessment);
    } catch (err: any) {
      console.error("[Assessment Route Error]:", err);
      res.status(500).json({ error: "Failed to retrieve assessment data" });
    }
  }
);

// GET /api/assessments/:id/answer-sheet - Return actual uploaded answer sheet file
assessmentRouter.get(
  "/assessments/:id/answer-sheet",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = String(req.params.id);
      const file = assessmentStorage.getAnswerSheetFile(id);

      if (!file) {
        res.status(404).json({ error: "Answer sheet file not found" });
        return;
      }

      res.setHeader("Content-Type", file.mimeType);
      res.setHeader("Content-Disposition", `inline; filename="${file.filename}"`);
      res.send(file.buffer);
    } catch (err: any) {
      console.error("[Answer Sheet Route Error]:", err);
      res.status(500).json({ error: "Failed to serve answer sheet file" });
    }
  }
);

// GET /api/assessments/:id/question-paper - Return actual uploaded question paper file
assessmentRouter.get(
  "/assessments/:id/question-paper",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = String(req.params.id);
      const file = assessmentStorage.getQuestionPaperFile(id);

      if (!file) {
        res.status(404).json({ error: "Question paper file not found" });
        return;
      }

      res.setHeader("Content-Type", file.mimeType);
      res.setHeader("Content-Disposition", `inline; filename="${file.filename}"`);
      res.send(file.buffer);
    } catch (err: any) {
      console.error("[Question Paper Route Error]:", err);
      res.status(500).json({ error: "Failed to serve question paper file" });
    }
  }
);

// POST /api/assessments/:id/grade - Asynchronously grade mapped answers
assessmentRouter.post(
  "/assessments/:id/grade",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = String(req.params.id);
      const stored = assessmentStorage.get(id);

      if (!stored) {
        res.status(404).json({ error: "Assessment not found" });
        return;
      }

      await batchGradeMappedAnswers(
        stored.assessment.questions,
        stored.assessment.answers,
        stored.assessment.mappings
      );

      assessmentStorage.updateAssessment(id, stored.assessment);
      res.json(stored.assessment);
    } catch (err: any) {
      console.error("[Grading Route Error]:", err);
      res.status(500).json({ error: "Failed to perform AI grading" });
    }
  }
);
