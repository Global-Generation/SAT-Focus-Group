"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
// Card removed — using glass-card divs
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Users, BarChart3, UserCheck, Clock } from "lucide-react";

type QuestionStat = {
  id: string;
  fieldKey: string;
  label: string;
  type: string;
  totalAnswers: number;
  distribution?: Record<string, number>;
  frequency?: Record<string, number>;
  avg?: number;
  min?: number;
  max?: number;
  avgLength?: number;
};

type Stats = {
  survey: { title: string; maxScore: number };
  total: number;
  avgScore: number;
  selected: number;
  pending: number;
  byStatus: Record<string, number>;
  tierCounts: Record<string, number>;
  questionStats: QuestionStat[];
  timeline: Record<string, number>;
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  SHORTLISTED: "bg-blue-100 text-blue-700",
  SELECTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  CONTACTED: "bg-purple-100 text-purple-700",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Ожидает",
  SHORTLISTED: "Шорт-лист",
  SELECTED: "Отобран",
  REJECTED: "Отклонён",
  CONTACTED: "Связались",
};

export default function StatsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/focus-group/api/admin/surveys/${id}/stats`)
      .then((r) => {
        if (!r.ok) throw new Error(r.status === 401 ? "Не авторизован" : "Ошибка загрузки");
        return r.json();
      })
      .then(setStats)
      .catch((e) => setError(e.message || "Ошибка"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-red-500 text-sm">{error || "Не удалось загрузить статистику"}</p>
        <Button variant="outline" size="sm" onClick={() => router.push("/admin")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Назад
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/admin")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">Статистика</h1>
          <p className="text-sm text-gray-500">{stats.survey.title}</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50/80 p-2.5">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Всего</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-50/80 p-2.5">
              <BarChart3 className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Средний балл</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.avgScore}/{stats.survey.maxScore}
              </p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50/80 p-2.5">
              <UserCheck className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Отобрано</p>
              <p className="text-2xl font-bold text-slate-900">{stats.selected}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-100/80 p-2.5">
              <Clock className="h-5 w-5 text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Ожидают</p>
              <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Status breakdown */}
        <div className="glass-card p-4">
          <h3 className="mb-3 font-medium text-sm">По статусам</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.byStatus).map(([status, count]) => (
              <Badge key={status} className={STATUS_COLORS[status]}>
                {STATUS_LABELS[status] || status}: {count}
              </Badge>
            ))}
          </div>
        </div>

        {/* Score tiers */}
        <div className="glass-card p-4">
          <h3 className="mb-3 font-medium text-sm">Распределение баллов</h3>
          <div className="space-y-2">
            {Object.entries(stats.tierCounts).map(([tier, count]) => {
              const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={tier}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{tier}</span>
                    <span>{count} ({Math.round(pct)}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Per-question analytics */}
        {stats.questionStats
          .filter(
            (q) =>
              q.distribution || q.frequency || q.avg !== undefined || q.avgLength
          )
          .map((q) => (
            <div key={q.id} className="glass-card p-4">
              <h3 className="mb-1 font-medium text-sm">{q.label}</h3>
              <p className="mb-3 text-xs text-gray-400">
                {q.totalAnswers} ответов
              </p>

              {q.distribution && (
                <div className="space-y-1.5">
                  {Object.entries(q.distribution).map(([label, count]) => {
                    const pct =
                      q.totalAnswers > 0
                        ? (count / q.totalAnswers) * 100
                        : 0;
                    return (
                      <div key={label}>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="truncate mr-2">{label}</span>
                          <span className="shrink-0">
                            {count} ({Math.round(pct)}%)
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-100">
                          <div
                            className="h-1.5 rounded-full bg-blue-400"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {q.frequency && (
                <div className="space-y-1.5">
                  {Object.entries(q.frequency)
                    .sort((a, b) => b[1] - a[1])
                    .map(([label, count]) => {
                      const pct =
                        q.totalAnswers > 0
                          ? (count / q.totalAnswers) * 100
                          : 0;
                      return (
                        <div key={label}>
                          <div className="flex justify-between text-xs mb-0.5">
                            <span className="truncate mr-2">{label}</span>
                            <span className="shrink-0">
                              {count} ({Math.round(pct)}%)
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-gray-100">
                            <div
                              className="h-1.5 rounded-full bg-blue-400"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {q.avg !== undefined && (
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-lg font-bold">{q.min}</div>
                    <div className="text-xs text-gray-500">Мин</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{q.avg}</div>
                    <div className="text-xs text-gray-500">Средн</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{q.max}</div>
                    <div className="text-xs text-gray-500">Макс</div>
                  </div>
                </div>
              )}

              {q.avgLength !== undefined && q.avgLength > 0 && (
                <div className="text-center">
                  <div className="text-lg font-bold">{q.avgLength}</div>
                  <div className="text-xs text-gray-500">
                    Средняя длина текста (символов)
                  </div>
                </div>
              )}
            </div>
          ))}

        {/* Timeline */}
        {Object.keys(stats.timeline).length > 0 && (
          <div className="glass-card p-4 lg:col-span-2">
            <h3 className="mb-3 font-medium text-sm">Ответы по дням (30 дней)</h3>
            <div className="flex items-end gap-1 h-24">
              {(() => {
                const entries = Object.entries(stats.timeline).sort();
                const maxVal = Math.max(...entries.map(([, v]) => v), 1);
                return entries.map(([day, count]) => (
                  <div
                    key={day}
                    className="flex-1 bg-primary rounded-t"
                    style={{ height: `${(count / maxVal) * 100}%` }}
                    title={`${day}: ${count}`}
                  />
                ));
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
