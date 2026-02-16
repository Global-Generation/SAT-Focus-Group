# SAT Focus Group — Recruitment App

Closed-invite recruitment app for selecting SAT focus group participants. Collects structured responses through a 5-step form, auto-scores candidates (130 pts max), and provides an admin dashboard for review and export.

## Flow

1. **Hero Landing** — product overview with CTA
2. **NDA / Confidentiality** — consent gate (invite-only, no redistribution)
3. **5-Step Form** — personal info, SAT experience, product feedback, availability, consent
4. **Success** — confirmation with Telegram follow-up notice

## Stack

- **Frontend**: Next.js 16 (App Router), Tailwind CSS, shadcn/ui
- **ORM**: Prisma 6
- **Database**: Neon PostgreSQL
- **Deploy**: Docker → ECR → EC2 (nginx reverse proxy at `/focus-group`)

## Scoring

13 categories, 130 points max. Auto-scored on submission:

| Category | Max |
|---|---|
| SAT timeline | 20 |
| Weekly study hours | 15 |
| Platform usage | 15 |
| Motivation (text length + quality) | 15 |
| Features used | 10 |
| Previous SAT score | 10 |
| Session readiness | 10 |
| Resources used | 10 |
| Has taken SAT | 5 |
| What you like (text) | 5 |
| What frustrates (text) | 5 |
| Available days | 5 |
| Available times | 5 |

Score tiers: Excellent (100-130), Good (70-99), Medium (40-69), Low (0-39).

## Admin Panel

- **URL**: `/focus-group/admin`
- **Auth**: password from `ADMIN_PASSWORD` env var (default: `focusgroup2026`)
- **Features**: submissions table with score tiers, individual score breakdowns, deduplication by Telegram, CSV export, stats overview

## Local Development

```bash
cp .env.example .env.local  # add DATABASE_URL + ADMIN_PASSWORD
npx prisma db push
npm run dev
```

App runs at `http://localhost:3000/focus-group`.

## Deployment

```bash
# Build & push to ECR
docker buildx build --platform linux/amd64 --provenance=false \
  -t 818034793268.dkr.ecr.us-east-1.amazonaws.com/sat-focus-group:latest --push .

# Deploy to EC2
ECR_PASSWORD=$(aws ecr get-login-password --region us-east-1)
ssh ubuntu@18.211.149.64 "echo '$ECR_PASSWORD' | sudo docker login --username AWS --password-stdin 818034793268.dkr.ecr.us-east-1.amazonaws.com && \
  sudo docker pull 818034793268.dkr.ecr.us-east-1.amazonaws.com/sat-focus-group:latest && \
  sudo docker stop sat-focus-group && sudo docker rm sat-focus-group && \
  sudo docker run -d --name sat-focus-group --restart unless-stopped \
    -p 3001:3000 \
    -e 'DATABASE_URL=...' \
    -e 'ADMIN_PASSWORD=focusgroup2026' \
    -e 'NODE_ENV=production' \
    818034793268.dkr.ecr.us-east-1.amazonaws.com/sat-focus-group:latest"
```

**Live URL**: `http://ec2-18-211-149-64.compute-1.amazonaws.com/focus-group`
