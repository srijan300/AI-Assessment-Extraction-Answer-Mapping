import React, { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Loader2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import type { BoundingBoxRegion } from "../../types/assessment";
import { AnswerHighlightOverlay } from "./AnswerHighlightOverlay";

// Configure pdfjs worker for canvas PDF rendering
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

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
  totalPages: propTotalPages,
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
  const [numPdfPages, setNumPdfPages] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<boolean>(false);
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(true);
  const [containerWidth, setContainerWidth] = useState<number>(750);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalPages = numPdfPages || propTotalPages || 1;

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth - 32);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 50));
  const handleResetZoom = () => setZoomLevel(100);

  const hasPageImage =
    documentPageImages && documentPageImages[currentPage - 1];

  const isImage =
    documentMimeType?.includes("image") ||
    /\.(png|jpg|jpeg|webp)$/i.test(documentUrl || "");

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPdfPages(numPages);
    setIsPdfLoading(false);
    setLoadError(false);
  };

  const handleDocumentLoadError = (error: Error) => {
    console.error("[DocumentViewer] PDF Load Error:", error);
    setIsPdfLoading(false);
    setLoadError(true);
  };

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

      {/* Main Document Scroll View Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-zinc-100/70 dark:bg-zinc-950 p-4 flex items-start justify-center custom-scrollbar"
      >
        {loadError ? (
          <div className="w-full max-w-md my-auto bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-8 text-center flex flex-col items-center justify-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center justify-center text-rose-500">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Unable to load answer sheet
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                The assessment data was processed successfully, but the document viewer could not render the original file.
              </p>
            </div>
            <button
              onClick={() => {
                setLoadError(false);
                setIsPdfLoading(true);
              }}
              className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-xs font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Loading</span>
            </button>
          </div>
        ) : (
          <div
            style={{ width: `${zoomLevel}%` }}
            className="relative bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-2xl shadow-md min-h-[650px] max-w-3xl overflow-hidden transition-all duration-200 flex flex-col items-center justify-center"
          >
            {/* Real Uploaded Document Content */}
            {hasPageImage ? (
              <img
                src={documentPageImages[currentPage - 1]}
                alt={`Answer Sheet Page ${currentPage}`}
                className="w-full h-auto block object-contain select-none"
              />
            ) : isImage && documentUrl ? (
              <img
                src={documentUrl}
                alt={`Answer Sheet Page ${currentPage}`}
                className="w-full h-auto block object-contain select-none"
              />
            ) : documentUrl ? (
              <div className="relative w-full flex items-center justify-center min-h-[650px]">
                {isPdfLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-zinc-900/80 z-10 space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                    <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Rendering page {currentPage}...
                    </p>
                  </div>
                )}
                <Document
                  file={documentUrl}
                  onLoadSuccess={handleDocumentLoadSuccess}
                  onLoadError={handleDocumentLoadError}
                  loading={null}
                  className="flex flex-col items-center"
                >
                  <Page
                    pageNumber={Math.min(currentPage, totalPages)}
                    width={Math.max(300, containerWidth)}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </Document>
              </div>
            ) : (
              <div className="w-full min-h-[650px] flex flex-col items-center justify-center p-8 text-center space-y-3 text-zinc-400">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                <p className="text-xs font-semibold">Loading answer sheet document...</p>
              </div>
            )}

            {/* Highlighting Region Bounding Box Overlay */}
            <AnswerHighlightOverlay
              regions={regions}
              currentPage={currentPage}
              questionLabel={questionLabel}
              isNeedsReview={isNeedsReview}
            />
          </div>
        )}
      </div>
    </div>
  );
};
