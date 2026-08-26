import type { Assessment, Question, Answer, AnswerMapping } from "../schemas/assessment.js";

export type JobStatus =
  | "queued"
  | "extracting_questions"
  | "extracting_answers"
  | "mapping_answers"
  | "grading"
  | "completed"
  | "failed";

export interface StoredFile {
  buffer: Buffer;
  mimeType: string;
  filename: string;
}

export interface AssessmentJob {
  jobId: string;
  status: JobStatus;
  stageIndex: number; // 0 to 5
  progress: number; // 0 to 100
  stageMessage: string;
  error?: {
    code: string;
    message: string;
  } | null;
  assessmentId?: string;
  assessment?: Assessment | null;
  qpFile: StoredFile;
  ansFile: StoredFile;
  intermediate?: {
    questions?: Question[];
    answers?: Answer[];
    pageCount?: number;
    mappings?: AnswerMapping[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface StoredAssessment {
  id: string;
  assessment: Assessment;
  questionPaper: StoredFile;
  answerSheet: StoredFile;
  createdAt: string;
}

class AssessmentStorage {
  private assessmentsStore = new Map<string, StoredAssessment>();
  private jobsStore = new Map<string, AssessmentJob>();

  // Job Management
  public createJob(qpFile: StoredFile, ansFile: StoredFile): AssessmentJob {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const job: AssessmentJob = {
      jobId,
      status: "queued",
      stageIndex: 0,
      progress: 5,
      stageMessage: "Queued for processing",
      error: null,
      qpFile,
      ansFile,
      intermediate: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.jobsStore.set(jobId, job);
    return job;
  }

  public getJob(jobId: string): AssessmentJob | undefined {
    return this.jobsStore.get(jobId);
  }

  public findIdempotentJob(
    qpName: string,
    qpSize: number,
    ansName: string,
    ansSize: number
  ): AssessmentJob | undefined {
    for (const job of this.jobsStore.values()) {
      if (
        job.qpFile.filename === qpName &&
        job.qpFile.buffer.length === qpSize &&
        job.ansFile.filename === ansName &&
        job.ansFile.buffer.length === ansSize &&
        job.status !== "failed"
      ) {
        return job;
      }
    }
    return undefined;
  }

  public updateJob(jobId: string, updates: Partial<AssessmentJob>): void {
    const job = this.jobsStore.get(jobId);
    if (job) {
      Object.assign(job, updates, { updatedAt: new Date().toISOString() });
      this.jobsStore.set(jobId, job);
    }
  }

  // Assessment Storage Management
  public save(stored: StoredAssessment): void {
    this.assessmentsStore.set(stored.id, stored);
  }

  public get(id: string): StoredAssessment | undefined {
    return this.assessmentsStore.get(id);
  }

  public getAssessment(id: string): Assessment | undefined {
    return this.assessmentsStore.get(id)?.assessment;
  }

  public getAnswerSheetFile(id: string): StoredFile | undefined {
    return this.assessmentsStore.get(id)?.answerSheet;
  }

  public getQuestionPaperFile(id: string): StoredFile | undefined {
    return this.assessmentsStore.get(id)?.questionPaper;
  }

  public updateAssessment(id: string, updated: Assessment): void {
    const existing = this.assessmentsStore.get(id);
    if (existing) {
      existing.assessment = updated;
      this.assessmentsStore.set(id, existing);
    }
  }

  public listAll(): Assessment[] {
    return Array.from(this.assessmentsStore.values()).map((s) => s.assessment);
  }
}

export const assessmentStorage = new AssessmentStorage();
