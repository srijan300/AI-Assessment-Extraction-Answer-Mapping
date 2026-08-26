import type { Assessment } from "../schemas/assessment.js";

export interface StoredFile {
  buffer: Buffer;
  mimeType: string;
  filename: string;
}

export interface StoredAssessment {
  id: string;
  assessment: Assessment;
  questionPaper: StoredFile;
  answerSheet: StoredFile;
  createdAt: string;
}

class AssessmentStorage {
  private store = new Map<string, StoredAssessment>();

  public save(stored: StoredAssessment): void {
    this.store.set(stored.id, stored);
  }

  public get(id: string): StoredAssessment | undefined {
    return this.store.get(id);
  }

  public getAssessment(id: string): Assessment | undefined {
    return this.store.get(id)?.assessment;
  }

  public getAnswerSheetFile(id: string): StoredFile | undefined {
    return this.store.get(id)?.answerSheet;
  }

  public getQuestionPaperFile(id: string): StoredFile | undefined {
    return this.store.get(id)?.questionPaper;
  }

  public updateAssessment(id: string, updated: Assessment): void {
    const existing = this.store.get(id);
    if (existing) {
      existing.assessment = updated;
      this.store.set(id, existing);
    }
  }

  public listAll(): Assessment[] {
    return Array.from(this.store.values()).map((s) => s.assessment);
  }
}

export const assessmentStorage = new AssessmentStorage();
