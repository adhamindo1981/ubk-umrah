/*
  Warnings:

  - You are about to drop the column `pointsDeducted` on the `PayoutRequest` table. All the data in the column will be lost.
  - You are about to drop the column `iban` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Client" ADD COLUMN "phone" TEXT;

-- CreateTable
CREATE TABLE "PosterTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL DEFAULT 25000,
    "previewImageUrl" TEXT NOT NULL,
    "cleanImageUrl" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'INSTAGRAM_FEED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "MarketerPoster" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "marketerId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "customizedImageUrl" TEXT,
    "licenseKey" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MarketerPoster_marketerId_fkey" FOREIGN KEY ("marketerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MarketerPoster_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "PosterTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PayoutRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "marketerId" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "bankInfo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PayoutRequest_marketerId_fkey" FOREIGN KEY ("marketerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PayoutRequest" ("amount", "bankInfo", "createdAt", "id", "marketerId", "status", "updatedAt") SELECT "amount", "bankInfo", "createdAt", "id", "marketerId", "status", "updatedAt" FROM "PayoutRequest";
DROP TABLE "PayoutRequest";
ALTER TABLE "new_PayoutRequest" RENAME TO "PayoutRequest";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MARKETER',
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "referralCode" TEXT NOT NULL,
    "whatsapp" TEXT,
    "bankName" TEXT,
    "bankAccountNumber" TEXT,
    "bankAccountName" TEXT,
    "idNumber" TEXT,
    "parentId" INTEGER,
    "subMarketerShare" REAL NOT NULL DEFAULT 350000,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("bankName", "createdAt", "email", "id", "idNumber", "isApproved", "passwordHash", "referralCode", "role", "username") SELECT "bankName", "createdAt", "email", "id", "idNumber", "isApproved", "passwordHash", "referralCode", "role", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");
CREATE TABLE "new_Reward" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "marketerId" INTEGER NOT NULL,
    "amount" REAL NOT NULL DEFAULT 500000,
    "points" INTEGER NOT NULL DEFAULT 500,
    "description" TEXT,
    "orderId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Reward_marketerId_fkey" FOREIGN KEY ("marketerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Reward" ("createdAt", "id", "marketerId", "points") SELECT "createdAt", "id", "marketerId", "points" FROM "Reward";
DROP TABLE "Reward";
ALTER TABLE "new_Reward" RENAME TO "Reward";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "MarketerPoster_licenseKey_key" ON "MarketerPoster"("licenseKey");
