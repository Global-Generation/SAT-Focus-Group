"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Loader2,
  Copy,
  ExternalLink,
  BarChart3,
  FileText,
  MoreHorizontal,
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
  DRAFT: "bg-gray-100 text-gray-700",
  ACTIVE: "bg-green-100 text-green-700",
  CLOSED: "bg-yellow-100 text-yellow-700",
  ARCHIVED: "bg-red-100 text-red-700",
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
      router.push(`/focus-group/admin/surveys/${survey.id}/edit`);
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
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Опросы</h1>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-primary text-white"
        >
          <Plus className="mr-1 h-4 w-4" /> Создать опрос
        </Button>
      </div>

      {showCreate && (
        <Card className="mb-6 p-4">
          <h3 className="mb-3 text-sm font-medium">Новый опрос</h3>
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
              className="flex-1"
            />
            <Input
              placeholder="URL-slug"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              className="w-40"
            />
            <Button
              onClick={handleCreate}
              disabled={creating || !newTitle || !newSlug}
              className="bg-primary text-white"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Создать"}
            </Button>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Отмена
            </Button>
          </div>
        </Card>
      )}

      {surveys.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          Нет опросов. Создайте первый!
        </Card>
      ) : (
        <div className="grid gap-4">
          {surveys.map((s) => (
            <Card key={s.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{s.title}</h3>
                    <Badge className={STATUS_COLORS[s.status]}>
                      {STATUS_LABELS[s.status]}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    /{s.slug} · {s._count.pages} стр. · {s._count.responses} ответов
                  </p>
                  {s.description && (
                    <p className="mt-1 text-sm text-gray-600">{s.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/focus-group/admin/surveys/${s.id}/edit`)
                    }
                  >
                    <FileText className="h-3.5 w-3.5 mr-1" />
                    Редактор
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/focus-group/admin/surveys/${s.id}/responses`)
                    }
                  >
                    <FileText className="h-3.5 w-3.5 mr-1" />
                    Ответы
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/focus-group/admin/surveys/${s.id}/stats`)
                    }
                  >
                    <BarChart3 className="h-3.5 w-3.5 mr-1" />
                    Стат
                  </Button>
                  {s.status === "ACTIVE" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(`/focus-group/s/${s.slug}`, "_blank")
                      }
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setMenuOpen(menuOpen === s.id ? null : s.id)
                      }
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                    {menuOpen === s.id && (
                      <div className="absolute right-0 top-9 z-10 w-44 rounded-md border bg-white py-1 shadow-lg">
                        <button
                          onClick={() => handleDuplicate(s.id)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          Дублировать
                        </button>
                        {s.status === "DRAFT" && (
                          <button
                            onClick={() => handleStatusChange(s.id, "ACTIVE")}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-gray-50"
                          >
                            Опубликовать
                          </button>
                        )}
                        {s.status === "ACTIVE" && (
                          <button
                            onClick={() => handleStatusChange(s.id, "CLOSED")}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-yellow-600 hover:bg-gray-50"
                          >
                            Закрыть
                          </button>
                        )}
                        {s.status !== "ARCHIVED" && (
                          <button
                            onClick={() =>
                              handleStatusChange(s.id, "ARCHIVED")
                            }
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
                          >
                            Архивировать
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
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
