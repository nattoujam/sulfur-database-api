-- CreateTable
CREATE TABLE "ItemEffect" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "itemId" INTEGER NOT NULL,
    "poisonedRemovable" BOOLEAN NOT NULL DEFAULT false,
    "burningRemovable" BOOLEAN NOT NULL DEFAULT false,
    "frozenRemovable" BOOLEAN NOT NULL DEFAULT false,
    "poisonResistance" INTEGER,
    "poisonResistanceSecond" REAL,
    "fireResistance" INTEGER,
    "fireResistanceSecond" REAL,
    "frostResistance" INTEGER,
    "frostResistanceSecond" REAL,
    "electricResistance" INTEGER,
    "electricResistanceSecond" REAL,
    "slowMotionPercentage" INTEGER,
    "slowMotionSecond" REAL,
    "movementSpeedPercentage" INTEGER,
    "movementSpeedSecond" REAL,
    "dashBonus" INTEGER,
    "accuracyPercentage" INTEGER,
    "accuracySecond" REAL,
    CONSTRAINT "ItemEffect_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ItemEffect_itemId_key" ON "ItemEffect"("itemId");
