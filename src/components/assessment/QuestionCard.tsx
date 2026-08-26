import React, { useState } from "react";
import type { Question, Answer, Mapping } from "../../types/assessment";
import { Sparkles, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { gradeAnswer } from "../../lib/api";

interface QuestionCardProps {
  question: Question;
  mapping?: Mapping;
  answer?: Answer;
  isSelected: boolean;
  onSelect: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  mapping,
  answer,
  isSelected,
  onSelect,
}) => {
  const [isGrading, setIsGrading] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(isSelected);
  const [dynamicGrade, setDynamicGrade] = useState<{
    awardedMarks: number;
    maximumMarks: number;
    correctness: string;
    aiFeedback: string;
  } | null>(null);

  const handleEvaluateClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!answer) return;

    setIsGrading(true);
    try {
      const result = await gradeAnswer(question, answer, question.marks || 5);
      setDynamicGrade(result);
    } catch (err) {
      console.warn("AI Grading error:", err);
    } finally {
      setIsGrading(false);
    }
  };

  const hasGrading =
    typeof dynamicGrade?.awardedMarks === "number" ||
    typeof mapping?.awardedMarks === "number";

  const awardedMarks = dynamicGrade?.awardedMarks ?? mapping?.awardedMarks;
  const maxMarks = dynamicGrade?.maximumMarks ?? question.marks ?? 5;
  const currentFeedback = dynamicGrade?.aiFeedback || mapping?.aiFeedback;
  const isUnanswered = mapping?.status === "unanswered";

  return (
    <div
      onClick={() => {
        onSelect();
        setIsExpanded(!isExpanded);
      }}
      className={`rounded-2xl p-4 border transition-all duration-200 cursor-pointer select-none ${
        isSelected
          ? "bg-white dark:bg-zinc-900 border-2 border-orange-500 shadow-md ring-2 ring-orange-500/10"
          : "bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs"
      }`}
    >
      {/* Top Header Row matching Figma design */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Circular Question Number Badge */}
          <div className="w-7 h-7 rounded-full bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
            {question.number}
          </div>

          {/* Question Text preview */}
          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate leading-snug">
            {question.text}
          </h4>
        </div>

        {/* Score Pill & Chevron */}
        <div className="flex items-center gap-2 shrink-0">
          {hasGrading ? (
            <span className="font-mono font-bold text-xs bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-800">
              {awardedMarks}/{maxMarks}
            </span>
          ) : isUnanswered ? (
            <span className="font-mono font-semibold text-xs bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900">
              Unanswered
            </span>
          ) : (
            <span className="font-mono font-medium text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full">
              Grading pending
            </span>
          )}

          <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5">
            {isSelected || isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Feedback Panel */}
      {(isSelected || isExpanded) && (
        <div className="mt-3.5 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
          <div className="bg-zinc-50/80 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-700/60 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span>AI Evaluation & Feedback</span>
              </span>

              {answer && !hasGrading && (
                <button
                  onClick={handleEvaluateClick}
                  disabled={isGrading}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:underline"
                >
                  <RefreshCw className={`w-3 h-3 ${isGrading ? "animate-spin" : ""}`} />
                  <span>{isGrading ? "Evaluating..." : "Evaluate with AI"}</span>
                </button>
              )}
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-sans">
              {currentFeedback ||
                (isUnanswered
                  ? "No student response detected for this question."
                  : "AI evaluation pending. Click Evaluate to generate instant detailed feedback.")}
            </p>
          </div>

          {/* Student Response snippet if available */}
          {answer && answer.text ? (
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 italic pl-1 border-l-2 border-orange-400">
              "{answer.text.length > 150 ? answer.text.slice(0, 150) + "..." : answer.text}"
            </div>
          ) : isUnanswered ? (
            <div className="text-[11px] text-zinc-400 dark:text-zinc-500 italic">
              No student handwritten answer detected on answer sheet.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
