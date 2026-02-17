import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string; rid: string }> };

// GET /api/admin/surveys/[id]/responses/[rid] — response detail
export async function GET(_req: NextRequest, ctx: Ctx) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rid } = await ctx.params;

  const response = await prisma.response.findUnique({
    where: { id: rid },
    include: {
      answers: {
        include: {
          question: {
            select: {
              fieldKey: true,
              label: true,
              type: true,
              scoringCategory: true,
              maxPoints: true,
            },
          },
          selectedOption: { select: { label: true, value: true } },
        },
        orderBy: { question: { sortOrder: "asc" } },
      },
      survey: { select: { title: true, maxScore: true, scoreTiers: true } },
    },
  });

  if (!response) {
    return NextResponse.json({ error: "Response not found" }, { status: 404 });
  }

  return NextResponse.json({ response });
}

// PATCH /api/admin/surveys/[id]/responses/[rid] — update status/notes
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rid } = await ctx.params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.status) data.status = body.status;
  if (body.adminNotes !== undefined) data.adminNotes = body.adminNotes;

  const response = await prisma.response.update({
    where: { id: rid },
    data,
  });

  return NextResponse.json({ response });
}
