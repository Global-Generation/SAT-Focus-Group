"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Save } from "lucide-react";

type Answer = {
  id: string;
  textValue: string | null;
  numberValue: number | null;
  boolValue: boolean | null;
  arrayValue: string[];
  points: number;
  question: {
    fieldKey: string;
    label: string;
    type: string;
    scoringCategory: string | null;
    maxPoints: number;
  };
  selectedOption: { label: string; value: string } | null;
};

type ResponseDetail = {
  id: string;
  totalScore: number;
  scorePercentage: number;
  scoreBreakdown: unknown;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  ipAddress: string | null;
  answers: Answer[];
  survey: { title: string; maxScore: number };
};

const STATUSES = [
  { value: "PENDING", label: "Ожидает", color: "bg-gray-100 text-gray-700" },
  { value: "SHORTLISTED", label: "Шорт-лист", color: "bg-blue-100 text-blue-700" },
  { value: "SELECTED", label: "Отобран", color: "bg-green-100 text-green-700" },
  { value: "REJECTED", label: "Отклонён", color: "bg-red-100 text-red-700" },
  { value: "CONTACTED", label: "Связались", color: "bg-purple-100 text-purple-700" },
];

function getDisplayValue(a: Answer): string {
  if (a.selectedOption) return a.selectedOption.label;
  if (a.arrayValue?.length > 0) return a.arrayValue.join(", ");
  if (a.boolValue !== null) return a.boolValue ? "Да" : "Нет";
  if (a.numberValue !== null) return String(a.numberValue);
  return a.textValue || "—";
}

export default function ResponseDetailPage({
  params,
}: {
  params: Promise<{ id: string; rid: string }>;
}) {
  const { id, rid } = use(params);
  const router = useRouter();
  const [response, setResponse] = useState<ResponseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/focus-group/api/admin/surveys/${id}/responses/${rid}`)
      .then((r) => r.json())
      .then((data) => {
        setResponse(data.response);
        setStatus(data.response.status);
        setNotes(data.response.adminNotes || "");
      })
      .finally(() => setLoading(false));
  }, [id, rid]);

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/focus-group/api/admin/surveys/${id}/responses/${rid}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNotes: notes }),
    });
    setSaving(false);
  };

  if (loading || !response) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Group answers by scoring category
  const scoredAnswers = response.answers.filter((a) => a.question.maxPoints > 0);
  const unscoredAnswers = response.answers.filter((a) => a.question.maxPoints === 0);

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            router.push(`/focus-group/admin/surveys/${id}/responses`)
          }
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">Ответ</h1>
          <p className="text-sm text-gray-500">{response.survey.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Info answers */}
          {unscoredAnswers.length > 0 && (
            <Card className="p-4">
              <h3 className="mb-3 font-medium text-sm">Информация</h3>
              <div className="space-y-2">
                {unscoredAnswers.map((a) => (
                  <div key={a.id} className="flex justify-between border-b pb-2 last:border-0">
                    <span className="text-sm text-gray-500">{a.question.label}</span>
                    <span className="text-sm font-medium">{getDisplayValue(a)}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Scored answers */}
          {scoredAnswers.length > 0 && (
            <Card className="p-4">
              <h3 className="mb-3 font-medium text-sm">Ответы с баллами</h3>
              <div className="space-y-3">
                {scoredAnswers.map((a) => (
                  <div key={a.id} className="border-b pb-3 last:border-0">
                    <div className="flex items-start justify-between">
                      <span className="text-sm text-gray-500">{a.question.label}</span>
                      <Badge className="bg-blue-50 text-blue-700 text-xs">
                        {a.points}/{a.question.maxPoints}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm">{getDisplayValue(a)}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="mb-3 font-medium text-sm">Результат</h3>
            <div className="text-center mb-3">
              <div className="text-3xl font-bold">{response.totalScore}</div>
              <div className="text-sm text-gray-500">
                из {response.survey.maxScore} ({response.scorePercentage}%)
              </div>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: `${response.scorePercentage}%` }}
              />
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="mb-3 font-medium text-sm">Статус</h3>
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStatus(s.value)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    status === s.value
                      ? s.color + " ring-2 ring-offset-1 ring-blue-300"
                      : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="mb-3 font-medium text-sm">Заметки</h3>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Заметки администратора..."
            />
          </Card>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-primary text-white"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            Сохранить
          </Button>

          <div className="text-xs text-gray-400 space-y-1">
            <p>Дата: {new Date(response.createdAt).toLocaleString("ru")}</p>
            {response.ipAddress && <p>IP: {response.ipAddress}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
