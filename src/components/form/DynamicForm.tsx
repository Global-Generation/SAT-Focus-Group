"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, Send } from "lucide-react";
import QuestionRenderer, { type QuestionData } from "./renderers/QuestionRenderer";

interface PageData {
  id: string;
  title: string;
  sortOrder: number;
  questions: QuestionData[];
}

interface SurveyData {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  heroTitle: string | null;
  ndaText: string | null;
  successMessage: string | null;
  dedupFieldKey: string | null;
  pages: PageData[];
}

interface Props {
  survey: SurveyData;
}

const DRAFT_PREFIX = "survey_draft_";

export default function DynamicForm({ survey }: Props) {
  const router = useRouter();
  const [screen, setScreen] = useState<"hero" | "nda" | "form" | "submitting">(
    survey.heroTitle ? "hero" : survey.ndaText ? "nda" : "form"
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Restore draft
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_PREFIX + survey.slug);
      if (saved) setValues(JSON.parse(saved));
    } catch {}
  }, [survey.slug]);

  // Save draft
  useEffect(() => {
    if (Object.keys(values).length > 0) {
      localStorage.setItem(DRAFT_PREFIX + survey.slug, JSON.stringify(values));
    }
  }, [values, survey.slug]);

  const handleChange = (fieldKey: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [fieldKey]: value }));
  };

  const page = survey.pages[currentPage];
  const isLastPage = currentPage === survey.pages.length - 1;

  const validatePage = (): boolean => {
    if (!page) return true;
    for (const q of page.questions) {
      if (!q.required) continue;
      // Skip if hidden by showIf
      if (q.showIf) {
        const condVal = values[q.showIf.fieldKey];
        if (condVal !== q.showIf.value) continue;
      }
      const val = values[q.fieldKey];
      if (val === undefined || val === null || val === "") return false;
      if (Array.isArray(val) && val.length === 0) return false;
      if (q.type === "CONSENT" && val !== true) return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validatePage()) {
      setError("Пожалуйста, заполните все обязательные поля");
      return;
    }
    setError("");
    if (isLastPage) {
      handleSubmit();
    } else {
      setCurrentPage((p) => p + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    setError("");
    setCurrentPage((p) => Math.max(0, p - 1));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    const res = await fetch(`/focus-group/api/surveys/${survey.slug}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: values }),
    });

    if (res.ok) {
      localStorage.removeItem(DRAFT_PREFIX + survey.slug);
      router.push(`/focus-group/s/${survey.slug}/success`);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Ошибка при отправке");
      setSubmitting(false);
    }
  };

  // Hero screen
  if (screen === "hero") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md">
          <h1 className="text-2xl font-bold mb-4">
            {survey.heroTitle || survey.title}
          </h1>
          {survey.description && (
            <p className="text-gray-600 mb-8">{survey.description}</p>
          )}
          <Button
            onClick={() => setScreen(survey.ndaText ? "nda" : "form")}
            className="bg-primary text-white px-8 py-3"
          >
            Начать
          </Button>
        </div>
      </div>
    );
  }

  // NDA screen
  if (screen === "nda") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center p-6">
        <Card className="max-w-lg p-6">
          <h2 className="text-lg font-semibold mb-4">
            Соглашение о конфиденциальности
          </h2>
          <div className="text-sm text-gray-600 whitespace-pre-wrap mb-6">
            {survey.ndaText}
          </div>
          <Button
            onClick={() => setScreen("form")}
            className="w-full bg-primary text-white"
          >
            Принимаю и продолжаю
          </Button>
        </Card>
      </div>
    );
  }

  // Form screen
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-xl font-bold mb-1">{survey.title}</h1>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          {survey.pages.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i <= currentPage ? "bg-primary" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-gray-500">
          Шаг {currentPage + 1} из {survey.pages.length}
          {page?.title ? ` — ${page.title}` : ""}
        </p>
      </div>

      {/* Questions */}
      <Card className="p-5">
        <div className="space-y-5">
          {page?.questions.map((q) => (
            <QuestionRenderer
              key={q.id}
              question={q}
              value={values[q.fieldKey]}
              onChange={handleChange}
              allValues={values}
            />
          ))}
        </div>
      </Card>

      {error && (
        <p className="mt-3 text-sm text-red-600 text-center">{error}</p>
      )}

      {/* Navigation */}
      <div className="mt-4 flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentPage === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Назад
        </Button>
        <Button
          onClick={handleNext}
          disabled={submitting}
          className="bg-primary text-white"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : isLastPage ? (
            <>
              <Send className="h-4 w-4 mr-1" />
              Отправить
            </>
          ) : (
            <>
              Далее
              <ChevronRight className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
