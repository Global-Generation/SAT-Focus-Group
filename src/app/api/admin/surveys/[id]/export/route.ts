import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/admin/surveys/[id]/export — CSV export
export async function GET(_req: NextRequest, ctx: Ctx) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  const survey = await prisma.survey.findUnique({
    where: { id },
    include: {
      pages: {
        orderBy: { sortOrder: "asc" },
        include: {
          questions: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
  });

  if (!survey) {
    return NextResponse.json({ error: "Survey not found" }, { status: 404 });
  }

  const questions = survey.pages.flatMap((p) => p.questions);

  const responses = await prisma.response.findMany({
    where: { surveyId: id },
    include: {
      answers: {
        include: {
          selectedOption: { select: { label: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Build CSV
  const esc = (v: string) => {
    if (v.includes(";") || v.includes('"') || v.includes("\n")) {
      return `"${v.replace(/"/g, '""')}"`;
    }
    return v;
  };

  const headers = [
    ...questions.map((q) => q.label),
    "Балл",
    "Процент",
    "Статус",
    "Заметки",
    "Дата",
  ];

  const rows = responses.map((r) => {
    const cols = questions.map((q) => {
      const ans = r.answers.find((a) => a.questionId === q.id);
      if (!ans) return "";
      if (ans.selectedOption) return ans.selectedOption.label;
      if (ans.arrayValue.length > 0) return ans.arrayValue.join(", ");
      if (ans.boolValue !== null) return ans.boolValue ? "Да" : "Нет";
      if (ans.numberValue !== null) return String(ans.numberValue);
      return ans.textValue || "";
    });

    return [
      ...cols,
      String(r.totalScore),
      `${r.scorePercentage}%`,
      r.status,
      r.adminNotes || "",
      r.createdAt.toISOString().split("T")[0],
    ];
  });

  const bom = "\uFEFF";
  const csv =
    bom +
    headers.map(esc).join(";") +
    "\n" +
    rows.map((r) => r.map(esc).join(";")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${survey.slug}-export.csv"`,
    },
  });
}
