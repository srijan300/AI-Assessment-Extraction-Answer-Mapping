import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function convertBoxToPercentages(box: { ymin: number; xmin: number; ymax: number; xmax: number }) {
  const ymin = Math.max(0, Math.min(1000, box.ymin));
  const xmin = Math.max(0, Math.min(1000, box.xmin));
  const ymax = Math.max(0, Math.min(1000, box.ymax));
  const xmax = Math.max(0, Math.min(1000, box.xmax));

  const top = (ymin / 1000) * 100;
  const left = (xmin / 1000) * 100;
  const width = Math.max(2, ((xmax - xmin) / 1000) * 100);
  const height = Math.max(2, ((ymax - ymin) / 1000) * 100);

  return { top: `${top}%`, left: `${left}%`, width: `${width}%`, height: `${height}%` };
}

export const normalizedBoxToPercent = convertBoxToPercentages;
