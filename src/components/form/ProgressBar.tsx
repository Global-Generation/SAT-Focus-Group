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
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all sm:h-10 sm:w-10",
                i < current &&
                  "bg-primary text-white",
                i === current &&
                  "bg-primary text-white ring-[3px] ring-blue-200",
                i > current && "bg-gray-100 text-gray-400 border border-gray-200"
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
                "text-[11px] leading-tight text-center max-w-[70px] sm:max-w-none sm:text-xs",
                i === current
                  ? "text-primary font-medium"
                  : "text-gray-400"
              )}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={cn(
                "mx-1 h-0.5 flex-1 rounded-full transition-colors sm:mx-2",
                i < current ? "bg-primary" : "bg-gray-200"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
