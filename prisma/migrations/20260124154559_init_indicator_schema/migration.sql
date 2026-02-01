-- CreateTable
CREATE TABLE "Indicator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "frequency" TEXT,
    "description" TEXT,
    "lastValue" REAL,
    "lastUpdated" DATETIME,
    "cachedScore" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "IndicatorValue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "indicatorId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "value" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "IndicatorValue_indicatorId_fkey" FOREIGN KEY ("indicatorId") REFERENCES "Indicator" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Indicator_code_key" ON "Indicator"("code");

-- CreateIndex
CREATE INDEX "IndicatorValue_date_idx" ON "IndicatorValue"("date");

-- CreateIndex
CREATE UNIQUE INDEX "IndicatorValue_indicatorId_date_key" ON "IndicatorValue"("indicatorId", "date");
