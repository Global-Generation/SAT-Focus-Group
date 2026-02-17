import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/admin/surveys/[id] — full survey structure
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
          questions: {
            orderBy: { sortOrder: "asc" },
            include: {
              options: { orderBy: { sortOrder: "asc" } },
            },
          },
        },
      },
      _count: { select: { responses: true } },
    },
  });

  if (!survey) {
    return NextResponse.json({ error: "Survey not found" }, { status: 404 });
  }

  return NextResponse.json({ survey });
}

// PUT /api/admin/surveys/[id] — update survey settings
export async function PUT(req: NextRequest, ctx: Ctx) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = await req.json();

  const survey = await prisma.survey.update({
    where: { id },
    data: {
      title: body.title,
      slug: body.slug,
      description: body.description ?? null,
      heroTitle: body.heroTitle ?? null,
      ndaText: body.ndaText ?? null,
      successMessage: body.successMessage ?? null,
      maxScore: body.maxScore ?? 0,
      scoreTiers: body.scoreTiers ?? null,
      dedupFieldKey: body.dedupFieldKey ?? null,
    },
  });

  return NextResponse.json({ survey });
}

// DELETE /api/admin/surveys/[id] — archive survey
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  await prisma.survey.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });

  return NextResponse.json({ ok: true });
}
