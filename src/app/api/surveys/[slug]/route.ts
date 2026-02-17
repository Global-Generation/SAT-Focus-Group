import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ slug: string }> };

// GET /api/surveys/[slug] — public survey data (no scoring rules)
export async function GET(_req: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params;

  const survey = await prisma.survey.findUnique({
    where: { slug },
    include: {
      pages: {
        orderBy: { sortOrder: "asc" },
        include: {
          questions: {
            orderBy: { sortOrder: "asc" },
            select: {
              id: true,
              fieldKey: true,
              label: true,
              description: true,
              type: true,
              required: true,
              sortOrder: true,
              config: true,
              showIf: true,
              options: {
                orderBy: { sortOrder: "asc" },
                select: {
                  id: true,
                  value: true,
                  label: true,
                  sortOrder: true,
                  // points NOT included — no leaking scoring
                },
              },
            },
          },
        },
      },
    },
  });

  if (!survey || survey.status !== "ACTIVE") {
    return NextResponse.json({ error: "Survey not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: survey.id,
    slug: survey.slug,
    title: survey.title,
    description: survey.description,
    heroTitle: survey.heroTitle,
    ndaText: survey.ndaText,
    successMessage: survey.successMessage,
    dedupFieldKey: survey.dedupFieldKey,
    pages: survey.pages,
  });
}
