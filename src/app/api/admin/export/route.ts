import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  SAT_TIMELINES,
  WEEKLY_HOURS,
  PLATFORM_USAGE,
  EDUCATION_LEVELS,
  SESSION_READINESS,
} from "@/types";

function getLabel(
  options: { value: string; label: string }[],
  value: string
): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submissions = await prisma.submission.findMany({
    orderBy: { totalScore: "desc" },
  });

  const headers = [
    "Имя",
    "Telegram",
    "Возраст",
    "Город",
    "Образование",
    "Когда SAT",
    "Сдавал SAT",
    "Балл SAT",
    "Часы/нед",
    "Ресурсы",
    "Платформа",
    "Функции",
    "Что нравится",
    "Что расстраивает",
    "Мотивация",
    "Готовность",
    "Дни",
    "Время",
    "Источник",
    "Балл",
    "Процент",
    "Статус",
    "Заметки",
    "Дата",
  ];

  const escape = (val: string) => {
    if (val.includes(";") || val.includes('"') || val.includes("\n")) {
      return '"' + val.replace(/"/g, '""') + '"';
    }
    return val;
  };

  const rows = submissions.map((s) => [
    escape(s.name),
    escape(s.telegramUsername),
    String(s.age),
    escape(s.city),
    getLabel(EDUCATION_LEVELS, s.educationLevel),
    getLabel(SAT_TIMELINES, s.satTimeline),
    s.hasTakenSat ? "Да" : "Нет",
    s.previousScore ? String(s.previousScore) : "",
    getLabel(WEEKLY_HOURS, s.weeklyHours),
    escape(s.resources.join(", ")),
    getLabel(PLATFORM_USAGE, s.platformUsage),
    escape(s.featuresUsed.join(", ")),
    escape(s.whatYouLike),
    escape(s.whatFrustrates),
    escape(s.motivation),
    getLabel(SESSION_READINESS, s.sessionReadiness),
    escape(s.availableDays.join(", ")),
    escape(s.availableTimes.join(", ")),
    s.referralSource ?? "",
    String(s.totalScore),
    String(s.scorePercentage) + "%",
    s.status,
    escape(s.adminNotes ?? ""),
    s.createdAt.toISOString().split("T")[0],
  ]);

  // UTF-8 BOM for Excel
  const BOM = "\uFEFF";
  const csv =
    BOM + headers.join(";") + "\n" + rows.map((r) => r.join(";")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="focus-group-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
