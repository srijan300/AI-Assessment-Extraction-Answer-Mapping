import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Loader2,
} from "lucide-react";
import type { BoundingBoxRegion } from "../../types/assessment";
import { AnswerHighlightOverlay } from "./AnswerHighlightOverlay";

interface DocumentViewerProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  regions: BoundingBoxRegion[];
  questionLabel?: string;
  isNeedsReview?: boolean;
  documentUrl?: string;
  documentMimeType?: string;
  documentPageImages?: string[];
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  totalPages,
  currentPage,
  onPageChange,
  regions,
  questionLabel,
  isNeedsReview,
  documentUrl,
  documentMimeType,
  documentPageImages,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 50));
  const handleResetZoom = () => setZoomLevel(100);

  const hasPageImage =
    documentPageImages && documentPageImages[currentPage - 1];
  const isPdf =
    documentMimeType?.includes("pdf") ||
    documentUrl?.toLowerCase().endsWith(".pdf") ||
    documentUrl?.startsWith("blob:");

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs transition-colors duration-200">
      {/* Document Toolbar */}
      <div className="h-14 bg-zinc-50 dark:bg-zinc-800/80 border-b border-zinc-200/80 dark:border-zinc-800 px-4 flex items-center justify-between shrink-0 font-sans">
        {/* Pagination Controls */}
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 font-mono">
            Page {currentPage} of {Math.max(1, totalPages)}
          </span>

          <button
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            onClick={handleResetZoom}
            className="px-2.5 py-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            title="Reset Zoom"
          >
            {zoomLevel}%
          </button>

          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={handleResetZoom}
            className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors hidden sm:flex"
            title="Fit Width"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas Scroll Area */}
      <div className="flex-1 overflow-auto bg-zinc-100/70 dark:bg-zinc-950 p-4 flex items-start justify-center custom-scrollbar">
        <div
          style={{ width: `${zoomLevel}%` }}
          className="relative bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-2xl shadow-md min-h-[650px] max-w-3xl overflow-hidden transition-all duration-200"
        >
          {/* Real Uploaded Document Content */}
          {hasPageImage ? (
            <img
              src={documentPageImages[currentPage - 1]}
              alt={`Answer Sheet Page ${currentPage}`}
              className="w-full h-auto block object-contain select-none"
            />
          ) : documentUrl ? (
            isPdf ? (
              <iframe
                src={documentUrl}
                title="Answer Sheet Document"
                className="w-full h-[750px] border-0 rounded-xl bg-white"
              />
            ) : (
              <img
                src={documentUrl}
                alt={`Answer Sheet Page ${currentPage}`}
                className="w-full h-auto block object-contain select-none"
              />
            )
          ) : (
            <div className="w-full min-h-[650px] flex flex-col items-center justify-center p-8 text-center space-y-3 text-zinc-400">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              <p className="text-xs font-semibold">Loading answer sheet document...</p>
            </div>
          )}

          {/* Highlighting Region Overlay */}
          <AnswerHighlightOverlay
            regions={regions}
            currentPage={currentPage}
            questionLabel={questionLabel}
            isNeedsReview={isNeedsReview}
          />
        </div>
      </div>
    </div>
  );
};
