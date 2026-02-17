"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
// Card removed — using glass-card divs
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Save,
  ArrowLeft,
  Settings,
} from "lucide-react";

type Option = {
  id?: string;
  value: string;
  label: string;
  sortOrder: number;
  points: number;
};

type Question = {
  id?: string;
  fieldKey: string;
  label: string;
  description: string;
  type: string;
  required: boolean;
  sortOrder: number;
  config: Record<string, unknown> | null;
  scoringCategory: string;
  maxPoints: number;
  scoringRules: Record<string, unknown> | null;
  showIf: Record<string, unknown> | null;
  options: Option[];
};

type Page = {
  id?: string;
  title: string;
  sortOrder: number;
  questions: Question[];
};

type Survey = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  heroTitle: string | null;
  ndaText: string | null;
  successMessage: string | null;
  maxScore: number;
  dedupFieldKey: string | null;
  scoreTiers: unknown;
  pages: Page[];
};

const QUESTION_TYPES = [
  { value: "TEXT", label: "Текст" },
  { value: "TEXTAREA", label: "Текстовая область" },
  { value: "NUMBER", label: "Число" },
  { value: "RADIO", label: "Один выбор" },
  { value: "CHECKBOX", label: "Множественный выбор" },
  { value: "BOOLEAN", label: "Да/Нет" },
  { value: "CHIP_SELECT", label: "Чипы (теги)" },
  { value: "CONSENT", label: "Согласие" },
];

export default function SurveyEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsData, setSettingsData] = useState({
    title: "",
    slug: "",
    description: "",
    heroTitle: "",
    ndaText: "",
    successMessage: "",
    dedupFieldKey: "",
  });

  useEffect(() => {
    loadSurvey();
  }, [id]);

  const loadSurvey = async () => {
    const res = await fetch(`/focus-group/api/admin/surveys/${id}`);
    if (res.ok) {
      const data = await res.json();
      setSurvey(data.survey);
      setSettingsData({
        title: data.survey.title || "",
        slug: data.survey.slug || "",
        description: data.survey.description || "",
        heroTitle: data.survey.heroTitle || "",
        ndaText: data.survey.ndaText || "",
        successMessage: data.survey.successMessage || "",
        dedupFieldKey: data.survey.dedupFieldKey || "",
      });
    }
    setLoading(false);
  };

  const savePages = async () => {
    if (!survey) return;
    setSaving(true);
    await fetch(`/focus-group/api/admin/surveys/${id}/pages`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pages: survey.pages }),
    });
    setSaving(false);
  };

  const saveSettings = async () => {
    setSaving(true);
    await fetch(`/focus-group/api/admin/surveys/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settingsData),
    });
    if (survey) {
      setSurvey({ ...survey, ...settingsData });
    }
    setSaving(false);
    setShowSettings(false);
  };

  const addPage = () => {
    if (!survey) return;
    const newPage: Page = {
      title: `Страница ${survey.pages.length + 1}`,
      sortOrder: survey.pages.length,
      questions: [],
    };
    setSurvey({ ...survey, pages: [...survey.pages, newPage] });
    setActiveTab(survey.pages.length);
  };

  const removePage = (idx: number) => {
    if (!survey || survey.pages.length <= 1) return;
    const pages = survey.pages.filter((_, i) => i !== idx);
    pages.forEach((p, i) => (p.sortOrder = i));
    setSurvey({ ...survey, pages });
    if (activeTab >= pages.length) setActiveTab(pages.length - 1);
  };

  const updatePage = (idx: number, data: Partial<Page>) => {
    if (!survey) return;
    const pages = [...survey.pages];
    pages[idx] = { ...pages[idx], ...data };
    setSurvey({ ...survey, pages });
  };

  const addQuestion = (pageIdx: number) => {
    if (!survey) return;
    const pages = [...survey.pages];
    const q: Question = {
      fieldKey: `field_${Date.now()}`,
      label: "",
      description: "",
      type: "TEXT",
      required: true,
      sortOrder: pages[pageIdx].questions.length,
      config: null,
      scoringCategory: "",
      maxPoints: 0,
      scoringRules: null,
      showIf: null,
      options: [],
    };
    pages[pageIdx] = {
      ...pages[pageIdx],
      questions: [...pages[pageIdx].questions, q],
    };
    setSurvey({ ...survey, pages });
  };

  const updateQuestion = (
    pageIdx: number,
    qIdx: number,
    data: Partial<Question>
  ) => {
    if (!survey) return;
    const pages = [...survey.pages];
    const questions = [...pages[pageIdx].questions];
    questions[qIdx] = { ...questions[qIdx], ...data };
    pages[pageIdx] = { ...pages[pageIdx], questions };
    setSurvey({ ...survey, pages });
  };

  const removeQuestion = (pageIdx: number, qIdx: number) => {
    if (!survey) return;
    const pages = [...survey.pages];
    const questions = pages[pageIdx].questions.filter((_, i) => i !== qIdx);
    questions.forEach((q, i) => (q.sortOrder = i));
    pages[pageIdx] = { ...pages[pageIdx], questions };
    setSurvey({ ...survey, pages });
  };

  const moveQuestion = (pageIdx: number, qIdx: number, dir: -1 | 1) => {
    if (!survey) return;
    const pages = [...survey.pages];
    const questions = [...pages[pageIdx].questions];
    const newIdx = qIdx + dir;
    if (newIdx < 0 || newIdx >= questions.length) return;
    [questions[qIdx], questions[newIdx]] = [questions[newIdx], questions[qIdx]];
    questions.forEach((q, i) => (q.sortOrder = i));
    pages[pageIdx] = { ...pages[pageIdx], questions };
    setSurvey({ ...survey, pages });
  };

  if (loading || !survey) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const currentPage = survey.pages[activeTab];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold">{survey.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4 mr-1" />
            Настройки
          </Button>
          <button
            onClick={savePages}
            disabled={saving}
            className="btn-cta h-9 px-5 text-sm disabled:opacity-40"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Сохранить
          </button>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="glass-form mb-4 p-5">
          <h3 className="mb-3 font-medium text-sm">Настройки опроса</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Название</Label>
              <Input
                value={settingsData.title}
                onChange={(e) =>
                  setSettingsData({ ...settingsData, title: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">URL slug</Label>
              <Input
                value={settingsData.slug}
                onChange={(e) =>
                  setSettingsData({ ...settingsData, slug: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Описание</Label>
              <Textarea
                value={settingsData.description}
                onChange={(e) =>
                  setSettingsData({
                    ...settingsData,
                    description: e.target.value,
                  })
                }
                className="mt-1"
                rows={2}
              />
            </div>
            <div>
              <Label className="text-xs">Заголовок Hero</Label>
              <Input
                value={settingsData.heroTitle}
                onChange={(e) =>
                  setSettingsData({
                    ...settingsData,
                    heroTitle: e.target.value,
                  })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Поле дедупликации (fieldKey)</Label>
              <Input
                value={settingsData.dedupFieldKey}
                onChange={(e) =>
                  setSettingsData({
                    ...settingsData,
                    dedupFieldKey: e.target.value,
                  })
                }
                className="mt-1"
                placeholder="telegramUsername"
              />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Текст NDA</Label>
              <Textarea
                value={settingsData.ndaText}
                onChange={(e) =>
                  setSettingsData({ ...settingsData, ndaText: e.target.value })
                }
                className="mt-1"
                rows={3}
              />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Сообщение после отправки</Label>
              <Textarea
                value={settingsData.successMessage}
                onChange={(e) =>
                  setSettingsData({
                    ...settingsData,
                    successMessage: e.target.value,
                  })
                }
                className="mt-1"
                rows={2}
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="btn-cta h-9 px-5 text-sm disabled:opacity-40"
            >
              Сохранить настройки
            </button>
          </div>
        </div>
      )}

      {/* Page tabs */}
      <div className="mb-4 flex items-center gap-1 overflow-x-auto border-b">
        {survey.pages.map((p, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`flex items-center gap-1 whitespace-nowrap border-b-2 px-4 py-2 text-sm transition-colors ${
              activeTab === i
                ? "border-primary text-primary font-medium"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {p.title}
            {survey.pages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removePage(i);
                }}
                className="ml-1 rounded p-0.5 hover:bg-red-50 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </button>
        ))}
        <button
          onClick={addPage}
          className="flex items-center gap-1 px-3 py-2 text-sm text-gray-400 hover:text-primary"
        >
          <Plus className="h-3 w-3" /> Страница
        </button>
      </div>

      {/* Page title edit */}
      {currentPage && (
        <div className="mb-4">
          <Input
            value={currentPage.title}
            onChange={(e) =>
              updatePage(activeTab, { title: e.target.value })
            }
            className="text-sm font-medium"
            placeholder="Название страницы"
          />
        </div>
      )}

      {/* Questions */}
      <div className="space-y-3">
        {currentPage?.questions.map((q, qi) => (
          <div key={qi} className="glass-card p-4">
            <div className="flex items-start gap-2">
              <div className="flex flex-col gap-1 pt-1">
                <button
                  onClick={() => moveQuestion(activeTab, qi, -1)}
                  disabled={qi === 0}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <GripVertical className="h-4 w-4 text-gray-300" />
                <button
                  onClick={() => moveQuestion(activeTab, qi, 1)}
                  disabled={qi === currentPage.questions.length - 1}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <Label className="text-xs">Вопрос</Label>
                    <Input
                      value={q.label}
                      onChange={(e) =>
                        updateQuestion(activeTab, qi, {
                          label: e.target.value,
                        })
                      }
                      className="mt-1"
                      placeholder="Текст вопроса"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Тип</Label>
                    <select
                      value={q.type}
                      onChange={(e) =>
                        updateQuestion(activeTab, qi, {
                          type: e.target.value,
                          options:
                            ["RADIO", "CHECKBOX", "BOOLEAN", "CHIP_SELECT"].includes(
                              e.target.value
                            ) && q.options.length === 0
                              ? [{ value: "", label: "", sortOrder: 0, points: 0 }]
                              : q.options,
                        })
                      }
                      className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                    >
                      {QUESTION_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <Label className="text-xs">Field Key</Label>
                    <Input
                      value={q.fieldKey}
                      onChange={(e) =>
                        updateQuestion(activeTab, qi, {
                          fieldKey: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Категория скоринга</Label>
                    <Input
                      value={q.scoringCategory || ""}
                      onChange={(e) =>
                        updateQuestion(activeTab, qi, {
                          scoringCategory: e.target.value,
                        })
                      }
                      className="mt-1"
                      placeholder="timeline"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Макс. баллов</Label>
                    <Input
                      type="number"
                      value={q.maxPoints}
                      onChange={(e) =>
                        updateQuestion(activeTab, qi, {
                          maxPoints: parseInt(e.target.value) || 0,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-end gap-2 pb-1">
                    <label className="flex items-center gap-1.5 text-xs">
                      <input
                        type="checkbox"
                        checked={q.required}
                        onChange={(e) =>
                          updateQuestion(activeTab, qi, {
                            required: e.target.checked,
                          })
                        }
                      />
                      Обязательный
                    </label>
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Описание (подсказка)</Label>
                  <Input
                    value={q.description || ""}
                    onChange={(e) =>
                      updateQuestion(activeTab, qi, {
                        description: e.target.value,
                      })
                    }
                    className="mt-1"
                    placeholder="Необязательное описание"
                  />
                </div>

                {/* Options editor for RADIO/CHECKBOX/BOOLEAN/CHIP_SELECT */}
                {["RADIO", "CHECKBOX", "BOOLEAN", "CHIP_SELECT"].includes(
                  q.type
                ) && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label className="text-xs">Варианты ответа</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const opts = [
                            ...q.options,
                            {
                              value: "",
                              label: "",
                              sortOrder: q.options.length,
                              points: 0,
                            },
                          ];
                          updateQuestion(activeTab, qi, { options: opts });
                        }}
                        className="h-6 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" /> Вариант
                      </Button>
                    </div>
                    <div className="space-y-1">
                      {q.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <Input
                            value={opt.value}
                            onChange={(e) => {
                              const opts = [...q.options];
                              opts[oi] = { ...opts[oi], value: e.target.value };
                              updateQuestion(activeTab, qi, { options: opts });
                            }}
                            className="w-32"
                            placeholder="value"
                          />
                          <Input
                            value={opt.label}
                            onChange={(e) => {
                              const opts = [...q.options];
                              opts[oi] = { ...opts[oi], label: e.target.value };
                              updateQuestion(activeTab, qi, { options: opts });
                            }}
                            className="flex-1"
                            placeholder="Текст варианта"
                          />
                          <Input
                            type="number"
                            value={opt.points}
                            onChange={(e) => {
                              const opts = [...q.options];
                              opts[oi] = {
                                ...opts[oi],
                                points: parseInt(e.target.value) || 0,
                              };
                              updateQuestion(activeTab, qi, { options: opts });
                            }}
                            className="w-20"
                            placeholder="Баллы"
                          />
                          <button
                            onClick={() => {
                              const opts = q.options.filter(
                                (_, i) => i !== oi
                              );
                              updateQuestion(activeTab, qi, { options: opts });
                            }}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scoring rules for non-option types */}
                {["TEXTAREA", "NUMBER"].includes(q.type) && q.maxPoints > 0 && (
                  <div>
                    <Label className="text-xs">
                      Правила скоринга (JSON)
                    </Label>
                    <Textarea
                      value={
                        q.scoringRules
                          ? JSON.stringify(q.scoringRules, null, 2)
                          : ""
                      }
                      onChange={(e) => {
                        try {
                          const rules = JSON.parse(e.target.value);
                          updateQuestion(activeTab, qi, {
                            scoringRules: rules,
                          });
                        } catch {
                          // Let user keep typing
                        }
                      }}
                      className="mt-1 font-mono text-xs"
                      rows={3}
                      placeholder='{"type": "textLength", "tiers": [{"min": 200, "points": 5}]}'
                    />
                  </div>
                )}
              </div>

              <button
                onClick={() => removeQuestion(activeTab, qi)}
                className="text-gray-400 hover:text-red-500 pt-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={() => addQuestion(activeTab)}
        className="mt-4 w-full"
      >
        <Plus className="h-4 w-4 mr-1" /> Добавить вопрос
      </Button>
    </div>
  );
}
