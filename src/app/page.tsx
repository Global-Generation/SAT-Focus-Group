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
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronLeft,
  ChevronRight,
  Send,
  Loader2,
  ShieldCheck,
  Lock,
  ArrowRight,
} from "lucide-react";

const STEPS = [
  "О вас",
  "SAT и подготовка",
  "Опыт подготовки",
  "Готовность",
  "Подтверждение",
];

const DRAFT_KEY = "focus_group_draft";
const NDA_KEY = "focus_group_nda";

const SAT_APP_URL = "https://cehtptxqfw.us-east-1.awsapprunner.com";

// ── Screen: 0 = hero, 1 = NDA, 2 = form ──
type Screen = 0 | 1 | 2;

export default function FormPage() {
  const [screen, setScreen] = useState<Screen>(0);
  const [ndaChecked, setNdaChecked] = useState(false);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(INITIAL_FORM_DATA);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const topRef = useRef<HTMLDivElement>(null);

  // Restore state from localStorage
  useEffect(() => {
    try {
      if (localStorage.getItem(NDA_KEY) === "true") setScreen(2);
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

  // Scroll to top on step/screen change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, screen]);

  const handleAcceptNda = () => {
    setScreen(2);
    try {
      localStorage.setItem(NDA_KEY, "true");
    } catch {}
  };

  const updateData = useCallback(
    (partial: Partial<FormData>) =>
      setData((prev) => ({ ...prev, ...partial })),
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
          data.weeklyHours
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

  // ════════════ SCREEN 0: Hero Landing ════════════
  if (screen === 0) {
    return (
      <div className="relative min-h-screen min-h-dvh overflow-hidden bg-[#f8fafc]">
        {/* Background blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.12)_0%,transparent_70%)]" />
          <div className="blob-anim absolute -right-24 -top-24 h-[350px] w-[350px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.08),transparent_70%)]" />
          <div className="blob-anim-rev absolute -bottom-12 -left-12 h-[250px] w-[250px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.06),transparent_70%)]" />
        </div>

        <div className="mx-auto max-w-4xl px-4 pb-12 pt-14 text-center sm:px-6 sm:pt-24">
          {/* Heading */}
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Подготовься к SAT{" "}
            <br className="hidden sm:block" />
            на{" "}
            <span className="bg-gradient-to-r from-blue-900 via-blue-500 to-blue-400 bg-clip-text text-transparent">
              максимальный балл
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base text-slate-500 sm:mt-5 sm:text-lg">
            540+ вопросов, AI репетитор и симуляция экзамена — всё для 1400+
          </p>

          {/* Forbes badge */}
          <div className="mt-5 flex items-center justify-center gap-1.5">
            <span className="text-xs text-slate-500 sm:text-sm">
              От экспертов
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${SAT_APP_URL}/landing/logo_FE.svg`}
              alt="Forbes Education"
              className="h-9 w-auto sm:h-10"
            />
          </div>

          {/* Mockup browser */}
          <div className="mx-auto mt-8 max-w-3xl sm:mt-10">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white/90 shadow-lg">
              <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50/60 px-3 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                <div className="mx-3 h-5 flex-1 rounded-md border border-slate-200/50 bg-slate-50/80" />
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${SAT_APP_URL}/landing/preview-learn.png`}
                alt="SAT Portal — Обучение"
                className="block w-full"
              />
            </div>
          </div>

          {/* University logos */}
          <div className="mt-8 sm:mt-10">
            <p className="mb-3 text-xs text-slate-400">
              Наши ученики поступают в
            </p>
            <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8">
              {["harvard", "yale", "princeton", "duke", "brown"].map((u) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={u}
                  src={`${SAT_APP_URL}/landing/logos/${u}.${u === "duke" ? "jpg" : "png"}`}
                  alt={u}
                  className="h-6 w-auto object-contain opacity-40 grayscale sm:h-8"
                  style={{ mixBlendMode: "multiply" }}
                />
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10 sm:mt-12">
            <Button
              onClick={() => setScreen(1)}
              className="h-12 gap-2 rounded-full bg-primary px-8 text-base font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-600 hover:shadow-blue-500/30 sm:h-14 sm:px-10 sm:text-lg"
            >
              Участвовать в фокус-группе
              <ArrowRight className="h-5 w-5" />
            </Button>
            <p className="mt-3 text-xs text-slate-400">
              Закрытое исследование по приглашению
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ════════════ SCREEN 1: NDA (White theme) ════════════
  if (screen === 1) {
    return (
      <div className="flex min-h-screen min-h-dvh items-center justify-center bg-[#f8fafc] px-4 py-8">
        <div className="w-full max-w-lg">
          <Card className="border-slate-200 p-6 shadow-lg sm:p-8">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
              <ShieldCheck className="h-7 w-7 text-blue-500" />
            </div>

            <h1 className="text-center text-xl font-bold text-slate-900 sm:text-2xl">
              Конфиденциальное исследование
            </h1>

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-2.5">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-sm font-medium leading-snug text-amber-800">
                  Закрытая фокус-группа по приглашению
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm leading-relaxed text-slate-600">
              <p>
                Вы получили доступ к анкете закрытой фокус-группы по развитию
                SAT-платформы. Участие строго по приглашению.
              </p>
              <p>
                Вся информация, которой мы делимся в рамках исследования
                (концепции, прототипы, планы развития), является{" "}
                <strong className="text-slate-900">конфиденциальной</strong>{" "}
                и не подлежит распространению.
              </p>
              <p>
                Продолжая, вы соглашаетесь не разглашать детали исследования
                третьим лицам и участвовать добросовестно.
              </p>
            </div>

            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition-colors hover:border-slate-300 hover:bg-slate-50">
              <Checkbox
                checked={ndaChecked}
                onCheckedChange={(v) => setNdaChecked(v === true)}
                className="mt-0.5"
              />
              <p className="text-sm leading-snug text-slate-700">
                Я понимаю и принимаю условия конфиденциальности. Обязуюсь не
                распространять информацию об исследовании.
              </p>
            </label>

            <Button
              onClick={handleAcceptNda}
              disabled={!ndaChecked}
              className="mt-5 h-12 w-full gap-2 bg-primary text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-40"
            >
              <ShieldCheck className="h-4 w-4" />
              Принимаю и продолжаю
            </Button>

            <p className="mt-4 text-center text-xs text-slate-400">
              Ваши данные защищены и используются исключительно для отбора
              участников.
            </p>
          </Card>

          <button
            onClick={() => setScreen(0)}
            className="mt-4 flex w-full items-center justify-center gap-1 text-xs text-slate-400 hover:text-slate-600"
          >
            <ChevronLeft className="h-3 w-3" />
            Назад к описанию
          </button>
        </div>
      </div>
    );
  }

  // ════════════ SCREEN 2: Form ════════════
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
      <div
        className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur-md sm:static sm:border-0 sm:bg-transparent sm:backdrop-blur-none sm:py-0 sm:pb-8"
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
