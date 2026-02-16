-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'SHORTLISTED', 'SELECTED', 'REJECTED', 'CONTACTED');

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "telegramUsername" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "city" TEXT NOT NULL,
    "educationLevel" TEXT NOT NULL,
    "satTimeline" TEXT NOT NULL,
    "hasTakenSat" BOOLEAN NOT NULL,
    "previousScore" INTEGER,
    "weeklyHours" TEXT NOT NULL,
    "resources" TEXT[],
    "platformUsage" TEXT NOT NULL,
    "featuresUsed" TEXT[],
    "whatYouLike" TEXT NOT NULL,
    "whatFrustrates" TEXT NOT NULL,
    "motivation" TEXT NOT NULL,
    "sessionReadiness" TEXT NOT NULL,
    "availableDays" TEXT[],
    "availableTimes" TEXT[],
    "referralSource" TEXT,
    "consentData" BOOLEAN NOT NULL,
    "consentRecording" BOOLEAN NOT NULL,
    "ipAddress" TEXT,
    "totalScore" INTEGER NOT NULL,
    "scoreBreakdown" JSONB NOT NULL,
    "scorePercentage" INTEGER NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "submissions_telegramUsername_key" ON "submissions"("telegramUsername");

-- CreateIndex
CREATE INDEX "submissions_status_idx" ON "submissions"("status");

-- CreateIndex
CREATE INDEX "submissions_totalScore_idx" ON "submissions"("totalScore" DESC);
