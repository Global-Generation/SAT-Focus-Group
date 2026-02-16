"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { FormData, INITIAL_FORM_DATA } from "@/types";
import { ProgressBar } from "@/components/form/ProgressBar";
import { Step1 } from "@/components/form/Step1";
import { Step2 } from "@/components/form/Step2";
import { Step3 } from "@/components/form/Step3";
import { Step4 } from "@/components/form/Step4";
import { Step5 } from "@/components/form/Step5";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Send, Loader2 } from "lucide-react";

const STEPS = [
  "О вас",
  "SAT и подготовка",
  "Опыт с продуктом",
  "Готовность",
  "Подтверждение",
];

const DRAFT_KEY = "focus_group_draft";

export default function FormPage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(INITIAL_FORM_DATA);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const topRef = useRef<HTMLDivElement>(null);

  // Restore draft from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) setData(JSON.parse(saved));
    } catch {}
  }, []);

  // Save draft on change
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    } catch {}
  }, [data]);

  // Scroll to top on step change
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const updateData = useCallback(
    (partial: Partial<FormData>) => setData((prev) => ({ ...prev, ...partial })),
    []
  );

  const canGoNext = useCallback((): boolean => {
    switch (step) {
      case 0:
        return !!(
          data.name.trim() &&
          data.telegramUsername.trim() &&
          data.age &&
          data.city.trim() &&
          data.educationLevel
        );
      case 1:
        return !!(
          data.satTimeline &&
          data.hasTakenSat !== "" &&
          data.weeklyHours &&
          data.platformUsage
        );
      case 2:
        return !!(data.whatYouLike.trim() && data.whatFrustrates.trim());
      case 3:
        return !!(
          data.motivation.trim() &&
          data.sessionReadiness &&
          data.availableDays.length > 0 &&
          data.availableTimes.length > 0
        );
      case 4:
        return data.consentData && data.consentRecording;
      default:
        return false;
    }
  }, [step, data]);

  const handleSubmit = async () => {
    if (!canGoNext()) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/focus-group/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Ошибка отправки");
        setSubmitting(false);
        return;
      }

      localStorage.removeItem(DRAFT_KEY);
      window.location.href = "/focus-group/success";
    } catch {
      setError("Ошибка сети. Попробуйте ещё раз.");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen min-h-dvh flex-col bg-gradient-to-b from-blue-50 to-white">
      {/* Header + progress — sticky on mobile */}
      <div
        ref={topRef}
        className="sticky top-0 z-10 bg-gradient-to-b from-blue-50 via-blue-50 to-blue-50/95 px-4 pb-4 pt-4 backdrop-blur-sm sm:static sm:bg-transparent sm:px-4 sm:pt-8 sm:pb-0"
      >
        <div className="mx-auto max-w-2xl">
          <div className="mb-5 text-center sm:mb-6">
            <h1 className="text-xl font-bold text-gray-900 sm:text-3xl">
              SAT Фокус-группа
            </h1>
            <p className="mt-1 text-sm text-gray-500 sm:mt-2 sm:text-base">
              Помогите нам улучшить платформу подготовки к SAT
            </p>
          </div>
          <ProgressBar steps={STEPS} current={step} />
        </div>
      </div>

      {/* Form content */}
      <div className="flex-1 px-4 pt-4 pb-28 sm:pb-8 sm:pt-6">
        <div className="mx-auto max-w-2xl">
          <Card className="p-5 sm:p-8">
            <h2 className="mb-5 text-lg font-semibold text-gray-900 sm:mb-6">
              {STEPS[step]}
            </h2>

            {step === 0 && <Step1 data={data} onChange={updateData} />}
            {step === 1 && <Step2 data={data} onChange={updateData} />}
            {step === 2 && <Step3 data={data} onChange={updateData} />}
            {step === 3 && <Step4 data={data} onChange={updateData} />}
            {step === 4 && <Step5 data={data} onChange={updateData} />}

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Sticky bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur-md sm:static sm:border-0 sm:bg-transparent sm:backdrop-blur-none sm:py-0 sm:pb-8"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="h-11 gap-1 px-4 text-sm sm:h-10"
          >
            <ChevronLeft className="h-4 w-4" />
            Назад
          </Button>

          <span className="text-xs text-gray-400 sm:hidden">
            {step + 1} / {STEPS.length}
          </span>

          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canGoNext()}
              className="h-11 gap-1 bg-primary px-5 text-sm text-white hover:bg-blue-600 sm:h-10"
            >
              Далее
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canGoNext() || submitting}
              className="h-11 gap-2 bg-primary px-5 text-sm text-white hover:bg-blue-600 sm:h-10"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Отправить
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
