import { Router, Request, Response } from "express";
import multer from "multer";
import { assessmentStorage } from "../services/storage.js";
import { runAssessmentJob } from "../services/jobProcessor.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit per file
});

export const processRouter = Router();

// POST /api/process - Initiate Job-Based Assessment Processing
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
          success: false,
          error: {
            code: "MISSING_FILES",
            message: "Please upload both a Question Paper and a Student Answer Sheet.",
          },
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
          success: false,
          error: {
            code: "INVALID_FILE_TYPE",
            message: "Question Paper must be a valid PDF or Image (PNG, JPG, JPEG, WEBP).",
          },
        });
        return;
      }

      if (!allowedTypes.includes(ansFile.mimetype)) {
        res.status(400).json({
          success: false,
          error: {
            code: "INVALID_FILE_TYPE",
            message: "Answer Sheet must be a valid PDF or Image (PNG, JPG, JPEG, WEBP).",
          },
        });
        return;
      }

      // Idempotency check: if identical files are already being processed, return existing job
      const existingJob = assessmentStorage.findIdempotentJob(
        qpFile.originalname,
        qpFile.buffer.length,
        ansFile.originalname,
        ansFile.buffer.length
      );

      if (existingJob) {
        console.log(`[API /process] Idempotent hit: returning existing job '${existingJob.jobId}'`);
        res.status(200).json({
          success: true,
          jobId: existingJob.jobId,
          status: existingJob.status,
          stageIndex: existingJob.stageIndex,
          progress: existingJob.progress,
          stageMessage: existingJob.stageMessage,
        });
        return;
      }

      // Create new Job
      const storedQp = {
        buffer: qpFile.buffer,
        mimeType: qpFile.mimetype,
        filename: qpFile.originalname,
      };
      const storedAns = {
        buffer: ansFile.buffer,
        mimeType: ansFile.mimetype,
        filename: ansFile.originalname,
      };

      const job = assessmentStorage.createJob(storedQp, storedAns);
      console.log(`[API /process] Job created '${job.jobId}'. Launching background pipeline...`);

      // Launch async processing pipeline independently (non-blocking)
      runAssessmentJob(job.jobId).catch((err) => {
        console.error(`[API /process Error] Job execution failed for '${job.jobId}':`, err);
      });

      // Return immediately with 202 Accepted
      res.status(202).json({
        success: true,
        jobId: job.jobId,
        status: job.status,
        stageIndex: job.stageIndex,
        progress: job.progress,
        stageMessage: job.stageMessage,
      });
    } catch (err: any) {
      console.error("[API /process Exception]:", err);
      res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: err?.message || "An unexpected error occurred while starting assessment processing.",
        },
      });
    }
  }
);

// GET /api/process/job/:jobId - Poll Status of an Assessment Job
processRouter.get(
  "/process/job/:jobId",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const jobId = String(req.params.jobId);
      const job = assessmentStorage.getJob(jobId);

      if (!job) {
        res.status(404).json({
          success: false,
          error: {
            code: "JOB_NOT_FOUND",
            message: `Assessment processing job '${jobId}' was not found.`,
          },
        });
        return;
      }

      res.json({
        success: true,
        jobId: job.jobId,
        status: job.status,
        stageIndex: job.stageIndex,
        progress: job.progress,
        stageMessage: job.stageMessage,
        error: job.error || null,
        assessmentId: job.assessmentId || null,
        assessment: job.assessment || null,
      });
    } catch (err: any) {
      console.error("[API /process/job Exception]:", err);
      res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to fetch job status.",
        },
      });
    }
  }
);

// POST /api/process/retry/:jobId - Retry a Failed or Stalled Processing Job
processRouter.post(
  "/process/retry/:jobId",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const jobId = String(req.params.jobId);
      const job = assessmentStorage.getJob(jobId);

      if (!job) {
        res.status(404).json({
          success: false,
          error: {
            code: "JOB_NOT_FOUND",
            message: `Job '${jobId}' not found for retry.`,
          },
        });
        return;
      }

      assessmentStorage.updateJob(jobId, {
        status: "queued",
        stageIndex: 0,
        progress: 5,
        stageMessage: "Retrying processing...",
        error: null,
      });

      console.log(`[API /process/retry] Relaunching job '${jobId}'...`);
      runAssessmentJob(jobId).catch((err) => {
        console.error(`[API /process/retry Error] Job retry execution failed for '${jobId}':`, err);
      });

      res.json({
        success: true,
        jobId: job.jobId,
        status: "queued",
        stageIndex: 0,
        progress: 5,
        stageMessage: "Retrying processing...",
      });
    } catch (err: any) {
      console.error("[API /process/retry Exception]:", err);
      res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to restart processing job.",
        },
      });
    }
  }
);
