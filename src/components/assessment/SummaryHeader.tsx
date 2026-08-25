import React from "react";
import { CheckCircle2, AlertCircle, HelpCircle, FileText, Download } from "lucide-react";
import type { AssessmentSummary } from "../../types/assessment";
import { Button } from "../ui/Button";

interface SummaryHeaderProps {
  summary: AssessmentSummary;
  answerSheetUrl?: string;
  assessmentTitle?: string;
}

export const SummaryHeader: React.FC<SummaryHeaderProps> = ({
  summary,
  answerSheetUrl,
  assessmentTitle = "Assessment Evaluation",
}) => {
  const handleDownloadPdf = () => {
    if (answerSheetUrl) {
      const a = document.createElement("a");
      a.href = answerSheetUrl;
      a.download = `${assessmentTitle.replace(/\s+/g, "_")}_AnswerSheet.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Generate a dynamic PDF report blob
      const reportText = `VedaAI Assessment Report: ${assessmentTitle}\nTotal Questions: ${summary.totalQuestions}\nAnswered: ${summary.answered}\nUnanswered: ${summary.unanswered}\nNeeds Review: ${summary.needsReview}`;
      const blob = new Blob([reportText], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${assessmentTitle.replace(/\s+/g, "_")}_Report.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4 font-sans mb-6 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-900 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold shrink-0">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Assessment Overview
          </h2>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Click any question to view its mapped answer region on the handwritten answer sheet
          </p>
        </div>
      </div>

      {/* Stats Pills & PDF Export */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Total */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
          <span className="text-zinc-500 dark:text-zinc-400">Total:</span>
          <span className="font-bold">{summary.totalQuestions}</span>
        </div>

        {/* Answered */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Answered:</span>
          <span className="font-bold">{summary.answered}</span>
        </div>

        {/* Unanswered */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs font-semibold text-rose-800 dark:text-rose-300">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          <span>Unanswered:</span>
          <span className="font-bold">{summary.unanswered}</span>
        </div>

        {/* Needs Review */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs font-semibold text-amber-800 dark:text-amber-300">
          <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Needs Review:</span>
          <span className="font-bold">{summary.needsReview}</span>
        </div>

        {/* Download PDF Button */}
        <Button size="sm" variant="outline" onClick={handleDownloadPdf} className="ml-1">
          <Download className="w-3.5 h-3.5" />
          <span>Download PDF</span>
        </Button>
      </div>
    </div>
  );
};
