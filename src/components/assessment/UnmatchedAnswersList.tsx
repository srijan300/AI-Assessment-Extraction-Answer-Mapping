import React, { useState } from "react";
import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import type { Answer } from "../../types/assessment";

interface UnmatchedAnswersListProps {
  unmatchedAnswers: Answer[];
  onSelectAnswer?: (answer: Answer) => void;
}

export const UnmatchedAnswersList: React.FC<UnmatchedAnswersListProps> = ({
  unmatchedAnswers,
  onSelectAnswer,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  if (unmatchedAnswers.length === 0) return null;

  return (
    <div className="mt-6 bg-amber-50/70 border border-amber-200 rounded-2xl p-4 transition-all">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <span>Unmatched Student Answers ({unmatchedAnswers.length})</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-amber-700" />
        ) : (
          <ChevronDown className="w-4 h-4 text-amber-700" />
        )}
      </button>

      {isOpen && (
        <div className="mt-3 space-y-2 pt-2 border-t border-amber-200/60">
          {unmatchedAnswers.map((ans) => {
            const firstRegionPage = ans.regions[0]?.page || 1;

            return (
              <div
                key={ans.id}
                onClick={() => onSelectAnswer && onSelectAnswer(ans)}
                className="bg-white rounded-xl p-3 border border-amber-200/80 shadow-xs hover:border-amber-400 cursor-pointer transition-colors text-xs"
              >
                <div className="flex items-center justify-between text-amber-900 font-semibold mb-1">
                  <span>Page {firstRegionPage}</span>
                  <span className="font-mono text-[11px] text-amber-700">
                    Confidence: {Math.round(ans.confidence * 100)}%
                  </span>
                </div>
                <p className="text-zinc-700 italic font-serif leading-relaxed">
                  "{ans.text}"
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
