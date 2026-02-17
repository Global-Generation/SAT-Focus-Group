"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Loader2,
  Copy,
  ExternalLink,
  BarChart3,
  FileText,
  MoreHorizontal,
  ClipboardList,
} from "lucide-react";

type Survey = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: "DRAFT" | "ACTIVE" | "CLOSED" | "ARCHIVED";
  createdAt: string;
  _count: { responses: number; pages: number };
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-slate-100/80 text-slate-600 border border-slate-200/60",
  ACTIVE: "bg-emerald-50/80 text-emerald-700 border border-emerald-200/60",
  CLOSED: "bg-amber-50/80 text-amber-700 border border-amber-200/60",
  ARCHIVED: "bg-red-50/80 text-red-600 border border-red-200/60",
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Черновик",
  ACTIVE: "Активен",
  CLOSED: "Закрыт",
  ARCHIVED: "Архив",
};

export default function AdminDashboard() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [creating, setCreating] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const router = useRouter();

  const loadSurveys = async () => {
    const res = await fetch("/focus-group/api/admin/surveys");
    if (res.ok) {
      const data = await res.json();
      setSurveys(data.surveys);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSurveys();
  }, []);

  const handleCreate = async () => {
    if (!newTitle || !newSlug) return;
    setCreating(true);
    const res = await fetch("/focus-group/api/admin/surveys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, slug: newSlug }),
    });
    if (res.ok) {
      const { survey } = await res.json();
      setShowCreate(false);
      setNewTitle("");
      setNewSlug("");
      router.push(`/admin/surveys/${survey.id}/edit`);
    }
    setCreating(false);
  };

  const handleDuplicate = async (id: string) => {
    const res = await fetch(`/focus-group/api/admin/surveys/${id}/duplicate`, {
      method: "POST",
    });
    if (res.ok) {
      loadSurveys();
    }
    setMenuOpen(null);
  };

  const handleStatusChange = async (id: string, status: string) => {
    await fetch(`/focus-group/api/admin/surveys/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadSurveys();
    setMenuOpen(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Опросы</h1>
          <p className="mt-1 text-sm text-slate-500">{surveys.length} опрос(ов)</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-cta h-10 px-5 text-sm"
        >
          <Plus className="h-4 w-4" /> Создать опрос
        </button>
      </div>

      {showCreate && (
        <div className="glass-form mb-6 p-5">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Новый опрос</h3>
          <div className="flex gap-3">
            <Input
              placeholder="Название"
              value={newTitle}
              onChange={(e) => {
                setNewTitle(e.target.value);
                if (!newSlug || newSlug === slugify(newTitle)) {
                  setNewSlug(slugify(e.target.value));
                }
              }}
              className="flex-1 rounded-xl border-slate-200/80 bg-white/70"
            />
            <Input
              placeholder="URL-slug"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              className="w-40 rounded-xl border-slate-200/80 bg-white/70"
            />
            <button
              onClick={handleCreate}
              disabled={creating || !newTitle || !newSlug}
              className="btn-cta h-10 px-5 text-sm disabled:opacity-40"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Создать"}
            </button>
            <Button
              variant="outline"
              onClick={() => setShowCreate(false)}
              className="rounded-xl border-slate-200/80"
            >
              Отмена
            </Button>
          </div>
        </div>
      )}

      {surveys.length === 0 ? (
        <div className="glass-form p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50/80">
            <ClipboardList className="h-7 w-7 text-blue-400" />
          </div>
          <p className="text-slate-500">Нет опросов. Создайте первый!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {surveys.map((s) => (
            <div
              key={s.id}
              className="glass-card p-5 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <h3 className="font-semibold text-slate-900">{s.title}</h3>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[s.status]}`}>
                      {STATUS_LABELS[s.status]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    /{s.slug} · {s._count.pages} стр. · {s._count.responses} ответов
                  </p>
                  {s.description && (
                    <p className="mt-1.5 text-sm text-slate-500">{s.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/surveys/${s.id}/edit`)}
                    className="rounded-lg border-slate-200/80 bg-white/70 text-xs backdrop-blur-sm hover:bg-white"
                  >
                    <FileText className="h-3.5 w-3.5 mr-1" />
                    Редактор
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/surveys/${s.id}/responses`)}
                    className="rounded-lg border-slate-200/80 bg-white/70 text-xs backdrop-blur-sm hover:bg-white"
                  >
                    <FileText className="h-3.5 w-3.5 mr-1" />
                    Ответы
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/surveys/${s.id}/stats`)}
                    className="rounded-lg border-slate-200/80 bg-white/70 text-xs backdrop-blur-sm hover:bg-white"
                  >
                    <BarChart3 className="h-3.5 w-3.5 mr-1" />
                    Стат
                  </Button>
                  {s.status === "ACTIVE" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/focus-group/s/${s.slug}`, "_blank")}
                      className="rounded-lg border-slate-200/80 bg-white/70 backdrop-blur-sm hover:bg-white"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMenuOpen(menuOpen === s.id ? null : s.id)}
                      className="rounded-lg border-slate-200/80 bg-white/70 backdrop-blur-sm hover:bg-white"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                    {menuOpen === s.id && (
                      <div className="absolute right-0 top-9 z-10 w-44 rounded-xl border border-slate-200/60 bg-white/95 py-1 shadow-lg backdrop-blur-xl">
                        <button
                          onClick={() => handleDuplicate(s.id)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          Дублировать
                        </button>
                        {s.status === "DRAFT" && (
                          <button
                            onClick={() => handleStatusChange(s.id, "ACTIVE")}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-emerald-600 hover:bg-slate-50"
                          >
                            Опубликовать
                          </button>
                        )}
                        {s.status === "ACTIVE" && (
                          <button
                            onClick={() => handleStatusChange(s.id, "CLOSED")}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-amber-600 hover:bg-slate-50"
                          >
                            Закрыть
                          </button>
                        )}
                        {s.status !== "ARCHIVED" && (
                          <button
                            onClick={() => handleStatusChange(s.id, "ARCHIVED")}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-slate-50"
                          >
                            Архивировать
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[а-яёА-ЯЁ]/g, (c) => {
      const map: Record<string, string> = {
        а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo",
        ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
        н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
        ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch",
        ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
      };
      return map[c.toLowerCase()] || c;
    })
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
