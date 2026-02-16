"use client";

import { useState, useEffect, useCallback } from "react";
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-6 px-4 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            SAT Фокус-группа
          </h1>
          <p className="mt-2 text-gray-600">
            Помогите нам улучшить платформу подготовки к SAT
          </p>
        </div>

        <ProgressBar steps={STEPS} current={step} />

        <Card className="mt-6 p-6 sm:p-8">
          <h2 className="mb-6 text-lg font-semibold text-gray-900">
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

          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Назад
            </Button>

            {step < STEPS.length - 1 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canGoNext()}
                className="gap-1 bg-primary text-white hover:bg-blue-600"
              >
                Далее
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canGoNext() || submitting}
                className="gap-2 bg-primary text-white hover:bg-blue-600"
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
        </Card>
      </div>
    </div>
  );
}
