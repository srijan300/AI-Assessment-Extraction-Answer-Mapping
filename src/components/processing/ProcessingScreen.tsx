import React from "react";
import { Check, Sparkles, Loader2 } from "lucide-react";

interface ProcessingScreenProps {
  currentStageIndex: number;
}

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({
  currentStageIndex,
}) => {
  const stages = [
    { title: "Reading Question Paper", desc: "Parsing PDF & vision layout" },
    { title: "Extracting Questions", desc: "Preserving subparts & order" },
    { title: "Reading Answer Sheet", desc: "Analyzing student handwriting" },
    { title: "Detecting Handwritten Answers", desc: "Bounding full response blocks" },
    { title: "Mapping Answers to Questions", desc: "Matching explicit & semantic IDs" },
    { title: "Identifying Bounding Regions", desc: "Calculating normalized coordinates" },
    { title: "Preparing Interactive Viewer", desc: "Rendering responsive overlays" },
    { title: "Assessment Ready", desc: "Finalizing scorecards & summary" },
  ];

  const progressPercent = Math.min(
    100,
    Math.round(((currentStageIndex + 1) / stages.length) * 100)
  );

  return (
    <div className="flex-1 bg-gradient-to-b from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex flex-col items-center justify-center p-6 min-h-[calc(100vh-4rem)] font-sans transition-colors duration-200">
      <div className="max-w-xl w-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-8 shadow-xl space-y-6">
        {/* Animated Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center mx-auto shadow-md shadow-orange-500/20">
            <Sparkles className="w-7 h-7 animate-spin" style={{ animationDuration: "3s" }} />
          </div>
          <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Mapping Assessment...
          </h2>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Multimodal Gemini Vision Pipeline in progress
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
            <span>Overall Progress</span>
            <span className="font-mono text-orange-600 dark:text-orange-400">
              {progressPercent}%
            </span>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-zinc-200/60 dark:border-zinc-700">
            <div
              className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Vertical Pipeline Checklist */}
        <div className="space-y-3 pt-2">
          {stages.map((stage, idx) => {
            const isDone = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3.5 p-3 rounded-2xl border transition-all duration-200 ${
                  isDone
                    ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-300"
                    : isCurrent
                    ? "bg-orange-50/60 dark:bg-orange-950/30 border-orange-300 dark:border-orange-800 text-zinc-900 dark:text-zinc-100 shadow-2xs scale-[1.01]"
                    : "bg-zinc-50/40 dark:bg-zinc-800/20 border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600 opacity-60"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                    isDone
                      ? "bg-emerald-500 text-white"
                      : isCurrent
                      ? "bg-orange-500 text-white"
                      : "bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500"
                  }`}
                >
                  {isDone ? (
                    <Check className="w-4 h-4" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold truncate">{stage.title}</h4>
                  <p className="text-[11px] opacity-75 truncate">{stage.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
