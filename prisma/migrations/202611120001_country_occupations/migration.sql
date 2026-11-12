CREATE TABLE "CountryOccupation" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "gender" TEXT,
    "ageMin" INTEGER,
    "ageMax" INTEGER,
    "experienceRequirement" TEXT,
    "healthRequirement" TEXT,
    "additionalCriteria" JSONB,
    "salaryLabel" TEXT,
    "status" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CountryOccupation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CountryOccupation_countryId_slug_key" ON "CountryOccupation"("countryId", "slug");
CREATE INDEX "CountryOccupation_countryId_status_displayOrder_idx" ON "CountryOccupation"("countryId", "status", "displayOrder");
ALTER TABLE "CountryOccupation" ADD CONSTRAINT "CountryOccupation_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
