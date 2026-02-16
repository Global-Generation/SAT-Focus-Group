import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateScore } from "@/lib/scoring";
import type { FormData } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body: FormData = await req.json();

    // Validate required fields
    if (
      !body.name?.trim() ||
      !body.telegramUsername?.trim() ||
      !body.age ||
      !body.city?.trim() ||
      !body.educationLevel ||
      !body.satTimeline ||
      body.hasTakenSat === "" ||
      !body.weeklyHours ||
      !body.whatYouLike?.trim() ||
      !body.whatFrustrates?.trim() ||
      !body.motivation?.trim() ||
      !body.sessionReadiness ||
      !body.availableDays?.length ||
      !body.availableTimes?.length ||
      !body.consentData ||
      !body.consentRecording
    ) {
      return NextResponse.json(
        { error: "Заполните все обязательные поля" },
        { status: 400 }
      );
    }

    // Normalize telegram username
    const username = body.telegramUsername.trim().toLowerCase();

    // Check for duplicate
    const existing = await prisma.submission.findUnique({
      where: { telegramUsername: username },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Заявка с таким Telegram уже существует. Вы уже подали заявку!" },
        { status: 409 }
      );
    }

    // Simple IP-based rate limiting (1 per hour)
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (ip !== "unknown") {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentFromIp = await prisma.submission.findFirst({
        where: { ipAddress: ip, createdAt: { gte: oneHourAgo } },
      });
      if (recentFromIp) {
        return NextResponse.json(
          { error: "Слишком много заявок. Попробуйте через час." },
          { status: 429 }
        );
      }
    }

    // Calculate score
    const scoring = calculateScore(body);

    // Save to DB
    const submission = await prisma.submission.create({
      data: {
        name: body.name.trim(),
        telegramUsername: username,
        age: Number(body.age),
        city: body.city.trim(),
        educationLevel: body.educationLevel,
        satTimeline: body.satTimeline,
        hasTakenSat: body.hasTakenSat === true,
        previousScore: body.previousScore ? Number(body.previousScore) : null,
        weeklyHours: body.weeklyHours,
        resources: body.resources,
        whatYouLike: body.whatYouLike.trim(),
        whatFrustrates: body.whatFrustrates.trim(),
        motivation: body.motivation.trim(),
        sessionReadiness: body.sessionReadiness,
        availableDays: body.availableDays,
        availableTimes: body.availableTimes,
        referralSource: body.referralSource || null,
        consentData: true,
        consentRecording: true,
        ipAddress: ip !== "unknown" ? ip : null,
        totalScore: scoring.totalScore,
        scoreBreakdown: JSON.parse(JSON.stringify(scoring.scoreBreakdown)),
        scorePercentage: scoring.scorePercentage,
      },
    });

    return NextResponse.json({ id: submission.id, score: scoring.totalScore });
  } catch (error) {
    console.error("Submit error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
