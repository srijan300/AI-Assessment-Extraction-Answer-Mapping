import React from "react";
import type { Question, Mapping, Answer } from "../../types/assessment";
import { QuestionCard } from "./QuestionCard";
import { UnmatchedAnswersList } from "./UnmatchedAnswersList";

interface QuestionListProps {
  questions: Question[];
  mappings: Mapping[];
  answers: Answer[];
  unmatchedAnswers: Answer[];
  selectedQuestionId: string | null;
  onSelectQuestion: (questionId: string) => void;
  onSelectUnmatchedAnswer?: (answer: Answer) => void;
}

export const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  mappings,
  answers,
  unmatchedAnswers,
  selectedQuestionId,
  onSelectQuestion,
  onSelectUnmatchedAnswer,
}) => {
  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
          Extracted Questions ({questions.length})
        </h3>
        <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
          Select to view answer region
        </span>
      </div>

      <div className="space-y-3 overflow-y-auto pr-1 max-h-[calc(100vh-16rem)] custom-scrollbar">
        {questions.map((question) => {
          const mapping = mappings.find((m) => m.questionId === question.id);
          const answer = answers.find((a) => a.id === mapping?.answerId);

          return (
            <QuestionCard
              key={question.id}
              question={question}
              mapping={mapping}
              answer={answer}
              isSelected={selectedQuestionId === question.id}
              onSelect={() => onSelectQuestion(question.id)}
            />
          );
        })}

        <UnmatchedAnswersList
          unmatchedAnswers={unmatchedAnswers}
          onSelectAnswer={onSelectUnmatchedAnswer}
        />
      </div>
    </div>
  );
};
