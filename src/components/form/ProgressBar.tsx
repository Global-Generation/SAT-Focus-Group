"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ProgressBarProps {
  steps: string[];
  current: number;
}

export function ProgressBar({ steps, current }: ProgressBarProps) {
  return (
    <div className="flex items-center">
      {steps.map((label, i) => (
        <div key={label} className="flex flex-1 items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 sm:h-10 sm:w-10",
                i < current &&
                  "bg-primary text-white shadow-[0_0_12px_rgba(59,130,246,0.3)]",
                i === current &&
                  "bg-primary text-white ring-[3px] ring-blue-200/60 shadow-[0_0_16px_rgba(59,130,246,0.35)]",
                i > current &&
                  "border border-slate-200/80 bg-white/60 text-slate-400 backdrop-blur-sm"
              )}
            >
              {i < current ? (
                <Check className="h-4 w-4" strokeWidth={3} />
              ) : (
                i + 1
              )}
            </div>
            <span
              className={cn(
                "max-w-[70px] text-center text-[11px] leading-tight transition-colors duration-300 sm:max-w-none sm:text-xs",
                i === current
                  ? "font-medium text-primary"
                  : i < current
                    ? "text-slate-500"
                    : "text-slate-400"
              )}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={cn(
                "mx-1 h-0.5 flex-1 rounded-full transition-all duration-500 sm:mx-2",
                i < current
                  ? "bg-primary shadow-[0_0_6px_rgba(59,130,246,0.2)]"
                  : "bg-slate-200/80"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
