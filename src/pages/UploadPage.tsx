import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCard } from "../components/upload/UploadCard";
import { Button } from "../components/ui/Button";
import type { FileItem, Assessment } from "../types/assessment";
import { ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import { processAssessment } from "../lib/api";
import { ProcessingScreen } from "../components/processing/ProcessingScreen";
import { useAssessment } from "../context/AssessmentContext";

interface UploadPageProps {
  onAssessmentComplete?: (assessment: Assessment) => void;
}

export const UploadPage: React.FC<UploadPageProps> = ({ onAssessmentComplete }) => {
  const navigate = useNavigate();
  const { addAssessment } = useAssessment();

  const [qpFileItem, setQpFileItem] = useState<FileItem | null>(null);
  const [ansFileItem, setAnsFileItem] = useState<FileItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleQpSelect = (file: File) => {
    setErrorMessage(null);
    setQpFileItem({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
    });
  };

  const handleAnsSelect = (file: File) => {
    setErrorMessage(null);
    setAnsFileItem({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
    });
  };

  const handleStartProcess = async () => {
    if (!qpFileItem || !ansFileItem) {
      setErrorMessage("Please upload both a Question Paper and a Student Answer Sheet.");
      return;
    }

    setIsProcessing(true);

    try {
      // Generate object URLs for actual uploaded files so viewer renders real documents
      const ansUrl = URL.createObjectURL(ansFileItem.file);
      const qpUrl = URL.createObjectURL(qpFileItem.file);

      const assessmentData = await processAssessment(qpFileItem.file, ansFileItem.file);

      // Attach actual file blob URLs and mime types
      assessmentData.answerSheetUrl = ansUrl;
      assessmentData.answerSheetMimeType = ansFileItem.file.type;
      assessmentData.questionPaperUrl = qpUrl;
      assessmentData.questionPaperMimeType = qpFileItem.file.type;

      // Save to real session assessments context
      addAssessment(assessmentData);

      if (onAssessmentComplete) {
        onAssessmentComplete(assessmentData);
      }

      setIsProcessing(false);
      navigate(`/exams/${assessmentData.id}`);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(
        err.message || "An error occurred during AI processing. Please try again."
      );
    }
  };

  if (isProcessing) {
    return <ProcessingScreen currentStageIndex={3} />;
  }

  const isReady = Boolean(qpFileItem && ansFileItem);

  return (
    <div className="flex-1 bg-gradient-to-b from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex flex-col items-center justify-center p-4 sm:p-8 min-h-[calc(100vh-4rem)] font-sans transition-colors duration-200">
      <div className="max-w-3xl w-full flex flex-col items-center text-center space-y-8">
        {/* Title & Subtitle */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 dark:bg-zinc-800 text-white text-xs font-semibold shadow-sm mb-1">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Step 1: Upload Documents</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Upload{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
              Question Paper & Answer Sheet
            </span>
          </h1>
          <p className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
            Upload both documents to run automated question extraction, student answer region detection, and visual mapping.
          </p>
        </div>

        {/* Dual Upload Dropzone Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
          <UploadCard
            title="Upload Question Paper"
            subtitle="PDF, PNG, JPG (Max 25MB)"
            fileItem={qpFileItem}
            onFileSelect={handleQpSelect}
            onFileRemove={() => setQpFileItem(null)}
          />

          <UploadCard
            title="Upload Answer Sheet"
            subtitle="PDF, PNG, JPG (Max 25MB)"
            fileItem={ansFileItem}
            onFileSelect={handleAnsSelect}
            onFileRemove={() => setAnsFileItem(null)}
          />
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center justify-center gap-2 text-rose-600 dark:text-rose-300 text-xs font-semibold w-full max-w-md">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* CTA Process Action */}
        <div className="space-y-3 pt-2">
          <Button
            size="lg"
            disabled={!isReady}
            onClick={handleStartProcess}
            className="w-56 shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            <span>Start Mapping</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>

          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
            Once both files are uploaded, click Start Mapping to process.
          </p>
        </div>
      </div>
    </div>
  );
};
