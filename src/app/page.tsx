"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { FormData, INITIAL_FORM_DATA } from "@/types";
import { ProgressBar } from "@/components/form/ProgressBar";
import { Step1 } from "@/components/form/Step1";
import { Step2 } from "@/components/form/Step2";
import { Step3 } from "@/components/form/Step3";
import { Step4 } from "@/components/form/Step4";
import { Step5 } from "@/components/form/Step5";
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
  ClipboardList,
  Sparkles,
  Users,
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

type Screen = 0 | 1 | 2;

/* ── Animated blob background (reusable) ── */
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

export default function FormPage() {
  const [screen, setScreen] = useState<Screen>(0);
  const [ndaChecked, setNdaChecked] = useState(false);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(INITIAL_FORM_DATA);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const topRef = useRef<HTMLDivElement>(null);
  const [stepDirection, setStepDirection] = useState<"forward" | "back">(
    "forward"
  );

  useEffect(() => {
    try {
      if (localStorage.getItem(NDA_KEY) === "true") setScreen(2);
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) setData(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    } catch {}
  }, [data]);

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

  const goNext = () => {
    setStepDirection("forward");
    setStep((s) => s + 1);
  };

  const goPrev = () => {
    setStepDirection("back");
    setStep((s) => s - 1);
  };

  // ════════════ SCREEN 0: Hero Landing ════════════
  if (screen === 0) {
    return (
      <div className="relative min-h-screen min-h-dvh overflow-hidden">
        <AnimatedBlobs />

        <div className="relative mx-auto max-w-4xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-28">
          {/* Heading with word-reveal */}
          <h1
            className="text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
            style={{ lineHeight: 1.15, paddingBottom: "0.1em" }}
          >
            <span
              className="animate-word-reveal inline-block"
              style={{ animationDelay: "0ms" }}
            >
              Подготовься
            </span>{" "}
            <span
              className="animate-word-reveal inline-block"
              style={{ animationDelay: "100ms" }}
            >
              к
            </span>{" "}
            <span
              className="animate-word-reveal inline-block"
              style={{ animationDelay: "200ms" }}
            >
              SAT
            </span>
            <br className="hidden sm:block" />
            <span
              className="animate-word-reveal inline-block"
              style={{ animationDelay: "300ms" }}
            >
              на
            </span>{" "}
            <span
              className="animate-word-reveal inline-block gradient-text"
              style={{ animationDelay: "400ms" }}
            >
              максимальный балл
            </span>
          </h1>

          <p
            className="animate-fade-up mx-auto mt-5 max-w-2xl text-base text-slate-500 sm:text-lg"
            style={{ animationDelay: "500ms" }}
          >
            540+ вопросов, AI репетитор и симуляция экзамена — всё для 1400+
          </p>

          {/* Forbes badge */}
          <div
            className="animate-fade-up mt-5 flex items-center justify-center gap-1.5"
            style={{ animationDelay: "600ms" }}
          >
            <span className="mr-1 text-xs text-slate-500 sm:text-sm">
              От экспертов
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${SAT_APP_URL}/landing/logo_FE.svg`}
              alt="Forbes Education"
              className="h-7 w-auto sm:h-10"
            />
          </div>

          {/* Mockup browser */}
          <div
            className="animate-fade-up mx-auto mt-10 max-w-3xl sm:mt-12"
            style={{ animationDelay: "700ms" }}
          >
            <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-white/90 shadow-lg backdrop-blur-sm transition-all duration-500 hover:shadow-xl sm:hover:scale-[1.02]">
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
          <div
            className="animate-fade-up mt-10 sm:mt-12"
            style={{ animationDelay: "800ms" }}
          >
            <p className="mb-4 text-xs text-slate-400">
              Наши ученики поступают в
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 lg:gap-12">
              {["harvard", "yale", "princeton", "duke", "brown"].map((u) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={u}
                  src={`${SAT_APP_URL}/landing/logos/${u}.${u === "duke" ? "jpg" : "png"}`}
                  alt={u}
                  className="h-7 w-auto object-contain opacity-50 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 sm:h-9"
                  style={{ mixBlendMode: "multiply" }}
                />
              ))}
            </div>
          </div>

          {/* What Is section — glass cards */}
          <div
            className="animate-fade-up mx-auto mt-16 max-w-3xl sm:mt-20"
            style={{ animationDelay: "900ms" }}
          >
            <h2 className="text-2xl font-bold sm:text-3xl">
              Что такое SAT Portal?
            </h2>
            <p className="mt-2 text-slate-500">
              Единая платформа для подготовки к Digital SAT
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: <ClipboardList className="h-5 w-5 text-slate-600" />,
                  title: "540+ вопросов",
                  desc: "Банк вопросов с фильтрами по секции, сложности и теме",
                },
                {
                  icon: <Sparkles className="h-5 w-5 text-slate-600" />,
                  title: "AI Репетитор",
                  desc: "Персональный помощник с 5 режимами обучения",
                },
                {
                  icon: <Users className="h-5 w-5 text-slate-600" />,
                  title: "46 уроков",
                  desc: "Теория, стратегии и практика по Math и R&W",
                },
                {
                  icon: <ShieldCheck className="h-5 w-5 text-slate-600" />,
                  title: "Симуляция SAT",
                  desc: "Полноценный Digital SAT с адаптивной сложностью",
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className="glass-card p-5 text-left transition-transform duration-300 sm:hover:-translate-y-1"
                >
                  <div className="icon-box mb-3">{card.icon}</div>
                  <h3 className="font-semibold">{card.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* About section */}
          <div
            className="animate-fade-up mx-auto mt-16 max-w-2xl sm:mt-20"
            style={{ animationDelay: "1000ms" }}
          >
            <h2 className="text-2xl font-bold sm:text-3xl">
              О Global Generation
            </h2>
            <p className="mt-3 text-slate-500">
              Образовательная компания, помогающая студентам поступать в лучшие
              вузы мира
            </p>
            <div className="glass-card mt-6 p-6 text-left">
              <p className="leading-relaxed text-slate-500">
                Global Generation — это команда экспертов в области
                международного образования. Мы помогаем школьникам и студентам из
                СНГ подготовиться к SAT, поступить в топовые университеты США и
                Европы, и построить успешную академическую карьеру.
              </p>
              <p className="mt-3 leading-relaxed text-slate-500">
                SAT Portal — наша бесплатная платформа для подготовки к Digital
                SAT с AI-репетитором, банком вопросов и симуляцией экзамена.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div
            className="animate-fade-up mt-12 sm:mt-16"
            style={{ animationDelay: "1100ms" }}
          >
            <button onClick={() => setScreen(1)} className="btn-cta">
              Участвовать в фокус-группе
              <ArrowRight className="h-5 w-5" />
            </button>
            <p className="mt-3 text-xs text-slate-400">
              Закрытое исследование по приглашению
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ════════════ SCREEN 1: NDA ════════════
  if (screen === 1) {
    return (
      <div className="relative flex min-h-screen min-h-dvh items-center justify-center px-4 py-8">
        <AnimatedBlobs />

        <div className="relative z-10 w-full max-w-lg">
          <div className="animate-fade-scale glass-form p-6 sm:p-8">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50/80">
              <ShieldCheck className="h-7 w-7 text-blue-500" />
            </div>

            <h1 className="text-center text-xl font-bold text-slate-900 sm:text-2xl">
              Конфиденциальное исследование
            </h1>

            <div className="mt-4 rounded-xl border border-amber-200/80 bg-amber-50/80 p-4 backdrop-blur-sm">
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
                <strong className="text-slate-900">конфиденциальной</strong> и не
                подлежит распространению.
              </p>
              <p>
                Продолжая, вы соглашаетесь не разглашать детали исследования
                третьим лицам и участвовать добросовестно.
              </p>
            </div>

            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200/80 bg-white/60 p-4 backdrop-blur-sm transition-all hover:border-slate-300 hover:bg-white/80">
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

            <button
              onClick={handleAcceptNda}
              disabled={!ndaChecked}
              className="btn-cta mt-5 w-full disabled:opacity-40 disabled:hover:transform-none disabled:hover:shadow-none"
            >
              <ShieldCheck className="h-4 w-4" />
              Принимаю и продолжаю
            </button>

            <p className="mt-4 text-center text-xs text-slate-400">
              Ваши данные защищены и используются исключительно для отбора
              участников.
            </p>
          </div>

          <button
            onClick={() => setScreen(0)}
            className="mt-4 flex w-full items-center justify-center gap-1 text-xs text-slate-400 transition-colors hover:text-slate-600"
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
    <div className="relative flex min-h-screen min-h-dvh flex-col">
      <AnimatedBlobs />

      {/* Header + progress — sticky on mobile */}
      <div
        ref={topRef}
        className="sticky top-0 z-10 border-b border-slate-200/50 bg-white/70 px-4 pb-4 pt-4 backdrop-blur-xl sm:static sm:border-0 sm:bg-transparent sm:px-4 sm:pb-0 sm:pt-8 sm:backdrop-blur-none"
      >
        <div className="mx-auto max-w-2xl">
          <div className="mb-5 text-center sm:mb-6">
            <h1 className="text-xl font-bold text-slate-900 sm:text-3xl">
              SAT Фокус-группа
            </h1>
            <p className="mt-1 text-sm text-slate-500 sm:mt-2 sm:text-base">
              Помогите нам улучшить платформу подготовки к SAT
            </p>
          </div>
          <ProgressBar steps={STEPS} current={step} />
        </div>
      </div>

      {/* Form content */}
      <div className="relative flex-1 px-4 pb-28 pt-4 sm:pb-8 sm:pt-6">
        <div className="mx-auto max-w-2xl">
          <div
            key={step}
            className={`glass-form p-5 sm:p-8 ${stepDirection === "forward" ? "animate-slide-right" : "animate-slide-left"}`}
          >
            <h2 className="mb-5 text-lg font-semibold text-slate-900 sm:mb-6">
              {STEPS[step]}
            </h2>

            {step === 0 && <Step1 data={data} onChange={updateData} />}
            {step === 1 && <Step2 data={data} onChange={updateData} />}
            {step === 2 && <Step3 data={data} onChange={updateData} />}
            {step === 3 && <Step4 data={data} onChange={updateData} />}
            {step === 4 && <Step5 data={data} onChange={updateData} />}

            {error && (
              <div className="mt-4 rounded-xl border border-red-200/80 bg-red-50/80 p-3 text-sm text-red-700 backdrop-blur-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky bottom navigation */}
      <div
        className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200/50 bg-white/80 px-4 py-3 backdrop-blur-xl sm:static sm:border-0 sm:bg-transparent sm:py-0 sm:pb-8 sm:backdrop-blur-none"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={goPrev}
            disabled={step === 0}
            className="h-11 gap-1 rounded-xl border-slate-200/80 bg-white/70 px-4 text-sm backdrop-blur-sm sm:h-10"
          >
            <ChevronLeft className="h-4 w-4" />
            Назад
          </Button>

          <span className="text-xs text-slate-400 sm:hidden">
            {step + 1} / {STEPS.length}
          </span>

          {step < STEPS.length - 1 ? (
            <button
              onClick={goNext}
              disabled={!canGoNext()}
              className="btn-cta h-11 px-6 text-sm disabled:opacity-40 disabled:hover:transform-none disabled:hover:shadow-none sm:h-10"
            >
              Далее
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canGoNext() || submitting}
              className="btn-cta h-11 px-6 text-sm disabled:opacity-40 disabled:hover:transform-none disabled:hover:shadow-none sm:h-10"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Отправить
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
