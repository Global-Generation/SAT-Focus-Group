/**
 * Dynamic scoring engine — calculates scores using rules stored in the database.
 *
 * Scoring rule types (stored as JSON in Question.scoringRules):
 *   - "option_points"  — points come from QuestionOption.points (RADIO/BOOLEAN)
 *   - "count"          — tier-based by array length (CHECKBOX/CHIP_SELECT)
 *   - "textLength"     — tier-based by text length (TEXTAREA)
 *   - "range"          — tier-based by numeric value (NUMBER)
 *   - null/undefined   — points from QuestionOption.points (default for RADIO/BOOLEAN)
 */

interface Tier {
  min: number;
  points: number;
}

interface ScoringRules {
  type: "option_points" | "count" | "textLength" | "range";
  tiers?: Tier[];
}

interface QuestionWithOptions {
  id: string;
  fieldKey: string;
  type: string;
  scoringCategory: string | null;
  maxPoints: number;
  scoringRules: ScoringRules | null;
  options: { id: string; value: string; points: number }[];
}

interface AnswerData {
  questionId: string;
  textValue?: string | null;
  numberValue?: number | null;
  boolValue?: boolean | null;
  arrayValue?: string[];
  selectedOptionId?: string | null;
}

function scoreTier(value: number, tiers: Tier[]): number {
  // Sort tiers descending by min, return first match
  const sorted = [...tiers].sort((a, b) => b.min - a.min);
  for (const tier of sorted) {
    if (value >= tier.min) return tier.points;
  }
  return 0;
}

export function scoreAnswer(
  question: QuestionWithOptions,
  answer: AnswerData
): number {
  const rules = question.scoringRules;
  const maxPoints = question.maxPoints;

  if (maxPoints === 0) return 0;

  // Default: option_points (RADIO/BOOLEAN) — points from the selected option
  if (!rules || rules.type === "option_points") {
    if (answer.selectedOptionId) {
      const opt = question.options.find((o) => o.id === answer.selectedOptionId);
      return opt?.points ?? 0;
    }
    // For boolean, match by value
    if (answer.boolValue !== null && answer.boolValue !== undefined) {
      const val = answer.boolValue ? "true" : "false";
      const opt = question.options.find((o) => o.value === val);
      return opt?.points ?? 0;
    }
    return 0;
  }

  if (rules.type === "count" && rules.tiers) {
    const count = answer.arrayValue?.length ?? 0;
    return scoreTier(count, rules.tiers);
  }

  if (rules.type === "textLength" && rules.tiers) {
    const len = answer.textValue?.trim().length ?? 0;
    return scoreTier(len, rules.tiers);
  }

  if (rules.type === "range" && rules.tiers) {
    const val = answer.numberValue ?? 0;
    return scoreTier(val, rules.tiers);
  }

  return 0;
}

export interface ScoringResult {
  totalScore: number;
  scorePercentage: number;
  scoreBreakdown: Record<string, number>;
  answerPoints: Map<string, number>; // questionId -> points
}

export function calculateDynamicScore(
  questions: QuestionWithOptions[],
  answers: AnswerData[],
  maxScore: number
): ScoringResult {
  const answerMap = new Map<string, AnswerData>();
  for (const a of answers) {
    answerMap.set(a.questionId, a);
  }

  const breakdown: Record<string, number> = {};
  const answerPoints = new Map<string, number>();

  for (const q of questions) {
    const answer = answerMap.get(q.id);
    if (!answer) continue;

    const pts = scoreAnswer(q, answer);
    answerPoints.set(q.id, pts);

    if (q.scoringCategory) {
      breakdown[q.scoringCategory] = (breakdown[q.scoringCategory] || 0) + pts;
    }
  }

  const totalScore = Array.from(answerPoints.values()).reduce((s, p) => s + p, 0);
  const scorePercentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  return { totalScore, scorePercentage, scoreBreakdown: breakdown, answerPoints };
}
