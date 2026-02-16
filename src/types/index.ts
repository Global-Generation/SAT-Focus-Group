export interface FormData {
  // Step 1: About you
  name: string;
  telegramUsername: string;
  age: number | "";
  city: string;
  educationLevel: string;

  // Step 2: SAT & Preparation
  satTimeline: string;
  hasTakenSat: boolean | "";
  previousScore: number | "";
  weeklyHours: string;
  resources: string[];
  platformUsage: string;

  // Step 3: Product Experience
  featuresUsed: string[];
  whatYouLike: string;
  whatFrustrates: string;

  // Step 4: Readiness
  motivation: string;
  sessionReadiness: string;
  availableDays: string[];
  availableTimes: string[];

  // Step 5: Confirmation
  referralSource: string;
  consentData: boolean;
  consentRecording: boolean;
}

export const INITIAL_FORM_DATA: FormData = {
  name: "",
  telegramUsername: "",
  age: "",
  city: "",
  educationLevel: "",
  satTimeline: "",
  hasTakenSat: "",
  previousScore: "",
  weeklyHours: "",
  resources: [],
  platformUsage: "",
  featuresUsed: [],
  whatYouLike: "",
  whatFrustrates: "",
  motivation: "",
  sessionReadiness: "",
  availableDays: [],
  availableTimes: [],
  referralSource: "",
  consentData: false,
  consentRecording: false,
};

export interface ScoreBreakdown {
  timeline: number;
  hasTakenSat: number;
  previousScore: number;
  weeklyHours: number;
  resources: number;
  platformUsage: number;
  featuresUsed: number;
  whatYouLike: number;
  whatFrustrates: number;
  motivation: number;
  sessionReadiness: number;
  availableDays: number;
  availableTimes: number;
}

export interface ScoringResult {
  totalScore: number;
  scorePercentage: number;
  scoreBreakdown: ScoreBreakdown;
}

export type SubmissionStatus =
  | "PENDING"
  | "SHORTLISTED"
  | "SELECTED"
  | "REJECTED"
  | "CONTACTED";

export const EDUCATION_LEVELS = [
  { value: "9_class", label: "9 класс" },
  { value: "10_class", label: "10 класс" },
  { value: "11_class", label: "11 класс" },
  { value: "gap_year", label: "Gap Year" },
  { value: "1_course", label: "1 курс" },
];

export const SAT_TIMELINES = [
  { value: "already_taken", label: "Уже сдавал(а)" },
  { value: "next_3_months", label: "В ближайшие 3 месяца" },
  { value: "next_6_months", label: "В ближайшие 6 месяцев" },
  { value: "6_to_12", label: "Через 6-12 месяцев" },
  { value: "undecided", label: "Ещё не определился" },
];

export const WEEKLY_HOURS = [
  { value: "less_than_1", label: "Менее 1 часа" },
  { value: "1_to_3", label: "1-3 часа" },
  { value: "3_to_7", label: "3-7 часов" },
  { value: "7_to_14", label: "7-14 часов" },
  { value: "more_than_14", label: "Более 14 часов" },
];

export const RESOURCES = [
  { value: "khan_academy", label: "Khan Academy" },
  { value: "college_board", label: "College Board" },
  { value: "youtube", label: "YouTube" },
  { value: "tutor", label: "Репетитор" },
  { value: "prep_course", label: "Курсы подготовки" },
  { value: "books", label: "Учебники/книги" },
  { value: "our_platform", label: "Наша платформа" },
  { value: "other", label: "Другое" },
];

export const PLATFORM_USAGE = [
  { value: "active", label: "Да, активно пользуюсь" },
  { value: "sometimes", label: "Иногда заходу" },
  { value: "know_but_no", label: "Знаю, но не пользуюсь" },
  { value: "never_heard", label: "Не слышал(а)" },
];

export const FEATURES = [
  { value: "practice_tests", label: "Пробные тесты" },
  { value: "question_bank", label: "Банк вопросов" },
  { value: "analytics", label: "Аналитика прогресса" },
  { value: "ai_tutor", label: "AI репетитор" },
  { value: "essay_game", label: "Essay Game" },
  { value: "study_materials", label: "Учебные материалы" },
  { value: "none", label: "Не пользовался(ась)" },
];

export const SESSION_READINESS = [
  { value: "definitely", label: "Да, готов(а)!" },
  { value: "probably", label: "Скорее да" },
  { value: "maybe", label: "Возможно" },
  { value: "not_sure", label: "Не уверен(а)" },
];

export const DAYS = [
  { value: "mon", label: "Пн" },
  { value: "tue", label: "Вт" },
  { value: "wed", label: "Ср" },
  { value: "thu", label: "Чт" },
  { value: "fri", label: "Пт" },
  { value: "sat", label: "Сб" },
  { value: "sun", label: "Вс" },
];

export const TIMES = [
  { value: "morning", label: "Утро (9-12)" },
  { value: "afternoon", label: "День (12-17)" },
  { value: "evening", label: "Вечер (17-21)" },
];

export const REFERRAL_SOURCES = [
  { value: "telegram_group", label: "Телеграм-группа" },
  { value: "friend", label: "От друга" },
  { value: "social_media", label: "Соцсети" },
  { value: "search", label: "Поиск в интернете" },
  { value: "other", label: "Другое" },
];
