ALTER TABLE "Country"
ADD COLUMN "criteria" JSONB,
ADD COLUMN "salaryDetails" JSONB,
ADD COLUMN "informalSectorInfo" TEXT,
ADD COLUMN "formalSectorInfo" TEXT,
ADD COLUMN "requirementsDisclaimer" TEXT,
ADD COLUMN "requirementsSourceUrl" TEXT,
ADD COLUMN "requirementsReviewedAt" TIMESTAMP(3);
