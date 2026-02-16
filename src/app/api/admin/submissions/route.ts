import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.searchParams;
  const status = url.get("status");
  const search = url.get("search");
  const sort = url.get("sort") || "score_desc";
  const page = parseInt(url.get("page") || "1");
  const limit = parseInt(url.get("limit") || "50");

  const where: Prisma.SubmissionWhereInput = {};

  if (status && status !== "ALL") {
    where.status = status as Prisma.SubmissionWhereInput["status"];
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { telegramUsername: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
    ];
  }

  let orderBy: Prisma.SubmissionOrderByWithRelationInput;
  switch (sort) {
    case "score_asc":
      orderBy = { totalScore: "asc" };
      break;
    case "date_desc":
      orderBy = { createdAt: "desc" };
      break;
    case "date_asc":
      orderBy = { createdAt: "asc" };
      break;
    default:
      orderBy = { totalScore: "desc" };
  }

  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        telegramUsername: true,
        totalScore: true,
        scorePercentage: true,
        city: true,
        satTimeline: true,
        status: true,
        createdAt: true,
        educationLevel: true,
      },
    }),
    prisma.submission.count({ where }),
  ]);

  return NextResponse.json({ submissions, total, page, limit });
}
