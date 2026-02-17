"use client";

import { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Send,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import QuestionRenderer, {
  type QuestionData,
} from "./renderers/QuestionRenderer";

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

/* ── Animated blob background ── */
function AnimatedBlobs() {
  return (
    <div className="animated-bg" aria-hidden="true">
      <div className="blob blob-hero-center" />
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
      <div className="blob blob-4" />
      <div className="blob blob-5" />
    </div>
  );
}

export default function DynamicForm({ survey }: Props) {
  const router = useRouter();
  const [screen, setScreen] = useState<"hero" | "nda" | "form" | "submitting">(
    survey.heroTitle ? "hero" : survey.ndaText ? "nda" : "form"
  );
  const [ndaChecked, setNdaChecked] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [direction, setDirection] = useState<"forward" | "back">("forward");

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
      setDirection("forward");
      setCurrentPage((p) => p + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    setError("");
    setDirection("back");
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
      router.push(`/s/${survey.slug}/success`);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Ошибка при отправке");
      setSubmitting(false);
    }
  };

  // ── Hero screen ──
  if (screen === "hero") {
    return (
      <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden p-6 text-center">
        <AnimatedBlobs />

        <div className="relative z-10 max-w-lg">
          <h1
            className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
            style={{ lineHeight: 1.15, paddingBottom: "0.1em" }}
          >
            {(survey.heroTitle || survey.title)
              .split(" ")
              .map((word, i) => (
                <Fragment key={i}>
                  <span
                    className="animate-word-reveal inline-block"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    {word}
                  </span>{" "}
                </Fragment>
              ))}
          </h1>
          {survey.description && (
            <p
              className="animate-fade-up mx-auto mt-4 max-w-md text-base text-slate-500 sm:text-lg"
              style={{ animationDelay: "400ms" }}
            >
              {survey.description}
            </p>
          )}
          <div
            className="animate-fade-up mt-8"
            style={{ animationDelay: "600ms" }}
          >
            <button
              onClick={() => setScreen(survey.ndaText ? "nda" : "form")}
              className="btn-cta"
            >
              Начать
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── NDA screen ──
  if (screen === "nda") {
    return (
      <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden p-6">
        <AnimatedBlobs />

        <div className="relative z-10 w-full max-w-lg">
          <div className="animate-fade-scale glass-form p-6 sm:p-8">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50/80">
              <ShieldCheck className="h-7 w-7 text-blue-500" />
            </div>

            <h2 className="text-center text-xl font-bold text-slate-900 sm:text-2xl">
              Соглашение о конфиденциальности
            </h2>

            <div className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
              {survey.ndaText}
            </div>

            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200/80 bg-white/60 p-4 backdrop-blur-sm transition-all hover:border-slate-300 hover:bg-white/80">
              <Checkbox
                checked={ndaChecked}
                onCheckedChange={(v) => setNdaChecked(v === true)}
                className="mt-0.5"
              />
              <p className="text-sm leading-snug text-slate-700">
                Я понимаю и принимаю условия конфиденциальности
              </p>
            </label>

            <button
              onClick={() => setScreen("form")}
              disabled={!ndaChecked}
              className="btn-cta mt-5 w-full disabled:opacity-40 disabled:hover:transform-none disabled:hover:shadow-none"
            >
              <ShieldCheck className="h-4 w-4" />
              Принимаю и продолжаю
            </button>
          </div>

          {survey.heroTitle && (
            <button
              onClick={() => setScreen("hero")}
              className="mt-4 flex w-full items-center justify-center gap-1 text-xs text-slate-400 transition-colors hover:text-slate-600"
            >
              <ChevronLeft className="h-3 w-3" />
              Назад
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Form screen ──
  return (
    <div className="relative min-h-dvh">
      <AnimatedBlobs />

      <div className="relative z-10 mx-auto max-w-2xl px-4 py-6 sm:py-10">
        {/* Title */}
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            {survey.title}
          </h1>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            {survey.pages.map((_, i) => (
              <div key={i} className="flex flex-1 items-center gap-2">
                <div
                  className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                    i <= currentPage
                      ? "bg-primary shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                      : "bg-slate-200/80"
                  }`}
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            Шаг {currentPage + 1} из {survey.pages.length}
            {page?.title ? ` — ${page.title}` : ""}
          </p>
        </div>

        {/* Questions card */}
        <div
          key={currentPage}
          className={`glass-form p-5 sm:p-8 ${direction === "forward" ? "animate-slide-right" : "animate-slide-left"}`}
        >
          {page?.title && (
            <h2 className="mb-5 text-lg font-semibold text-slate-900">
              {page.title}
            </h2>
          )}
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
        </div>

        {error && (
          <div className="mt-3 rounded-xl border border-red-200/80 bg-red-50/80 p-3 text-center text-sm text-red-600 backdrop-blur-sm">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-5 flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentPage === 0}
            className="h-11 gap-1 rounded-xl border-slate-200/80 bg-white/70 px-4 backdrop-blur-sm"
          >
            <ChevronLeft className="h-4 w-4" />
            Назад
          </Button>
          <button
            onClick={handleNext}
            disabled={submitting}
            className="btn-cta h-11 px-6 text-sm disabled:opacity-40 disabled:hover:transform-none disabled:hover:shadow-none"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isLastPage ? (
              <>
                <Send className="h-4 w-4" />
                Отправить
              </>
            ) : (
              <>
                Далее
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
