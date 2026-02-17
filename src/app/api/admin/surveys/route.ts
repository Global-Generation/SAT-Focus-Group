import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/surveys — list all surveys
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const surveys = await prisma.survey.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { responses: true, pages: true } },
    },
  });

  return NextResponse.json({ surveys });
}

// POST /api/admin/surveys — create new survey
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, slug, description } = body;

  if (!title || !slug) {
    return NextResponse.json(
      { error: "Title and slug are required" },
      { status: 400 }
    );
  }

  // Check slug uniqueness
  const existing = await prisma.survey.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json(
      { error: "Survey with this slug already exists" },
      { status: 409 }
    );
  }

  const survey = await prisma.survey.create({
    data: {
      title,
      slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      description: description || null,
    },
  });

  return NextResponse.json({ survey }, { status: 201 });
}
