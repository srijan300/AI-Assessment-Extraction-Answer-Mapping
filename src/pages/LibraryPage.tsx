import React from "react";
import { FileText, Download, FolderOpen, ExternalLink } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useAssessment } from "../context/AssessmentContext";
import { useNavigate } from "react-router-dom";

export const LibraryPage: React.FC = () => {
  const { assessments } = useAssessment();
  const navigate = useNavigate();

  const handleDownload = (url?: string, filename = "answer_sheet.pdf") => {
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex-1 bg-zinc-50/60 dark:bg-zinc-950 p-4 sm:p-8 font-sans transition-colors duration-200 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
          My Document Library
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Archive of uploaded question papers and student answer scans from your current session
        </p>
      </div>

      {assessments.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto my-12 space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900 flex items-center justify-center text-orange-500">
            <FolderOpen className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              No documents in library
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Uploaded question papers and answer sheets will appear here once an assessment is created.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {assessments.map((asm) => (
            <div
              key={asm.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {asm.title || "Uploaded Assessment Documents"}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Answer Sheet ({asm.answerSheetPagesCount || 1} Pages) • Uploaded on{" "}
                    {asm.createdAt ? new Date(asm.createdAt).toLocaleDateString() : "Today"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/exams/${asm.id}`)}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open</span>
                </Button>
                {asm.answerSheetUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(asm.answerSheetUrl, `${asm.id}_answersheet`)}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
