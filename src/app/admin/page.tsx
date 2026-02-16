"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  BarChart3,
  UserCheck,
  Clock,
  Search,
  Download,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { SAT_TIMELINES, EDUCATION_LEVELS } from "@/types";
import { getScoreTier } from "@/lib/scoring";
import Link from "next/link";

interface Stats {
  total: number;
  avgScore: number;
  selected: number;
  pending: number;
}

interface SubmissionRow {
  id: string;
  name: string;
  telegramUsername: string;
  totalScore: number;
  scorePercentage: number;
  city: string;
  satTimeline: string;
  status: string;
  createdAt: string;
  educationLevel: string;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  SHORTLISTED: "bg-blue-100 text-blue-700",
  SELECTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  CONTACTED: "bg-purple-100 text-purple-700",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Ожидает",
  SHORTLISTED: "В шорт-листе",
  SELECTED: "Отобран",
  REJECTED: "Отклонён",
  CONTACTED: "Связались",
};

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sort, setSort] = useState("score_desc");

  const fetchStats = useCallback(async () => {
    const res = await fetch("/focus-group/api/admin/stats");
    if (res.ok) setStats(await res.json());
  }, []);

  const fetchSubmissions = useCallback(async () => {
    const params = new URLSearchParams({
      page: String(page),
      status: statusFilter,
      sort,
    });
    if (search) params.set("search", search);

    const res = await fetch(`/focus-group/api/admin/submissions?${params}`);
    if (res.ok) {
      const data = await res.json();
      setSubmissions(data.submissions);
      setTotal(data.total);
    }
  }, [page, statusFilter, sort, search]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const getTimelineLabel = (val: string) =>
    SAT_TIMELINES.find((t) => t.value === val)?.label ?? val;

  const getEduLabel = (val: string) =>
    EDUCATION_LEVELS.find((e) => e.value === val)?.label ?? val;

  const totalPages = Math.ceil(total / 50);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Фокус-группа SAT
            </h1>
            <p className="text-sm text-gray-500">Управление заявками</p>
          </div>
          <a href="/focus-group/api/admin/export">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              CSV
            </Button>
          </a>
        </div>

        {/* Stats */}
        {stats && (
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Всего заявок</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-yellow-100 p-2">
                  <BarChart3 className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Средний балл</p>
                  <p className="text-2xl font-bold">{stats.avgScore}/130</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2">
                  <UserCheck className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Отобрано</p>
                  <p className="text-2xl font-bold">{stats.selected}/20</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gray-100 p-2">
                  <Clock className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ожидают</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-4 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Поиск по имени, Telegram, городу..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-md border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="ALL">Все статусы</option>
              <option value="PENDING">Ожидает</option>
              <option value="SHORTLISTED">Шорт-лист</option>
              <option value="SELECTED">Отобран</option>
              <option value="REJECTED">Отклонён</option>
              <option value="CONTACTED">Связались</option>
            </select>
            <button
              onClick={() => {
                setSort((s) =>
                  s === "score_desc"
                    ? "score_asc"
                    : s === "score_asc"
                      ? "date_desc"
                      : s === "date_desc"
                        ? "date_asc"
                        : "score_desc"
                );
                setPage(1);
              }}
              className="flex items-center gap-1 rounded-md border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
            >
              <ArrowUpDown className="h-4 w-4" />
              {sort === "score_desc" && "Балл ↓"}
              {sort === "score_asc" && "Балл ↑"}
              {sort === "date_desc" && "Дата ↓"}
              {sort === "date_asc" && "Дата ↑"}
            </button>
          </div>
        </Card>

        {/* Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-gray-500">
                  <th className="px-4 py-3 font-medium">Имя</th>
                  <th className="px-4 py-3 font-medium">Telegram</th>
                  <th className="px-4 py-3 font-medium">Балл</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">
                    Город
                  </th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">
                    Образование
                  </th>
                  <th className="hidden px-4 py-3 font-medium lg:table-cell">
                    Когда SAT
                  </th>
                  <th className="px-4 py-3 font-medium">Статус</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => {
                  const tier = getScoreTier(s.totalScore);
                  return (
                    <tr
                      key={s.id}
                      className="border-b transition-colors hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/${s.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {s.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {s.telegramUsername}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tier.class}`}
                        >
                          {s.totalScore}/130
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 text-gray-600 sm:table-cell">
                        {s.city}
                      </td>
                      <td className="hidden px-4 py-3 text-gray-600 md:table-cell">
                        {getEduLabel(s.educationLevel)}
                      </td>
                      <td className="hidden px-4 py-3 text-gray-600 lg:table-cell">
                        {getTimelineLabel(s.satTimeline)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="secondary"
                          className={STATUS_COLORS[s.status]}
                        >
                          {STATUS_LABELS[s.status] ?? s.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
                {submissions.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center text-gray-400"
                    >
                      Заявок пока нет
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <span className="text-sm text-gray-500">
                Показано {submissions.length} из {total}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="flex items-center text-sm">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
