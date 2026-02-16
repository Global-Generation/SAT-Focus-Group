import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [total, avgScore, selected, pending, byStatus, byCity, byTimeline] =
    await Promise.all([
      prisma.submission.count(),
      prisma.submission.aggregate({ _avg: { totalScore: true } }),
      prisma.submission.count({ where: { status: "SELECTED" } }),
      prisma.submission.count({ where: { status: "PENDING" } }),
      prisma.submission.groupBy({
        by: ["status"],
        _count: true,
      }),
      prisma.submission.groupBy({
        by: ["city"],
        _count: true,
        orderBy: { _count: { city: "desc" } },
        take: 10,
      }),
      prisma.submission.groupBy({
        by: ["satTimeline"],
        _count: true,
      }),
    ]);

  return NextResponse.json({
    total,
    avgScore: Math.round(avgScore._avg.totalScore ?? 0),
    selected,
    pending,
    byStatus: byStatus.map((s) => ({ status: s.status, count: s._count })),
    byCity: byCity.map((c) => ({ city: c.city, count: c._count })),
    byTimeline: byTimeline.map((t) => ({
      timeline: t.satTimeline,
      count: t._count,
    })),
  });
}
