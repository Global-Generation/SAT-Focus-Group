import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateDynamicScore } from "@/lib/dynamic-scoring";

type Ctx = { params: Promise<{ slug: string }> };

// Rate limit map: IP -> timestamp
const rateLimitMap = new Map<string, number>();

// POST /api/surveys/[slug]/submit
export async function POST(req: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params;

  // Rate limiting
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const lastSubmit = rateLimitMap.get(ip);
  if (lastSubmit && Date.now() - lastSubmit < 3600000) {
    return NextResponse.json(
      { error: "Пожалуйста, подождите перед повторной отправкой" },
      { status: 429 }
    );
  }

  // Load survey with full structure
  const survey = await prisma.survey.findUnique({
    where: { slug },
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

  if (!survey || survey.status !== "ACTIVE") {
    return NextResponse.json({ error: "Survey not found" }, { status: 404 });
  }

  const body = await req.json();
  const { answers: submittedAnswers } = body;

  if (!submittedAnswers || typeof submittedAnswers !== "object") {
    return NextResponse.json({ error: "answers object required" }, { status: 400 });
  }

  const allQuestions = survey.pages.flatMap((p) => p.questions);

  // Dedup check
  if (survey.dedupFieldKey) {
    const dedupQuestion = allQuestions.find(
      (q) => q.fieldKey === survey.dedupFieldKey
    );
    if (dedupQuestion) {
      const dedupValue = submittedAnswers[dedupQuestion.fieldKey];
      if (dedupValue) {
        const existing = await prisma.answer.findFirst({
          where: {
            questionId: dedupQuestion.id,
            textValue: String(dedupValue),
            response: { surveyId: survey.id },
          },
        });
        if (existing) {
          return NextResponse.json(
            { error: "Вы уже заполняли этот опрос" },
            { status: 409 }
          );
        }
      }
    }
  }

  // Validate required fields
  for (const q of allQuestions) {
    if (!q.required) continue;
    const val = submittedAnswers[q.fieldKey];
    // Check showIf condition — skip validation if question is hidden
    if (q.showIf) {
      const cond = q.showIf as { fieldKey: string; value: unknown };
      const condVal = submittedAnswers[cond.fieldKey];
      if (condVal !== cond.value) continue;
    }
    if (val === undefined || val === null || val === "") {
      return NextResponse.json(
        { error: `Поле "${q.label}" обязательно` },
        { status: 400 }
      );
    }
  }

  // Build AnswerData array for scoring engine
  const answerDataForScoring = allQuestions.map((q) => {
    const val = submittedAnswers[q.fieldKey];
    const data: {
      questionId: string;
      textValue?: string | null;
      numberValue?: number | null;
      boolValue?: boolean | null;
      arrayValue?: string[];
      selectedOptionId?: string | null;
    } = { questionId: q.id };

    if (q.type === "TEXT" || q.type === "TEXTAREA") {
      data.textValue = String(val || "");
    } else if (q.type === "NUMBER") {
      data.numberValue = val ? parseFloat(val) : null;
    } else if (q.type === "BOOLEAN") {
      data.boolValue = Boolean(val);
      const opt = q.options.find((o) => o.value === String(val));
      if (opt) data.selectedOptionId = opt.id;
    } else if (q.type === "RADIO") {
      data.textValue = String(val || "");
      const opt = q.options.find((o) => o.value === String(val));
      if (opt) data.selectedOptionId = opt.id;
    } else if (q.type === "CHECKBOX" || q.type === "CHIP_SELECT") {
      data.arrayValue = Array.isArray(val) ? val : [];
    } else if (q.type === "CONSENT") {
      data.boolValue = Boolean(val);
    }

    return data;
  });

  // Calculate score
  const scoreResult = calculateDynamicScore(
    allQuestions.map((q) => ({
      id: q.id,
      fieldKey: q.fieldKey,
      type: q.type,
      scoringCategory: q.scoringCategory,
      maxPoints: q.maxPoints,
      scoringRules: q.scoringRules as { type: "option_points" | "count" | "textLength" | "range"; tiers?: { min: number; points: number }[] } | null,
      options: q.options.map((o) => ({ id: o.id, value: o.value, points: o.points })),
    })),
    answerDataForScoring,
    survey.maxScore
  );

  // Create response with answers
  const createAnswers = allQuestions.map((q) => {
    const val = submittedAnswers[q.fieldKey];
    const pts = scoreResult.answerPoints.get(q.id) || 0;

    const ans: {
      questionId: string;
      points: number;
      textValue?: string;
      numberValue?: number;
      boolValue?: boolean;
      arrayValue?: string[];
      selectedOptionId?: string;
    } = { questionId: q.id, points: pts };

    if (q.type === "TEXT" || q.type === "TEXTAREA") {
      ans.textValue = String(val || "");
    } else if (q.type === "NUMBER") {
      ans.numberValue = val ? parseFloat(val) : undefined;
    } else if (q.type === "BOOLEAN") {
      ans.boolValue = Boolean(val);
    } else if (q.type === "RADIO") {
      ans.textValue = String(val || "");
      const opt = q.options.find((o) => o.value === String(val));
      if (opt) ans.selectedOptionId = opt.id;
    } else if (q.type === "CHECKBOX" || q.type === "CHIP_SELECT") {
      ans.arrayValue = Array.isArray(val) ? val : [];
    } else if (q.type === "CONSENT") {
      ans.boolValue = Boolean(val);
    }

    return ans;
  });

  const response = await prisma.response.create({
    data: {
      surveyId: survey.id,
      totalScore: scoreResult.totalScore,
      scorePercentage: scoreResult.scorePercentage,
      scoreBreakdown: scoreResult.scoreBreakdown,
      ipAddress: ip,
      answers: { create: createAnswers },
    },
  });

  rateLimitMap.set(ip, Date.now());

  return NextResponse.json({
    id: response.id,
    score: response.totalScore,
    percentage: response.scorePercentage,
  });
}
