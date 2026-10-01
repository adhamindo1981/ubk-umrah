-- AlterTable
ALTER TABLE "User" ADD COLUMN "bankName" TEXT;
ALTER TABLE "User" ADD COLUMN "iban" TEXT;
ALTER TABLE "User" ADD COLUMN "idNumber" TEXT;

-- CreateTable
CREATE TABLE "PayoutRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "marketerId" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "pointsDeducted" INTEGER NOT NULL,
    "bankInfo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PayoutRequest_marketerId_fkey" FOREIGN KEY ("marketerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
