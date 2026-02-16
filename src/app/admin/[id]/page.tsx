"use client";

import { useState, useEffect, useCallback, use } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  SAT_TIMELINES,
  WEEKLY_HOURS,
  PLATFORM_USAGE,
  EDUCATION_LEVELS,
  FEATURES,
  SESSION_READINESS,
  DAYS,
  TIMES,
  REFERRAL_SOURCES,
  type ScoreBreakdown,
} from "@/types";
import { getScoreTier, SCORE_LABELS } from "@/lib/scoring";

interface Submission {
  id: string;
  createdAt: string;
  name: string;
  telegramUsername: string;
  age: number;
  city: string;
  educationLevel: string;
  satTimeline: string;
  hasTakenSat: boolean;
  previousScore: number | null;
  weeklyHours: string;
  resources: string[];
  platformUsage: string;
  featuresUsed: string[];
  whatYouLike: string;
  whatFrustrates: string;
  motivation: string;
  sessionReadiness: string;
  availableDays: string[];
  availableTimes: string[];
  referralSource: string | null;
  totalScore: number;
  scoreBreakdown: ScoreBreakdown;
  scorePercentage: number;
  status: string;
  adminNotes: string | null;
}

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Ожидает", color: "bg-gray-100 text-gray-700" },
  {
    value: "SHORTLISTED",
    label: "Шорт-лист",
    color: "bg-blue-100 text-blue-700",
  },
  {
    value: "SELECTED",
    label: "Отобран",
    color: "bg-green-100 text-green-700",
  },
  {
    value: "REJECTED",
    label: "Отклонён",
    color: "bg-red-100 text-red-700",
  },
  {
    value: "CONTACTED",
    label: "Связались",
    color: "bg-purple-100 text-purple-700",
  },
];

function getLabel(
  options: { value: string; label: string }[],
  value: string
): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

export default function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [sub, setSub] = useState<Submission | null>(null);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchSubmission = useCallback(async () => {
    const res = await fetch(`/focus-group/api/admin/submissions/${id}`);
    if (res.ok) {
      const data = await res.json();
      setSub(data);
      setStatus(data.status);
      setNotes(data.adminNotes ?? "");
    }
  }, [id]);

  useEffect(() => {
    fetchSubmission();
  }, [fetchSubmission]);

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/focus-group/api/admin/submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNotes: notes }),
    });
    setSaving(false);
    fetchSubmission();
  };

  if (!sub) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const tier = getScoreTier(sub.totalScore);
  const breakdown = sub.scoreBreakdown as ScoreBreakdown;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад к списку
          </Link>
        </div>

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{sub.name}</h1>
            <p className="text-gray-500">{sub.telegramUsername}</p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${tier.class}`}
            >
              {sub.totalScore}/130 — {tier.label}
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Contact */}
            <Card className="p-5">
              <h3 className="mb-4 font-semibold text-gray-900">О кандидате</h3>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-gray-500">Возраст</dt>
                  <dd className="font-medium">{sub.age} лет</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Город</dt>
                  <dd className="font-medium">{sub.city}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Образование</dt>
                  <dd className="font-medium">
                    {getLabel(EDUCATION_LEVELS, sub.educationLevel)}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Дата заявки</dt>
                  <dd className="font-medium">
                    {new Date(sub.createdAt).toLocaleDateString("ru-RU")}
                  </dd>
                </div>
              </dl>
            </Card>

            {/* SAT Prep */}
            <Card className="p-5">
              <h3 className="mb-4 font-semibold text-gray-900">
                SAT и подготовка
              </h3>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-gray-500">Когда сдаёт SAT</dt>
                  <dd className="font-medium">
                    {getLabel(SAT_TIMELINES, sub.satTimeline)}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Сдавал раньше</dt>
                  <dd className="font-medium">
                    {sub.hasTakenSat ? "Да" : "Нет"}
                    {sub.previousScore && ` — ${sub.previousScore} баллов`}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Часов в неделю</dt>
                  <dd className="font-medium">
                    {getLabel(WEEKLY_HOURS, sub.weeklyHours)}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Ресурсы</dt>
                  <dd className="font-medium">{sub.resources.join(", ")}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Платформа</dt>
                  <dd className="font-medium">
                    {getLabel(PLATFORM_USAGE, sub.platformUsage)}
                  </dd>
                </div>
              </dl>
            </Card>

            {/* Experience */}
            <Card className="p-5">
              <h3 className="mb-4 font-semibold text-gray-900">
                Опыт с продуктом
              </h3>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-gray-500">Использованные функции</dt>
                  <dd className="font-medium">
                    {sub.featuresUsed.length > 0
                      ? sub.featuresUsed
                          .map((f) => getLabel(FEATURES, f))
                          .join(", ")
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Что нравится</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-gray-700">
                    {sub.whatYouLike}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Что расстраивает</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-gray-700">
                    {sub.whatFrustrates}
                  </dd>
                </div>
              </dl>
            </Card>

            {/* Readiness */}
            <Card className="p-5">
              <h3 className="mb-4 font-semibold text-gray-900">Готовность</h3>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-gray-500">Мотивация</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-gray-700">
                    {sub.motivation}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Готовность к сессии</dt>
                  <dd className="font-medium">
                    {getLabel(SESSION_READINESS, sub.sessionReadiness)}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Удобные дни</dt>
                  <dd className="font-medium">
                    {sub.availableDays.map((d) => getLabel(DAYS, d)).join(", ")}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Удобное время</dt>
                  <dd className="font-medium">
                    {sub.availableTimes
                      .map((t) => getLabel(TIMES, t))
                      .join(", ")}
                  </dd>
                </div>
                {sub.referralSource && (
                  <div>
                    <dt className="text-gray-500">Источник</dt>
                    <dd className="font-medium">
                      {getLabel(REFERRAL_SOURCES, sub.referralSource)}
                    </dd>
                  </div>
                )}
              </dl>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Score breakdown */}
            <Card className="p-5">
              <h3 className="mb-4 font-semibold text-gray-900">
                Расшифровка баллов
              </h3>
              <div className="space-y-2">
                {Object.entries(breakdown).map(([key, value]) => {
                  const info =
                    SCORE_LABELS[key as keyof ScoreBreakdown];
                  if (!info) return null;
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-600">{info.label}</span>
                      <span className="font-medium">
                        {value}/{info.max}
                      </span>
                    </div>
                  );
                })}
                <div className="mt-3 border-t pt-3">
                  <div className="flex items-center justify-between font-semibold">
                    <span>Итого</span>
                    <span>
                      {sub.totalScore}/130 ({sub.scorePercentage}%)
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Status & Notes */}
            <Card className="p-5">
              <h3 className="mb-4 font-semibold text-gray-900">Управление</h3>
              <div className="space-y-4">
                <div>
                  <Label>Статус</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setStatus(opt.value)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                          status === opt.value
                            ? opt.color + " ring-2 ring-offset-1 ring-gray-300"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Заметки</Label>
                  <Textarea
                    id="notes"
                    placeholder="Заметки об этом кандидате..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1 min-h-[100px]"
                  />
                </div>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full gap-2 bg-primary text-white"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Сохранить
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
