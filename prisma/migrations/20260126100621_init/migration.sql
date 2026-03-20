/*
  Warnings:

  - You are about to drop the column `accountOwner` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `collaborator` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `locale` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `refreshTokenExpires` on the `Session` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Wishlist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "WishlistSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "enableNotifications" BOOLEAN NOT NULL DEFAULT false,
    "buttonText" TEXT NOT NULL DEFAULT 'Add to Wishlist',
    "buttonColor" TEXT NOT NULL DEFAULT '#000000'
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" DATETIME,
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT
);
INSERT INTO "new_Session" ("accessToken", "expires", "id", "isOnline", "scope", "shop", "state", "userId") SELECT "accessToken", "expires", "id", "isOnline", "scope", "shop", "state", "userId" FROM "Session";
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Wishlist_customerId_shop_productId_key" ON "Wishlist"("customerId", "shop", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "WishlistSettings_shop_key" ON "WishlistSettings"("shop");
