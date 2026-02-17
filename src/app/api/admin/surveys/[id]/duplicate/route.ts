import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

// POST /api/admin/surveys/[id]/duplicate — deep clone survey
export async function POST(_req: NextRequest, ctx: Ctx) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  const source = await prisma.survey.findUnique({
    where: { id },
    include: {
      pages: {
        include: {
          questions: {
            include: { options: true },
          },
        },
      },
    },
  });

  if (!source) {
    return NextResponse.json({ error: "Survey not found" }, { status: 404 });
  }

  // Find unique slug
  let newSlug = `${source.slug}-copy`;
  let attempt = 0;
  while (await prisma.survey.findUnique({ where: { slug: newSlug } })) {
    attempt++;
    newSlug = `${source.slug}-copy-${attempt}`;
  }

  const survey = await prisma.survey.create({
    data: {
      title: `${source.title} (копия)`,
      slug: newSlug,
      description: source.description,
      heroTitle: source.heroTitle,
      ndaText: source.ndaText,
      successMessage: source.successMessage,
      maxScore: source.maxScore,
      scoreTiers: source.scoreTiers ?? undefined,
      dedupFieldKey: source.dedupFieldKey,
      status: "DRAFT",
      pages: {
        create: source.pages.map((page) => ({
          title: page.title,
          sortOrder: page.sortOrder,
          questions: {
            create: page.questions.map((q) => ({
              fieldKey: q.fieldKey,
              label: q.label,
              description: q.description,
              type: q.type,
              required: q.required,
              sortOrder: q.sortOrder,
              config: q.config ?? undefined,
              scoringCategory: q.scoringCategory,
              maxPoints: q.maxPoints,
              scoringRules: q.scoringRules ?? undefined,
              showIf: q.showIf ?? undefined,
              options: {
                create: q.options.map((o) => ({
                  value: o.value,
                  label: o.label,
                  sortOrder: o.sortOrder,
                  points: o.points,
                })),
              },
            })),
          },
        })),
      },
    },
    include: { _count: { select: { responses: true, pages: true } } },
  });

  return NextResponse.json({ survey }, { status: 201 });
}
