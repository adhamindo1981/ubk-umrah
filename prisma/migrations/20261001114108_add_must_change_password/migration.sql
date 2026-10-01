-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MARKETER',
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "referralCode" TEXT,
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
INSERT INTO "new_User" ("bankAccountName", "bankAccountNumber", "bankName", "createdAt", "email", "id", "idNumber", "isApproved", "parentId", "passwordHash", "referralCode", "role", "subMarketerShare", "username", "whatsapp") SELECT "bankAccountName", "bankAccountNumber", "bankName", "createdAt", "email", "id", "idNumber", "isApproved", "parentId", "passwordHash", "referralCode", "role", "subMarketerShare", "username", "whatsapp" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
