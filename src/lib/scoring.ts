import type { FormData, ScoreBreakdown, ScoringResult } from "@/types";

const MAX_SCORE = 105;

function scoreTimeline(value: string): number {
  const map: Record<string, number> = {
    next_3_months: 20,
    already_taken: 18,
    next_6_months: 15,
    "6_to_12": 8,
    undecided: 3,
  };
  return map[value] ?? 0;
}

function scoreHasTakenSat(value: boolean): number {
  return value ? 5 : 0;
}

function scorePreviousScore(hasTaken: boolean, score: number | ""): number {
  if (!hasTaken || score === "") return 0;
  const n = Number(score);
  if (n >= 1400) return 10;
  if (n >= 1200) return 8;
  if (n >= 1000) return 6;
  if (n >= 800) return 4;
  return 2;
}

function scoreWeeklyHours(value: string): number {
  const map: Record<string, number> = {
    "3_to_7": 15,
    "7_to_14": 13,
    more_than_14: 10,
    "1_to_3": 8,
    less_than_1: 3,
  };
  return map[value] ?? 0;
}

function scoreResources(values: string[]): number {
  if (values.length === 0) return 0;
  if (values.length >= 4) return 10;
  if (values.length >= 3) return 8;
  if (values.length >= 2) return 5;
  return 3;
}

function scoreTextQuality(text: string, maxPoints: number): number {
  const len = text.trim().length;
  if (len >= 200) return maxPoints;
  if (len >= 100) return Math.round(maxPoints * 0.8);
  if (len >= 50) return Math.round(maxPoints * 0.5);
  if (len >= 20) return Math.round(maxPoints * 0.3);
  return 0;
}

function scoreMotivation(text: string): number {
  return scoreTextQuality(text, 15);
}

function scoreSessionReadiness(value: string): number {
  const map: Record<string, number> = {
    definitely: 10,
    probably: 7,
    maybe: 4,
    not_sure: 1,
  };
  return map[value] ?? 0;
}

function scoreAvailableDays(days: string[]): number {
  if (days.length >= 5) return 5;
  if (days.length >= 3) return 4;
  if (days.length >= 1) return 2;
  return 0;
}

function scoreAvailableTimes(times: string[]): number {
  if (times.length >= 3) return 5;
  if (times.length >= 2) return 4;
  if (times.length >= 1) return 2;
  return 0;
}

export function calculateScore(data: FormData): ScoringResult {
  const breakdown: ScoreBreakdown = {
    timeline: scoreTimeline(data.satTimeline),
    hasTakenSat: scoreHasTakenSat(data.hasTakenSat === true),
    previousScore: scorePreviousScore(
      data.hasTakenSat === true,
      data.previousScore
    ),
    weeklyHours: scoreWeeklyHours(data.weeklyHours),
    resources: scoreResources(data.resources),
    whatYouLike: scoreTextQuality(data.whatYouLike, 5),
    whatFrustrates: scoreTextQuality(data.whatFrustrates, 5),
    motivation: scoreMotivation(data.motivation),
    sessionReadiness: scoreSessionReadiness(data.sessionReadiness),
    availableDays: scoreAvailableDays(data.availableDays),
    availableTimes: scoreAvailableTimes(data.availableTimes),
  };

  const totalScore = Object.values(breakdown).reduce((sum, v) => sum + v, 0);
  const scorePercentage = Math.round((totalScore / MAX_SCORE) * 100);

  return { totalScore, scorePercentage, scoreBreakdown: breakdown };
}

export function getScoreTier(score: number) {
  if (score >= 80) return { label: "Отличный кандидат", class: "score-excellent" };
  if (score >= 55) return { label: "Хороший кандидат", class: "score-good" };
  if (score >= 30) return { label: "Средний кандидат", class: "score-medium" };
  return { label: "Низкий приоритет", class: "score-low" };
}

export const SCORE_LABELS: Record<keyof ScoreBreakdown, { label: string; max: number }> = {
  timeline: { label: "Когда сдаёте SAT", max: 20 },
  hasTakenSat: { label: "Сдавали раньше", max: 5 },
  previousScore: { label: "Предыдущий балл", max: 10 },
  weeklyHours: { label: "Часов в неделю", max: 15 },
  resources: { label: "Ресурсы подготовки", max: 10 },
  whatYouLike: { label: "Что нравится", max: 5 },
  whatFrustrates: { label: "Что расстраивает", max: 5 },
  motivation: { label: "Мотивация", max: 15 },
  sessionReadiness: { label: "Готовность к сессии", max: 10 },
  availableDays: { label: "Доступные дни", max: 5 },
  availableTimes: { label: "Доступное время", max: 5 },
};
