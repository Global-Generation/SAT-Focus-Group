# GG-Surveys

Universal survey & recruitment platform for Global Generation. Currently powers the **SAT Focus Group** intake — a 5-step scored form that collects candidate data, auto-scores responses, and provides an admin dashboard for review and export.

**Live URL**: `http://ec2-18-211-149-64.compute-1.amazonaws.com/focus-group`
**Admin Panel**: `http://ec2-18-211-149-64.compute-1.amazonaws.com/focus-group/admin`
**Admin Password**: from `ADMIN_PASSWORD` env var (default: `focusgroup2026`)

---

## Architecture

```
Next.js 16 (App Router)
├── React 19 + TypeScript 5.9
├── Tailwind CSS 4 + shadcn/ui + Radix UI
├── Prisma 6 (ORM) + Neon serverless adapter
└── Neon PostgreSQL (database)

Deployment:
  Docker → ECR → EC2 (port 3001) → nginx reverse proxy at /focus-group
```

| Layer | Technology | Notes |
|-------|-----------|-------|
| Runtime | Node.js 20 | Standalone Next.js output |
| Styling | Tailwind CSS 4 | PostCSS plugin, `class-variance-authority` |
| Components | shadcn/ui + Radix | Button, Card, Input, Textarea, Checkbox, Select |
| Database | Neon PostgreSQL | Serverless driver with WebSocket adapter |
| ORM | Prisma 6 | `driverAdapters` preview feature |
| Container | Docker multi-stage | base → deps → builder → runner |
| Hosting | EC2 t3.small | us-east-1, Ubuntu 22.04 |
| Registry | AWS ECR | Manual push, no auto-deploy |
| Proxy | nginx | Routes `/focus-group/*` → `localhost:3001` |

---

## User Flow (3 Screens)

### Screen 1 — Hero Landing
Blue gradient background with animated blobs. Shows product overview, Forbes Education badge, university logos (Harvard, Yale, Princeton, Duke, Brown), and CTA button "Участвовать в фокус-группе".

### Screen 2 — NDA / Confidentiality
Shield icon, amber warning banner ("Закрытая фокус-группа по приглашению"), 3-paragraph legal text in Russian, checkbox to accept. Stores acceptance in `localStorage` key `focus_group_nda`.

### Screen 3 — 5-Step Form
Sticky header with progress bar, step-specific titles, fixed bottom navigation bar. Draft auto-saved to `localStorage` key `focus_group_draft`. On successful submit → redirects to `/success`.

### Success Page
Green checkmark, "Спасибо!" heading, info box about Telegram follow-up.

---

## Form Structure (5 Steps)

### Step 1: "О вас" (About You)
| Field | Type | Validation |
|-------|------|-----------|
| `name` | Text input | Required, trimmed |
| `telegramUsername` | Text input | Required, auto-prefixed with `@` |
| `age` | Number input | Required, 14–25 |
| `city` | Text input | Required |
| `educationLevel` | Button grid | Required (9 класс / 10 класс / 11 класс / Gap Year / 1 курс) |

### Step 2: "SAT и подготовка" (SAT & Preparation)
| Field | Type | Validation |
|-------|------|-----------|
| `satTimeline` | Radio buttons | Required |
| `hasTakenSat` | Yes/No buttons | Required |
| `previousScore` | Number input | Conditional (only if hasTakenSat=true), 400–1600, step 10 |
| `weeklyHours` | Radio buttons | Required |
| `resources` | Multi-checkboxes | Optional (Khan Academy, College Board, YouTube, etc.) |

### Step 3: "Опыт подготовки" (Experience)
| Field | Type | Validation |
|-------|------|-----------|
| `whatYouLike` | Textarea | Required, 200+ chars for max score |
| `whatFrustrates` | Textarea | Required, 200+ chars for max score |

### Step 4: "Готовность" (Readiness)
| Field | Type | Validation |
|-------|------|-----------|
| `motivation` | Textarea | Required, 200+ chars for max score |
| `sessionReadiness` | Radio buttons | Required (definitely / probably / maybe / not_sure) |
| `availableDays` | Button grid (7 days) | Required, at least 1 |
| `availableTimes` | Checkboxes | Required (morning 9-12 / afternoon 12-17 / evening 17-21) |

### Step 5: "Подтверждение" (Confirmation)
| Field | Type | Validation |
|-------|------|-----------|
| `consentData` | Checkbox | Required (data processing consent) |
| `consentRecording` | Checkbox | Required (recording consent) |
| `referralSource` | Button grid | Optional (telegram_group / friend / social_media / search / other) |

---

## Scoring System

**11 categories, 105 points max.** Auto-scored on submission.

| # | Category | Max | Scoring Logic |
|---|----------|-----|---------------|
| 1 | SAT Timeline | 20 | next_3_months=20, already_taken=18, next_6_months=15, 6_to_12=8, undecided=3 |
| 2 | Weekly Hours | 15 | 3_to_7=15, 7_to_14=13, more_than_14=10, 1_to_3=8, less_than_1=3 |
| 3 | Motivation | 15 | Text length: >=200ch=15, >=100=12, >=50=8, >=20=5, <20=0 |
| 4 | Previous SAT Score | 10 | >=1400=10, >=1200=8, >=1000=6, >=800=4, else=2 (0 if not taken) |
| 5 | Session Readiness | 10 | definitely=10, probably=7, maybe=4, not_sure=1 |
| 6 | Resources Used | 10 | >=4 items=10, >=3=8, >=2=5, 1=3, 0=0 |
| 7 | Has Taken SAT | 5 | true=5, false=0 |
| 8 | What You Like | 5 | Text length: >=200ch=5, >=100=4, >=50=3, >=20=2, <20=0 |
| 9 | What Frustrates | 5 | Same as above |
| 10 | Available Days | 5 | >=5 days=5, >=3=4, >=1=2, 0=0 |
| 11 | Available Times | 5 | >=3 slots=5, >=2=4, >=1=2, 0=0 |

### Score Tiers

| Score | Tier | CSS Class |
|-------|------|-----------|
| >= 80 | Отличный кандидат | `score-excellent` |
| >= 55 | Хороший кандидат | `score-good` |
| >= 30 | Средний кандидат | `score-medium` |
| < 30 | Низкий приоритет | `score-low` |

---

## UX/UI Principles

- **Mobile-first**: all layouts designed for 320px+ screens, responsive breakpoints via Tailwind
- **Touch targets**: minimum 44px for all interactive elements (buttons, checkboxes, radio buttons)
- **Sticky navigation**: progress bar header fixed at top, action buttons fixed at bottom
- **Safe areas**: `env(safe-area-inset-*)` for iOS notch/home bar support
- **iOS zoom prevention**: `font-size: 16px` minimum on all inputs to prevent auto-zoom on focus
- **Responsive grids**: button grids wrap from 3-column to 2-column on mobile
- **Draft persistence**: form data auto-saved to `localStorage` on every field change
- **Step validation**: "Next" button only enabled when current step passes validation
- **Color scheme**: blue primary (`#3b82f6`), green success, amber warnings, red errors
- **Loading states**: submit button shows spinner during API call, disabled to prevent double-submit
- **Error display**: red error box at top of form with specific error messages from API

---

## Admin Panel

### Authentication
1. User visits `/focus-group/admin`
2. Layout checks auth by calling `GET /api/admin/stats` with cookie
3. If 401 → shows login modal (Lock icon, password input)
4. `POST /api/admin/auth` sets httpOnly cookie `admin_token` (24h, path=/focus-group)
5. Cookie format: `base64("admin:{timestamp}:{ADMIN_PASSWORD}")`

### Dashboard (`/admin`)
- **Stats cards** (4 columns): Total submissions, Average score, Selected count, Pending count
- **Filter bar**: Search (name/Telegram/city), Status dropdown, Sort toggle
- **Submissions table**: Name, Telegram, Score (with tier badge), City, Education, Timeline, Status
- **Pagination**: 50 per page
- **CSV export**: button in header, downloads `focus-group-YYYY-MM-DD.csv`

### Detail View (`/admin/{id}`)
- **Left panel** (2/3 width): Contact info, SAT prep, Experience texts, Readiness
- **Right panel** (1/3 width): Score breakdown (11 categories with points/max), Management card
- **Management**: 5 status buttons (PENDING, SHORTLISTED, SELECTED, REJECTED, CONTACTED), notes textarea, save button

### Status Colors
| Status | Color |
|--------|-------|
| PENDING | Gray |
| SHORTLISTED | Blue |
| SELECTED | Green |
| REJECTED | Red |
| CONTACTED | Purple |

---

## API Reference

### Public Endpoints

#### `POST /api/submit`
Submit a new form response.

| Param | Type | Required | Notes |
|-------|------|----------|-------|
| (FormData body) | JSON | Yes | All form fields |

**Responses:**
- `200`: `{ id: string, score: number }`
- `400`: `{ error: "Заполните все обязательные поля" }`
- `409`: `{ error: "Заявка с таким Telegram уже существует..." }`
- `429`: `{ error: "Слишком много заявок. Попробуйте через час." }`
- `500`: `{ error: "Ошибка сервера" }`

#### `GET /api/health`
Health check. Returns `{ ok: true }`.

### Admin Endpoints (cookie auth required)

#### `POST /api/admin/auth`
Authenticate admin. Body: `{ password: string }`. Sets `admin_token` cookie.

#### `GET /api/admin/submissions`
List submissions with pagination, filtering, and sorting.

| Param | Default | Options |
|-------|---------|---------|
| `page` | 1 | Any positive integer |
| `limit` | 50 | 1–400 |
| `status` | ALL | PENDING, SHORTLISTED, SELECTED, REJECTED, CONTACTED |
| `search` | — | Searches name, telegramUsername, city (case-insensitive) |
| `sort` | score_desc | score_desc, score_asc, date_desc, date_asc |

**Response:** `{ submissions, total, page, limit }`

#### `GET /api/admin/submissions/{id}`
Get full submission details. Returns `Submission` object.

#### `PATCH /api/admin/submissions/{id}`
Update submission. Body: `{ status?: SubmissionStatus, adminNotes?: string }`.

#### `GET /api/admin/stats`
Dashboard statistics. Returns: `{ total, avgScore, selected, pending, byStatus[], byCity[], byTimeline[] }`.

#### `GET /api/admin/export`
CSV export of all submissions. UTF-8 BOM, semicolon delimiter, 22 columns.

---

## Database Schema

Single `Submission` model in Neon PostgreSQL:

```prisma
model Submission {
  id                String   @id @default(cuid())
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Step 1: About You
  name              String
  telegramUsername   String   @unique
  age               Int
  city              String
  educationLevel    String

  // Step 2: SAT & Preparation
  satTimeline       String
  hasTakenSat       Boolean
  previousScore     Int?
  weeklyHours       String
  resources         String[]

  // Step 3: Experience (text feedback)
  whatYouLike        String
  whatFrustrates     String

  // Step 4: Readiness
  motivation         String
  sessionReadiness   String
  availableDays      String[]
  availableTimes     String[]

  // Step 5: Confirmation
  referralSource     String?
  consentData        Boolean
  consentRecording   Boolean

  // System fields
  ipAddress          String?
  totalScore         Int
  scoreBreakdown     Json
  scorePercentage    Int
  status             SubmissionStatus @default(PENDING)
  adminNotes         String?

  // Legacy (unused)
  platformUsage      String?
  featuresUsed       String[] @default([])

  @@index([status])
  @@index([totalScore(sort: Desc)])
}

enum SubmissionStatus {
  PENDING
  SHORTLISTED
  SELECTED
  REJECTED
  CONTACTED
}
```

---

## Local Development

```bash
# 1. Clone and install
git clone https://github.com/Global-Generation/GG-Surveys.git
cd GG-Surveys
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local:
#   DATABASE_URL=postgresql://...@neon.tech/focus_group?sslmode=require
#   ADMIN_PASSWORD=focusgroup2026

# 3. Push schema to database
npx prisma db push

# 4. Start dev server
npm run dev
```

App runs at `http://localhost:3000/focus-group` (basePath is `/focus-group`).

---

## Deployment

### Build & Push to ECR

```bash
cd /Users/levavdosin/SAT-Focus-Group  # local repo directory

docker buildx build --platform linux/amd64 --provenance=false \
  -t 818034793268.dkr.ecr.us-east-1.amazonaws.com/sat-focus-group:latest \
  --push .
```

> If changes don't seem to apply, add `--no-cache` — App Runner / ECR caches `:latest` layers aggressively.

### Deploy to EC2

```bash
ECR_PASSWORD=$(aws ecr get-login-password --region us-east-1)

ssh ubuntu@18.211.149.64 "echo '$ECR_PASSWORD' | \
  sudo docker login --username AWS --password-stdin \
    818034793268.dkr.ecr.us-east-1.amazonaws.com && \
  sudo docker pull 818034793268.dkr.ecr.us-east-1.amazonaws.com/sat-focus-group:latest && \
  sudo docker stop sat-focus-group && \
  sudo docker rm sat-focus-group && \
  sudo docker run -d --name sat-focus-group --restart unless-stopped \
    -p 3001:3000 \
    -e 'DATABASE_URL=...' \
    -e 'ADMIN_PASSWORD=focusgroup2026' \
    -e 'NODE_ENV=production' \
    818034793268.dkr.ecr.us-east-1.amazonaws.com/sat-focus-group:latest"
```

**Note**: EC2 has no `aws` CLI — must generate ECR login token locally and pass via SSH.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string (pooled) |
| `DIRECT_URL` | No | Direct Neon connection for migrations |
| `ADMIN_PASSWORD` | Yes | Admin panel password (plaintext) |
| `NODE_ENV` | Yes | Set to `production` |
| `NEXT_TELEMETRY_DISABLED` | No | Set to `1` to disable telemetry |

---

## Creating New Surveys

This codebase is designed to be duplicated and customized for new survey types. To create a new survey variant using Claude Code:

### What to Change

1. **Form Steps** (`src/components/Step1.tsx` – `Step5.tsx`): Replace fields, labels, and validation for your survey topic.

2. **Scoring** (`src/lib/scoring.ts`): Define new categories, point values, and `MAX_SCORE`. Update `SCORE_LABELS` and `getScoreTier()` thresholds.

3. **Types** (`src/types/index.ts`): Update `FormData`, `ScoreBreakdown`, and field enums.

4. **Database** (`prisma/schema.prisma`): Update the `Submission` model fields to match new form data. Run `npx prisma db push`.

5. **API** (`src/app/api/submit/route.ts`): Update field extraction and validation.

6. **Content**: Hero page text, NDA text, success page text, admin column headers.

7. **Config** (`next.config.ts`): Change `basePath` from `/focus-group` to your survey path.

### What Stays the Same

- Admin panel (auth, table, detail, CSV export, stats)
- Scoring engine architecture (categories → breakdown → tiers)
- Rate limiting and Telegram deduplication
- Docker build pipeline
- Mobile-first responsive layout
- Draft persistence in localStorage

---

## Security

| Measure | Implementation |
|---------|---------------|
| Rate limiting | 1 submission per IP per hour (checked server-side) |
| Deduplication | Unique constraint on `telegramUsername` (case-insensitive) |
| Admin auth | httpOnly cookie, 24h expiry, password from env var |
| Input validation | Server-side field validation on all required fields |
| Cookie security | `httpOnly: true`, `sameSite: lax`, path-scoped to `/focus-group` |
| CSRF protection | SameSite cookie + POST-only mutation endpoints |
| SQL injection | Prisma ORM (parameterized queries) |
| XSS | React auto-escaping, no `dangerouslySetInnerHTML` |

---

## Component Tree

```
RootLayout (basePath: /focus-group)
├── / (page.tsx) ─── Screen 0-2: Hero → NDA → Form
│   ├── ProgressBar
│   ├── Step1 ... Step5
│   └── shadcn/ui: Button, Card, Input, Textarea, Checkbox, Select
├── /success (page.tsx)
└── /admin/
    ├── layout.tsx (auth check + login modal)
    ├── page.tsx (submissions list + stats + export)
    └── [id]/page.tsx (submission detail + management)

API Routes (/api):
├── submit (POST)
├── health (GET)
└── admin/
    ├── auth (POST)
    ├── submissions (GET)
    ├── submissions/[id] (GET, PATCH)
    ├── stats (GET)
    └── export (GET)
```
