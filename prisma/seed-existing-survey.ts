import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding SAT survey...");

  // Check if already seeded
  const existing = await prisma.survey.findUnique({ where: { slug: "sat" } });
  if (existing) {
    console.log("SAT survey already exists, skipping creation");
    await backfillResponses(existing.id);
    return;
  }

  const survey = await prisma.survey.create({
    data: {
      slug: "sat",
      title: "SAT Фокус-группа",
      description: "Опрос для участия в фокус-группе по подготовке к SAT",
      status: "ACTIVE",
      heroTitle: "Приглашаем вас стать частью эксклюзивной фокус-группы по подготовке к SAT!",
      ndaText: `Данная информация предоставлена исключительно в целях участия в фокус-группе.\n\nВся информация, полученная в рамках данной фокус-группы, является конфиденциальной.\n\nУчастники обязуются не разглашать детали обсуждений третьим лицам.`,
      successMessage: "Спасибо за участие в нашем опросе! Мы свяжемся с вами в Telegram для подтверждения участия в фокус-группе.",
      maxScore: 105,
      dedupFieldKey: "telegramUsername",
      scoreTiers: [
        { label: "Отличный", min: 80 },
        { label: "Хороший", min: 55 },
        { label: "Средний", min: 30 },
        { label: "Низкий", min: 0 },
      ],
      pages: {
        create: [
          // ─── Page 1: О себе ───
          {
            title: "О себе",
            sortOrder: 0,
            questions: {
              create: [
                {
                  fieldKey: "name",
                  label: "Имя",
                  type: "TEXT",
                  required: true,
                  sortOrder: 0,
                  maxPoints: 0,
                },
                {
                  fieldKey: "telegramUsername",
                  label: "Telegram",
                  description: "Ваш юзернейм в Telegram (начинается с @)",
                  type: "TEXT",
                  required: true,
                  sortOrder: 1,
                  config: { prefix: "@" },
                  maxPoints: 0,
                },
                {
                  fieldKey: "age",
                  label: "Возраст",
                  type: "NUMBER",
                  required: true,
                  sortOrder: 2,
                  config: { min: 14, max: 25 },
                  maxPoints: 0,
                },
                {
                  fieldKey: "city",
                  label: "Город",
                  type: "TEXT",
                  required: true,
                  sortOrder: 3,
                  maxPoints: 0,
                },
                {
                  fieldKey: "educationLevel",
                  label: "Уровень образования",
                  type: "RADIO",
                  required: true,
                  sortOrder: 4,
                  config: { layout: "grid" },
                  maxPoints: 0,
                  options: {
                    create: [
                      { value: "9_class", label: "9 класс", sortOrder: 0, points: 0 },
                      { value: "10_class", label: "10 класс", sortOrder: 1, points: 0 },
                      { value: "11_class", label: "11 класс", sortOrder: 2, points: 0 },
                      { value: "gap_year", label: "Gap Year", sortOrder: 3, points: 0 },
                      { value: "1_course", label: "1 курс", sortOrder: 4, points: 0 },
                    ],
                  },
                },
              ],
            },
          },
          // ─── Page 2: SAT и подготовка ───
          {
            title: "SAT и подготовка",
            sortOrder: 1,
            questions: {
              create: [
                {
                  fieldKey: "satTimeline",
                  label: "Когда вы планируете сдавать SAT?",
                  type: "RADIO",
                  required: true,
                  sortOrder: 0,
                  scoringCategory: "timeline",
                  maxPoints: 20,
                  options: {
                    create: [
                      { value: "already_taken", label: "Уже сдавал(а)", sortOrder: 0, points: 18 },
                      { value: "next_3_months", label: "В ближайшие 3 месяца", sortOrder: 1, points: 20 },
                      { value: "next_6_months", label: "В ближайшие 6 месяцев", sortOrder: 2, points: 15 },
                      { value: "6_to_12", label: "Через 6-12 месяцев", sortOrder: 3, points: 8 },
                      { value: "undecided", label: "Ещё не определился", sortOrder: 4, points: 3 },
                    ],
                  },
                },
                {
                  fieldKey: "hasTakenSat",
                  label: "Вы уже сдавали SAT?",
                  type: "BOOLEAN",
                  required: true,
                  sortOrder: 1,
                  scoringCategory: "hasTakenSat",
                  maxPoints: 5,
                  options: {
                    create: [
                      { value: "true", label: "Да", sortOrder: 0, points: 5 },
                      { value: "false", label: "Нет", sortOrder: 1, points: 0 },
                    ],
                  },
                },
                {
                  fieldKey: "previousScore",
                  label: "Ваш предыдущий балл SAT",
                  type: "NUMBER",
                  required: false,
                  sortOrder: 2,
                  config: { min: 400, max: 1600 },
                  scoringCategory: "previousScore",
                  maxPoints: 10,
                  showIf: { fieldKey: "hasTakenSat", value: true },
                  scoringRules: {
                    type: "range",
                    tiers: [
                      { min: 1400, points: 10 },
                      { min: 1200, points: 8 },
                      { min: 1000, points: 6 },
                      { min: 800, points: 4 },
                      { min: 0, points: 2 },
                    ],
                  },
                },
                {
                  fieldKey: "weeklyHours",
                  label: "Сколько часов в неделю вы готовы заниматься?",
                  type: "RADIO",
                  required: true,
                  sortOrder: 3,
                  scoringCategory: "weeklyHours",
                  maxPoints: 15,
                  options: {
                    create: [
                      { value: "less_than_1", label: "Менее 1 часа", sortOrder: 0, points: 3 },
                      { value: "1_to_3", label: "1-3 часа", sortOrder: 1, points: 8 },
                      { value: "3_to_7", label: "3-7 часов", sortOrder: 2, points: 15 },
                      { value: "7_to_14", label: "7-14 часов", sortOrder: 3, points: 13 },
                      { value: "more_than_14", label: "Более 14 часов", sortOrder: 4, points: 10 },
                    ],
                  },
                },
                {
                  fieldKey: "resources",
                  label: "Какие ресурсы вы используете для подготовки?",
                  type: "CHECKBOX",
                  required: true,
                  sortOrder: 4,
                  scoringCategory: "resources",
                  maxPoints: 10,
                  scoringRules: {
                    type: "count",
                    tiers: [
                      { min: 4, points: 10 },
                      { min: 3, points: 8 },
                      { min: 2, points: 5 },
                      { min: 1, points: 3 },
                    ],
                  },
                  options: {
                    create: [
                      { value: "khan_academy", label: "Khan Academy", sortOrder: 0, points: 0 },
                      { value: "college_board", label: "College Board", sortOrder: 1, points: 0 },
                      { value: "youtube", label: "YouTube", sortOrder: 2, points: 0 },
                      { value: "tutor", label: "Репетитор", sortOrder: 3, points: 0 },
                      { value: "prep_course", label: "Курсы подготовки", sortOrder: 4, points: 0 },
                      { value: "books", label: "Учебники/книги", sortOrder: 5, points: 0 },
                      { value: "other", label: "Другое", sortOrder: 6, points: 0 },
                    ],
                  },
                },
              ],
            },
          },
          // ─── Page 3: Опыт ───
          {
            title: "Ваш опыт",
            sortOrder: 2,
            questions: {
              create: [
                {
                  fieldKey: "whatYouLike",
                  label: "Что вам нравится в подготовке к SAT?",
                  description: "Расскажите подробнее (от 200 символов для максимального балла)",
                  type: "TEXTAREA",
                  required: true,
                  sortOrder: 0,
                  scoringCategory: "whatYouLike",
                  maxPoints: 5,
                  scoringRules: {
                    type: "textLength",
                    tiers: [
                      { min: 200, points: 5 },
                      { min: 100, points: 4 },
                      { min: 50, points: 2.5 },
                      { min: 20, points: 1.5 },
                    ],
                  },
                },
                {
                  fieldKey: "whatFrustrates",
                  label: "Что вас расстраивает или не устраивает в подготовке?",
                  description: "Расскажите подробнее (от 200 символов для максимального балла)",
                  type: "TEXTAREA",
                  required: true,
                  sortOrder: 1,
                  scoringCategory: "whatFrustrates",
                  maxPoints: 5,
                  scoringRules: {
                    type: "textLength",
                    tiers: [
                      { min: 200, points: 5 },
                      { min: 100, points: 4 },
                      { min: 50, points: 2.5 },
                      { min: 20, points: 1.5 },
                    ],
                  },
                },
              ],
            },
          },
          // ─── Page 4: Готовность ───
          {
            title: "Готовность",
            sortOrder: 3,
            questions: {
              create: [
                {
                  fieldKey: "motivation",
                  label: "Почему вы хотите участвовать в фокус-группе?",
                  description: "Расскажите о вашей мотивации (от 200 символов для максимального балла)",
                  type: "TEXTAREA",
                  required: true,
                  sortOrder: 0,
                  scoringCategory: "motivation",
                  maxPoints: 15,
                  scoringRules: {
                    type: "textLength",
                    tiers: [
                      { min: 200, points: 15 },
                      { min: 100, points: 12 },
                      { min: 50, points: 7.5 },
                      { min: 20, points: 4.5 },
                    ],
                  },
                },
                {
                  fieldKey: "sessionReadiness",
                  label: "Готовы ли вы участвовать в 30-минутной онлайн-сессии?",
                  type: "RADIO",
                  required: true,
                  sortOrder: 1,
                  scoringCategory: "sessionReadiness",
                  maxPoints: 10,
                  options: {
                    create: [
                      { value: "definitely", label: "Да, готов(а)!", sortOrder: 0, points: 10 },
                      { value: "probably", label: "Скорее да", sortOrder: 1, points: 7 },
                      { value: "maybe", label: "Возможно", sortOrder: 2, points: 4 },
                      { value: "not_sure", label: "Не уверен(а)", sortOrder: 3, points: 1 },
                    ],
                  },
                },
                {
                  fieldKey: "availableDays",
                  label: "В какие дни вам удобно?",
                  type: "CHIP_SELECT",
                  required: true,
                  sortOrder: 2,
                  scoringCategory: "availableDays",
                  maxPoints: 5,
                  scoringRules: {
                    type: "count",
                    tiers: [
                      { min: 5, points: 5 },
                      { min: 3, points: 4 },
                      { min: 1, points: 2 },
                    ],
                  },
                  options: {
                    create: [
                      { value: "mon", label: "Пн", sortOrder: 0, points: 0 },
                      { value: "tue", label: "Вт", sortOrder: 1, points: 0 },
                      { value: "wed", label: "Ср", sortOrder: 2, points: 0 },
                      { value: "thu", label: "Чт", sortOrder: 3, points: 0 },
                      { value: "fri", label: "Пт", sortOrder: 4, points: 0 },
                      { value: "sat", label: "Сб", sortOrder: 5, points: 0 },
                      { value: "sun", label: "Вс", sortOrder: 6, points: 0 },
                    ],
                  },
                },
                {
                  fieldKey: "availableTimes",
                  label: "В какое время вам удобно?",
                  type: "CHIP_SELECT",
                  required: true,
                  sortOrder: 3,
                  scoringCategory: "availableTimes",
                  maxPoints: 5,
                  scoringRules: {
                    type: "count",
                    tiers: [
                      { min: 3, points: 5 },
                      { min: 2, points: 4 },
                      { min: 1, points: 2 },
                    ],
                  },
                  options: {
                    create: [
                      { value: "morning", label: "Утро (9-12)", sortOrder: 0, points: 0 },
                      { value: "afternoon", label: "День (12-17)", sortOrder: 1, points: 0 },
                      { value: "evening", label: "Вечер (17-21)", sortOrder: 2, points: 0 },
                    ],
                  },
                },
              ],
            },
          },
          // ─── Page 5: Подтверждение ───
          {
            title: "Подтверждение",
            sortOrder: 4,
            questions: {
              create: [
                {
                  fieldKey: "consentData",
                  label: "Я согласен(на) на обработку персональных данных",
                  description: "Ваши данные будут использованы только для организации фокус-группы",
                  type: "CONSENT",
                  required: true,
                  sortOrder: 0,
                  maxPoints: 0,
                },
                {
                  fieldKey: "consentRecording",
                  label: "Я согласен(на) на запись сессии",
                  description: "Запись будет использоваться только для внутренних целей команды",
                  type: "CONSENT",
                  required: true,
                  sortOrder: 1,
                  maxPoints: 0,
                },
                {
                  fieldKey: "referralSource",
                  label: "Откуда вы узнали о нас?",
                  type: "RADIO",
                  required: false,
                  sortOrder: 2,
                  config: { layout: "grid" },
                  maxPoints: 0,
                  options: {
                    create: [
                      { value: "telegram_group", label: "Телеграм-группа", sortOrder: 0, points: 0 },
                      { value: "friend", label: "От друга", sortOrder: 1, points: 0 },
                      { value: "social_media", label: "Соцсети", sortOrder: 2, points: 0 },
                      { value: "search", label: "Поиск в интернете", sortOrder: 3, points: 0 },
                      { value: "other", label: "Другое", sortOrder: 4, points: 0 },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`Created SAT survey: ${survey.id}`);
  await backfillResponses(survey.id);
}

async function backfillResponses(surveyId: string) {
  // Check if already backfilled
  const existingResponses = await prisma.response.count({ where: { surveyId } });
  if (existingResponses > 0) {
    console.log(`Already have ${existingResponses} responses, skipping backfill`);
    return;
  }

  // Get all submissions
  const submissions = await prisma.submission.findMany();
  if (submissions.length === 0) {
    console.log("No submissions to backfill");
    return;
  }

  console.log(`Backfilling ${submissions.length} submissions...`);

  // Get questions map by fieldKey
  const questions = await prisma.question.findMany({
    where: { page: { surveyId } },
    include: { options: true },
  });
  const qMap = new Map(questions.map((q) => [q.fieldKey, q]));

  for (const sub of submissions) {
    const answers: Array<{
      questionId: string;
      textValue?: string | null;
      numberValue?: number | null;
      boolValue?: boolean | null;
      arrayValue?: string[];
      selectedOptionId?: string | null;
      points: number;
    }> = [];

    const breakdown = sub.scoreBreakdown as Record<string, number>;

    // Map each field to answer
    const fieldMap: Record<string, unknown> = {
      name: sub.name,
      telegramUsername: sub.telegramUsername,
      age: sub.age,
      city: sub.city,
      educationLevel: sub.educationLevel,
      satTimeline: sub.satTimeline,
      hasTakenSat: sub.hasTakenSat,
      previousScore: sub.previousScore,
      weeklyHours: sub.weeklyHours,
      resources: sub.resources,
      whatYouLike: sub.whatYouLike,
      whatFrustrates: sub.whatFrustrates,
      motivation: sub.motivation,
      sessionReadiness: sub.sessionReadiness,
      availableDays: sub.availableDays,
      availableTimes: sub.availableTimes,
      consentData: sub.consentData,
      consentRecording: sub.consentRecording,
      referralSource: sub.referralSource,
    };

    for (const [fieldKey, value] of Object.entries(fieldMap)) {
      const q = qMap.get(fieldKey);
      if (!q) continue;

      const points = breakdown?.[q.scoringCategory || ""] || 0;
      const ans: (typeof answers)[0] = { questionId: q.id, points };

      switch (q.type) {
        case "TEXT":
          ans.textValue = String(value || "");
          break;
        case "TEXTAREA":
          ans.textValue = String(value || "");
          break;
        case "NUMBER":
          ans.numberValue = value ? Number(value) : null;
          break;
        case "BOOLEAN":
          ans.boolValue = Boolean(value);
          // Find matching option
          const boolOpt = q.options.find((o) => o.value === String(value));
          if (boolOpt) ans.selectedOptionId = boolOpt.id;
          break;
        case "RADIO":
          ans.textValue = String(value || "");
          const radioOpt = q.options.find((o) => o.value === String(value));
          if (radioOpt) ans.selectedOptionId = radioOpt.id;
          break;
        case "CHECKBOX":
        case "CHIP_SELECT":
          ans.arrayValue = Array.isArray(value) ? value : [];
          break;
        case "CONSENT":
          ans.boolValue = Boolean(value);
          break;
      }

      answers.push(ans);
    }

    await prisma.response.create({
      data: {
        surveyId,
        totalScore: sub.totalScore,
        scorePercentage: sub.scorePercentage,
        scoreBreakdown: sub.scoreBreakdown || {},
        status: sub.status as "PENDING" | "SHORTLISTED" | "SELECTED" | "REJECTED" | "CONTACTED",
        adminNotes: sub.adminNotes,
        ipAddress: sub.ipAddress,
        createdAt: sub.createdAt,
        answers: { create: answers },
      },
    });
  }

  console.log(`Backfilled ${submissions.length} responses`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
