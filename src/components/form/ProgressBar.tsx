"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  steps: string[];
  current: number;
}

export function ProgressBar({ steps, current }: ProgressBarProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      {steps.map((label, i) => (
        <div key={label} className="flex flex-1 flex-col items-center gap-1">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
              i < current && "bg-primary text-white",
              i === current && "bg-primary text-white ring-4 ring-blue-100",
              i > current && "bg-gray-200 text-gray-500"
            )}
          >
            {i + 1}
          </div>
          <span className="hidden text-xs text-gray-500 sm:block">
            {label}
          </span>
          {i < steps.length - 1 && (
            <div
              className={cn(
                "absolute h-0.5 w-full",
                i < current ? "bg-primary" : "bg-gray-200"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
