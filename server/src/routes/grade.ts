import { Router, Request, Response } from "express";
import { GradeRequestSchema } from "../schemas/assessment.js";
import { gradeStudentAnswer } from "../services/gemini/gradeAnswers.js";

export const gradeRouter = Router();

gradeRouter.post("/grade", async (req: Request, res: Response): Promise<void> => {
  try {
    const validated = GradeRequestSchema.safeParse(req.body);
    if (!validated.success) {
      res.status(400).json({ error: "Invalid request payload for grading." });
      return;
    }

    const { question, answer, maximumMarks } = validated.data;
    const result = await gradeStudentAnswer(question, answer, maximumMarks);

    res.json(result);
  } catch (err) {
    console.error("Grading API Error:", err);
    res.status(500).json({ error: "Failed to grade the answer." });
  }
});
