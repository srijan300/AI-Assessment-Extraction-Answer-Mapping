import React from "react";
import type { BoundingBoxRegion } from "../../types/assessment";
import { normalizedBoxToPercent } from "../../lib/utils";

interface AnswerHighlightOverlayProps {
  regions: BoundingBoxRegion[];
  currentPage: number;
  questionLabel?: string;
  isNeedsReview?: boolean;
}

export const AnswerHighlightOverlay: React.FC<AnswerHighlightOverlayProps> = ({
  regions,
  currentPage,
  questionLabel = "Q1.",
  isNeedsReview = false,
}) => {
  const currentPageRegions = regions.filter((r) => r.page === currentPage);

  if (currentPageRegions.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {currentPageRegions.map((region, idx) => {
        const style = normalizedBoxToPercent(region.box);

        return (
          <div
            key={idx}
            style={style}
            className={`absolute rounded-xl border-2 transition-all duration-300 ${
              isNeedsReview
                ? "border-orange-500 bg-orange-500/15 shadow-lg shadow-orange-500/20"
                : "border-emerald-500 bg-emerald-500/15 shadow-lg shadow-emerald-500/20"
            }`}
          >
            {/* Region Label Badge matching Figma design */}
            <div
              className={`absolute -top-3.5 left-2 px-2.5 py-0.5 rounded-md text-white font-mono font-bold text-xs shadow-xs flex items-center gap-1 ${
                isNeedsReview ? "bg-orange-500" : "bg-emerald-600"
              }`}
            >
              <span>{questionLabel}</span>
              {regions.length > 1 && (
                <span className="opacity-80 text-[10px]">
                  ({idx + 1}/{regions.length})
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
