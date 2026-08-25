import React from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText, X } from "lucide-react";
import type { FileItem } from "../../types/assessment";
import { formatBytes } from "../../lib/utils";

interface UploadCardProps {
  title: string;
  subtitle?: string;
  fileItem: FileItem | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  errorMessage?: string | null;
}

export const UploadCard: React.FC<UploadCardProps> = ({
  title,
  subtitle = "PDF, PNG, JPG",
  fileItem,
  onFileSelect,
  onFileRemove,
  errorMessage,
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
    },
    maxFiles: 1,
    maxSize: 25 * 1024 * 1024,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
  });

  return (
    <div className="w-full">
      {fileItem ? (
        <div className="bg-white dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 flex items-center justify-center min-h-[180px] shadow-sm relative transition-all">
          <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 px-4 py-3 rounded-2xl shadow-xs max-w-full overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0 font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div className="overflow-hidden min-w-0 pr-2 text-left">
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {fileItem.name}
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                {formatBytes(fileItem.size)}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFileRemove();
              }}
              className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 hover:bg-rose-500 hover:text-white text-zinc-600 dark:text-zinc-300 flex items-center justify-center transition-colors shrink-0 ml-auto cursor-pointer"
              title="Remove File"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`bg-white dark:bg-zinc-900 border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center min-h-[180px] cursor-pointer transition-all duration-200 ${
            isDragActive
              ? "border-orange-500 bg-orange-50/50 dark:bg-orange-950/30 scale-[1.01]"
              : "border-zinc-200 dark:border-zinc-800 hover:border-orange-400 dark:hover:border-orange-500 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40"
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 mb-3 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-6 h-6 text-zinc-700 dark:text-zinc-200" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">
            {title}
          </h3>
          <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
            {subtitle}
          </p>
        </div>
      )}

      {errorMessage && (
        <p className="mt-2 text-xs text-rose-500 font-medium text-center">{errorMessage}</p>
      )}
    </div>
  );
};
