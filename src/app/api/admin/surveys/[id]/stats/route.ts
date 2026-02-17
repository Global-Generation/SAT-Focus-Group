import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/admin/surveys/[id]/stats — survey statistics
export async function GET(_req: NextRequest, ctx: Ctx) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  const survey = await prisma.survey.findUnique({
    where: { id },
    select: { id: true, title: true, maxScore: true, scoreTiers: true },
  });

  if (!survey) {
    return NextResponse.json({ error: "Survey not found" }, { status: 404 });
  }

  const responses = await prisma.response.findMany({
    where: { surveyId: id },
    include: {
      answers: {
        include: {
          question: {
            select: { fieldKey: true, label: true, type: true, scoringCategory: true, maxPoints: true },
          },
          selectedOption: { select: { label: true, value: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const total = responses.length;
  const avgScore = total > 0
    ? Math.round(responses.reduce((s, r) => s + r.totalScore, 0) / total)
    : 0;

  // Status breakdown
  const byStatus: Record<string, number> = {};
  for (const r of responses) {
    byStatus[r.status] = (byStatus[r.status] || 0) + 1;
  }

  // Score distribution (for tiers)
  const tiers = (survey.scoreTiers as Array<{ label: string; min: number }>) || [
    { label: "Отличный", min: 80 },
    { label: "Хороший", min: 55 },
    { label: "Средний", min: 30 },
    { label: "Низкий", min: 0 },
  ];

  const tierCounts: Record<string, number> = {};
  for (const t of tiers) tierCounts[t.label] = 0;

  for (const r of responses) {
    const pct = r.scorePercentage;
    for (const t of tiers) {
      if (pct >= t.min) {
        tierCounts[t.label]++;
        break;
      }
    }
  }

  // Per-question analytics
  const questions = await prisma.question.findMany({
    where: { page: { surveyId: id } },
    include: { options: { orderBy: { sortOrder: "asc" } } },
    orderBy: [{ page: { sortOrder: "asc" } }, { sortOrder: "asc" }],
  });

  const questionStats = questions.map((q) => {
    const answers = responses.flatMap((r) =>
      r.answers.filter((a) => a.questionId === q.id)
    );

    const stats: Record<string, unknown> = {
      id: q.id,
      fieldKey: q.fieldKey,
      label: q.label,
      type: q.type,
      totalAnswers: answers.length,
    };

    if (q.type === "RADIO" || q.type === "BOOLEAN") {
      const dist: Record<string, number> = {};
      for (const o of q.options) dist[o.label] = 0;
      for (const a of answers) {
        const lbl = a.selectedOption?.label || a.textValue || "—";
        dist[lbl] = (dist[lbl] || 0) + 1;
      }
      stats.distribution = dist;
    } else if (q.type === "CHECKBOX" || q.type === "CHIP_SELECT") {
      const freq: Record<string, number> = {};
      for (const a of answers) {
        for (const v of a.arrayValue) {
          freq[v] = (freq[v] || 0) + 1;
        }
      }
      stats.frequency = freq;
    } else if (q.type === "NUMBER") {
      const nums = answers.map((a) => a.numberValue).filter((n): n is number => n !== null);
      stats.avg = nums.length ? Math.round(nums.reduce((s, n) => s + n, 0) / nums.length) : 0;
      stats.min = nums.length ? Math.min(...nums) : 0;
      stats.max = nums.length ? Math.max(...nums) : 0;
    } else if (q.type === "TEXTAREA" || q.type === "TEXT") {
      const lens = answers
        .map((a) => a.textValue?.length || 0)
        .filter((l) => l > 0);
      stats.avgLength = lens.length ? Math.round(lens.reduce((s, l) => s + l, 0) / lens.length) : 0;
    }

    return stats;
  });

  // Timeline: responses per day (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const timeline: Record<string, number> = {};
  for (const r of responses) {
    if (r.createdAt >= thirtyDaysAgo) {
      const day = r.createdAt.toISOString().split("T")[0];
      timeline[day] = (timeline[day] || 0) + 1;
    }
  }

  return NextResponse.json({
    survey: { title: survey.title, maxScore: survey.maxScore },
    total,
    avgScore,
    selected: byStatus["SELECTED"] || 0,
    pending: byStatus["PENDING"] || 0,
    byStatus,
    tierCounts,
    questionStats,
    timeline,
  });
}
