"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
// Card removed — using glass-card divs
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Search,
  Download,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

type Answer = {
  textValue: string | null;
  numberValue: number | null;
  boolValue: boolean | null;
  arrayValue: string[];
  points: number;
  question: { fieldKey: string; label: string; type: string };
  selectedOption: { label: string } | null;
};

type ResponseRow = {
  id: string;
  totalScore: number;
  scorePercentage: number;
  status: string;
  createdAt: string;
  answers: Answer[];
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
  SHORTLISTED: "В шорт-листе",
  SELECTED: "Отобран",
  REJECTED: "Отклонён",
  CONTACTED: "Связались",
};

function getAnswerDisplay(a: Answer): string {
  if (a.selectedOption) return a.selectedOption.label;
  if (a.arrayValue?.length > 0) return a.arrayValue.join(", ");
  if (a.boolValue !== null) return a.boolValue ? "Да" : "Нет";
  if (a.numberValue !== null) return String(a.numberValue);
  return a.textValue || "—";
}

export default function ResponsesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState("date_desc");
  const [loading, setLoading] = useState(true);
  const [surveyTitle, setSurveyTitle] = useState("");

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page), sort });
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("search", search);

    const res = await fetch(
      `/focus-group/api/admin/surveys/${id}/responses?${params}`
    );
    if (res.ok) {
      const data = await res.json();
      setResponses(data.responses);
      setTotal(data.total);
    }
    setLoading(false);
  }, [id, page, sort, statusFilter, search]);

  useEffect(() => {
    // Get survey title
    fetch(`/focus-group/api/admin/surveys/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setSurveyTitle(d.survey?.title || ""));
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.ceil(total / 50);

  // Find key identifying answers (first TEXT type = name, second = telegram)
  const getKeyFields = (r: ResponseRow) => {
    const textAnswers = r.answers.filter((a) => a.question.type === "TEXT");
    return {
      name: textAnswers[0]?.textValue || "—",
      identifier: textAnswers[1]?.textValue || "",
    };
  };

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
          <h1 className="text-xl font-semibold">Ответы</h1>
          <p className="text-sm text-gray-500">{surveyTitle}</p>
        </div>
        <div className="ml-auto">
          <a href={`/focus-group/api/admin/surveys/${id}/export`}>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" /> CSV
            </Button>
          </a>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card mb-4 p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Поиск..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border-slate-200/80 bg-white/70 pl-9 backdrop-blur-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200/80 bg-white/70 px-3 py-2 text-sm backdrop-blur-sm"
          >
            <option value="">Все статусы</option>
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
            className="flex items-center gap-1 rounded-xl border border-slate-200/80 bg-white/70 px-3 py-2 text-sm backdrop-blur-sm transition-colors hover:bg-white"
          >
            <ArrowUpDown className="h-4 w-4" />
            {sort === "score_desc" && "Балл ↓"}
            {sort === "score_asc" && "Балл ↑"}
            {sort === "date_desc" && "Дата ↓"}
            {sort === "date_asc" && "Дата ↑"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200/60 bg-slate-50/50 text-left text-slate-500">
                  <th className="px-4 py-3 font-medium">Имя</th>
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Балл</th>
                  <th className="px-4 py-3 font-medium">Статус</th>
                  <th className="px-4 py-3 font-medium">Дата</th>
                </tr>
              </thead>
              <tbody>
                {responses.map((r) => {
                  const { name, identifier } = getKeyFields(r);
                  return (
                    <tr
                      key={r.id}
                      className="border-b border-slate-100 transition-colors hover:bg-blue-50/30 cursor-pointer"
                      onClick={() =>
                        router.push(
                          `/admin/surveys/${id}/responses/${r.id}`
                        )
                      }
                    >
                      <td className="px-4 py-3 font-medium text-primary">
                        {name}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {identifier}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium">
                          {r.totalScore} ({r.scorePercentage}%)
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={STATUS_COLORS[r.status]}>
                          {STATUS_LABELS[r.status] || r.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(r.createdAt).toLocaleDateString("ru")}
                      </td>
                    </tr>
                  );
                })}
                {responses.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-12 text-center text-gray-400"
                    >
                      Ответов пока нет
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <span className="text-sm text-gray-500">
                {responses.length} из {total}
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
        </div>
      )}
    </div>
  );
}
