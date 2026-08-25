import React from "react";
import { AlertTriangle, XCircle, Info } from "lucide-react";

interface ErrorBannerProps {
  title?: string;
  message: string;
  variant?: "error" | "warning" | "info";
  onDismiss?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  title,
  message,
  variant = "warning",
  onDismiss,
}) => {
  const styles = {
    error: {
      container: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-200",
      icon: <XCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    },
    warning: {
      container: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200",
      icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    },
    info: {
      container: "bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/60 text-sky-900 dark:text-sky-200",
      icon: <Info className="w-5 h-5 text-sky-500 shrink-0" />,
    },
  };

  const current = styles[variant];

  return (
    <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs font-medium shadow-2xs ${current.container}`}>
      {current.icon}
      <div className="flex-1">
        {title && <h5 className="font-bold text-sm mb-0.5">{title}</h5>}
        <p className="leading-relaxed">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-xs font-bold"
        >
          ✕
        </button>
      )}
    </div>
  );
};
