ALTER TABLE "Application"
ADD COLUMN "sector" TEXT,
ADD COLUMN "nikEncrypted" TEXT,
ADD COLUMN "birthPlace" TEXT,
ADD COLUMN "birthDate" TIMESTAMP(3),
ADD COLUMN "gender" TEXT,
ADD COLUMN "maritalStatus" TEXT,
ADD COLUMN "religion" TEXT,
ADD COLUMN "heightCm" INTEGER,
ADD COLUMN "weightKg" INTEGER,
ADD COLUMN "address" TEXT,
ADD COLUMN "rt" TEXT,
ADD COLUMN "rw" TEXT,
ADD COLUMN "village" TEXT,
ADD COLUMN "district" TEXT,
ADD COLUMN "province" TEXT,
ADD COLUMN "photoObjectKey" TEXT;

CREATE UNIQUE INDEX "Application_photoObjectKey_key" ON "Application"("photoObjectKey");
