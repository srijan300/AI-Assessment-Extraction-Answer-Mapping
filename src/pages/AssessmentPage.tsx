import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Assessment, Answer } from "../types/assessment";
import { SummaryHeader } from "../components/assessment/SummaryHeader";
import { QuestionList } from "../components/assessment/QuestionList";
import { DocumentViewer } from "../components/answer-viewer/DocumentViewer";
import { useAssessment } from "../context/AssessmentContext";
import { fetchAssessmentById } from "../lib/api";
import { FolderOpen, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "../components/ui/Button";

interface AssessmentPageProps {
  assessment?: Assessment | null;
}

export const AssessmentPage: React.FC<AssessmentPageProps> = ({
  assessment: propAssessment,
}) => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { getAssessmentById, addAssessment } = useAssessment();

  const [assessment, setAssessment] = useState<Assessment | null>(
    propAssessment || (examId ? getAssessmentById(examId) || null : null)
  );
  const [isLoading, setIsLoading] = useState<boolean>(!assessment && Boolean(examId));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!assessment && examId) {
      setIsLoading(true);
      fetchAssessmentById(examId)
        .then((data) => {
          setAssessment(data);
          addAssessment(data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load assessment by ID:", err);
          setErrorMessage(err?.message || "Assessment not found");
          setIsLoading(false);
        });
    }
  }, [examId]);

  if (isLoading) {
    return (
      <div className="flex-1 bg-zinc-50/60 dark:bg-zinc-950 p-4 sm:p-8 font-sans flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
          <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
            Loading assessment workspace...
          </p>
        </div>
      </div>
    );
  }

  if (!assessment || errorMessage) {
    return (
      <div className="flex-1 bg-zinc-50/60 dark:bg-zinc-950 p-4 sm:p-8 font-sans flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-10 text-center flex flex-col items-center justify-center max-w-md w-full space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-center justify-center text-amber-500">
            <FolderOpen className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Assessment not found
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {errorMessage || "The requested assessment ID does not exist or has expired."}
            </p>
          </div>
          <Button size="md" onClick={() => navigate("/exams")} className="mt-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Exams</span>
          </Button>
        </div>
      </div>
    );
  }

  return <AssessmentWorkspace assessment={assessment} />;
};

const AssessmentWorkspace: React.FC<{ assessment: Assessment }> = ({ assessment }) => {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    assessment.questions[0]?.id || null
  );

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [mobileTab, setMobileTab] = useState<"questions" | "viewer">("questions");

  const selectedQuestion = assessment.questions.find((q) => q.id === selectedQuestionId);
  const selectedMapping = assessment.mappings.find((m) => m.questionId === selectedQuestionId);
  const selectedAnswer = assessment.answers.find((a) => a.id === selectedMapping?.answerId);

  const handleSelectQuestion = (questionId: string) => {
    setSelectedQuestionId(questionId);

    const mapping = assessment.mappings.find((m) => m.questionId === questionId);
    const answer = assessment.answers.find((a) => a.id === mapping?.answerId);

    if (answer && answer.regions && answer.regions.length > 0) {
      const targetPage = answer.regions[0].page;
      setCurrentPage(targetPage);
    }
  };

  const handleSelectUnmatchedAnswer = (answer: Answer) => {
    setSelectedQuestionId(null);
    if (answer.regions && answer.regions.length > 0) {
      setCurrentPage(answer.regions[0].page);
    }
  };

  const activeRegions = selectedAnswer ? selectedAnswer.regions : [];

  return (
    <div className="flex-1 bg-zinc-50/50 dark:bg-zinc-950 p-4 sm:p-6 font-sans overflow-x-hidden transition-colors duration-200">
      <SummaryHeader
        summary={assessment.summary}
        answerSheetUrl={assessment.answerSheetUrl}
        assessmentTitle={assessment.title}
        assessment={assessment}
      />

      {/* Mobile Tab Switcher */}
      <div className="flex md:hidden bg-zinc-200 dark:bg-zinc-800 p-1 rounded-2xl mb-4 text-xs font-semibold">
        <button
          onClick={() => setMobileTab("questions")}
          className={`flex-1 py-2 rounded-xl transition-colors ${
            mobileTab === "questions"
              ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs font-bold"
              : "text-zinc-600 dark:text-zinc-400"
          }`}
        >
          Questions ({assessment.questions.length})
        </button>
        <button
          onClick={() => setMobileTab("viewer")}
          className={`flex-1 py-2 rounded-xl transition-colors ${
            mobileTab === "viewer"
              ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs font-bold"
              : "text-zinc-600 dark:text-zinc-400"
          }`}
        >
          Answer Sheet (Page {currentPage})
        </button>
      </div>

      {/* 2-Pane Split View */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Pane: Questions List */}
        <div
          className={`md:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-5 shadow-xs ${
            mobileTab === "questions" ? "block" : "hidden md:block"
          }`}
        >
          <QuestionList
            questions={assessment.questions}
            mappings={assessment.mappings}
            answers={assessment.answers}
            unmatchedAnswers={assessment.unmatchedAnswers}
            selectedQuestionId={selectedQuestionId}
            onSelectQuestion={handleSelectQuestion}
            onSelectUnmatchedAnswer={handleSelectUnmatchedAnswer}
          />
        </div>

        {/* Right Pane: Document Viewer */}
        <div
          className={`md:col-span-7 h-[calc(100vh-12rem)] min-h-[600px] sticky top-20 ${
            mobileTab === "viewer" ? "block" : "hidden md:block"
          }`}
        >
          <DocumentViewer
            totalPages={assessment.answerSheetPagesCount || 1}
            currentPage={currentPage}
            onPageChange={(pg) => setCurrentPage(pg)}
            regions={activeRegions}
            questionLabel={selectedQuestion ? `Q${selectedQuestion.number}.` : "Q."}
            isNeedsReview={selectedMapping?.status === "needs_review"}
            documentUrl={assessment.answerSheetUrl}
            documentMimeType={assessment.answerSheetMimeType}
            documentPageImages={assessment.answerSheetPageImages}
          />
        </div>
      </div>
    </div>
  );
};
