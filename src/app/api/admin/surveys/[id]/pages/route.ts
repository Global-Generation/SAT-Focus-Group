import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

// PUT /api/admin/surveys/[id]/pages — bulk save pages + questions + options
export async function PUT(req: NextRequest, ctx: Ctx) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const { pages } = await req.json();

  if (!Array.isArray(pages)) {
    return NextResponse.json(
      { error: "pages array required" },
      { status: 400 }
    );
  }

  // Verify survey exists
  const survey = await prisma.survey.findUnique({ where: { id } });
  if (!survey) {
    return NextResponse.json({ error: "Survey not found" }, { status: 404 });
  }

  // Delete all existing pages (cascade deletes questions + options)
  await prisma.surveyPage.deleteMany({ where: { surveyId: id } });

  // Recalculate maxScore
  let maxScore = 0;

  // Create all pages with questions and options
  for (const page of pages) {
    await prisma.surveyPage.create({
      data: {
        surveyId: id,
        title: page.title || `Страница ${page.sortOrder + 1}`,
        sortOrder: page.sortOrder ?? 0,
        questions: {
          create: (page.questions || []).map(
            (q: Record<string, unknown>, qi: number) => {
              const mp = (q.maxPoints as number) || 0;
              maxScore += mp;
              return {
                fieldKey: q.fieldKey as string,
                label: q.label as string,
                description: (q.description as string) || null,
                type: q.type as string,
                required: q.required !== false,
                sortOrder: (q.sortOrder as number) ?? qi,
                config: (q.config as object) ?? undefined,
                scoringCategory: (q.scoringCategory as string) || null,
                maxPoints: mp,
                scoringRules: (q.scoringRules as object) ?? undefined,
                showIf: (q.showIf as object) ?? undefined,
                options: {
                  create: ((q.options as Array<Record<string, unknown>>) || []).map(
                    (o, oi: number) => ({
                      value: o.value as string,
                      label: o.label as string,
                      sortOrder: (o.sortOrder as number) ?? oi,
                      points: (o.points as number) || 0,
                    })
                  ),
                },
              };
            }
          ),
        },
      },
    });
  }

  // Update survey maxScore
  await prisma.survey.update({
    where: { id },
    data: { maxScore },
  });

  // Return updated survey
  const updated = await prisma.survey.findUnique({
    where: { id },
    include: {
      pages: {
        orderBy: { sortOrder: "asc" },
        include: {
          questions: {
            orderBy: { sortOrder: "asc" },
            include: { options: { orderBy: { sortOrder: "asc" } } },
          },
        },
      },
    },
  });

  return NextResponse.json({ survey: updated });
}
